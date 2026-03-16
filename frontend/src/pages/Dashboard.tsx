"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { userApi } from "../services/api"
import { useWallet, useTransactions, useWithdrawalHistory, usePoints } from "../hooks/useApi"
import { useNavigate } from "react-router-dom"
import {
  // Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CreditCard,
  Users,
  ArrowRight
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

export function Dashboard() {
  const { data: walletData, loading, error } = useWallet()
  const [summary, setSummary] = useState<any>(null)
  const navigate = useNavigate()
  const pageSize = 100
  const { data: txs } = useTransactions(0, pageSize)
  const { data: withdraws } = useWithdrawalHistory(0, pageSize)

  useEffect(() => {
    const load = async () => {
      const res = await userApi.getTransactionSummary(30)
      if (res.success) setSummary(res.data)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-yellow-400 border-r-yellow-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return <UserDashboard wallet={walletData} summary={summary} onNavigate={navigate} txs={txs} withdraws={withdraws} />
}

function UserDashboard({
  wallet,
  summary,
  onNavigate,
  txs,
  withdraws,
}: { wallet: any; summary: any; onNavigate: ReturnType<typeof useNavigate>; txs: any; withdraws: any }) {
  const { data: pointsData } = usePoints()
  const { user } = useAuth()

  const pointsBalance = useMemo(() => {
    const pb = wallet?.pointsBalance ?? wallet?.points ?? wallet?.balance
    const n = typeof pb === "number" ? pb : Number(pb || 0)
    return Number.isFinite(n) ? n : 0
  }, [wallet])

  const toNum = (v: any) => (typeof v === "number" ? v : Number(v || 0))
  const pickNumber = (obj: any, keys: string[]) => {
    if (!obj) return Number.NaN
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
        const n = Number(obj[k])
        if (Number.isFinite(n)) return n
      }
    }
    return Number.NaN
  }

  const sumArrayByFields = (arr: any, fields: string[]) => {
    const list = Array.isArray(arr) ? arr : (arr?.content ?? arr?.items ?? arr?.records ?? arr?.data ?? null)
    if (!Array.isArray(list)) return Number.NaN
    return list.reduce((acc, item) => {
      for (const f of fields) {
        if (typeof item?.[f] !== "undefined") {
          const n = Number(item[f])
          return acc + (Number.isFinite(n) ? n : 0)
        }
      }
      const n = Number(item)
      return acc + (Number.isFinite(n) ? n : 0)
    }, 0)
  }

  const getTime = (obj: any) => {
    const t = obj?.createdAt ?? obj?.created_at ?? obj?.time ?? obj?.timestamp ?? obj?.date
    const n = typeof t === "number" ? t : Date.parse(t || "")
    return Number.isFinite(n) ? n : 0
  }

  const getType = (obj: any) => String(obj?.transactionType ?? obj?.type ?? obj?.kind ?? obj?.direction ?? "").toUpperCase()
  const daysBack = 30
  const cutoff = useMemo(() => Date.now() - daysBack * 24 * 60 * 60 * 1000, [])

  // Local fallbacks (like TransactionsPage)
  const localDepositsSum = useMemo(() => {
    const content = txs?.content || []
    return content
      .filter((t: any) => getType(t).includes("DEPOSIT"))
      .filter((t: any) => getTime(t) >= cutoff)
      .reduce((acc: number, t: any) => acc + toNum(typeof t.amount !== "undefined" ? t.amount : t.netAmount), 0)
  }, [txs, cutoff])

  const localWithdrawSum = useMemo(() => {
    const list = withdraws?.content || []
    return list
      .filter((w: any) => getTime(w) >= cutoff)
      .reduce((acc: number, w: any) => acc + toNum(typeof w.amount !== "undefined" ? w.amount : w.netAmount), 0) // prefer gross
  }, [withdraws, cutoff])

  // Deposits sum (summary first, otherwise local)
  const depositsSum = useMemo(() => {
    let v = pickNumber(summary, ["totalDepositAmount", "depositsSum", "depositSum", "depositsTotal"]) // prefer names like TransactionsPage
    if (Number.isFinite(v)) return v
    v = sumArrayByFields(summary?.deposits ?? summary?.depositList ?? summary?.depositHistory ?? summary?.deposits30d, [
      "amount", "netAmount", "value", "points", "total",
    ])
    if (Number.isFinite(v)) return v
    return localDepositsSum
  }, [summary, localDepositsSum])

  // Withdrawals sum (prefer gross like TransactionsPage)
  const withdrawalsSum = useMemo(() => {
    let v = pickNumber(summary, ["totalWithdrawalAmount", "withdrawalsSum", "withdrawalSum", "withdrawalsTotal"]) // prefer usual keys
    if (Number.isFinite(v)) return v
    v = sumArrayByFields(summary?.withdrawals ?? summary?.withdrawalList ?? summary?.withdrawalHistory ?? summary?.withdrawals30d, [
      "amount", "netAmount", "value", "points", "total",
    ])
    if (Number.isFinite(v)) return v
    return localWithdrawSum
  }, [summary, localWithdrawSum])

  // Binance-style Net Volume: external flows only
  const netExternal = useMemo(() => depositsSum - withdrawalsSum, [depositsSum, withdrawalsSum])

  // P2P delta (optional breakdown)
  const { p2pIn, p2pOut } = useMemo(() => {
    const content = pointsData?.history?.content || []
    const currentUserId = user?.id ? String(user.id) : undefined

    const pick = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        if (typeof obj?.[k] !== 'undefined' && obj[k] !== null && obj[k] !== '') return obj[k]
      }
      return undefined
    }
    let inSum = 0, outSum = 0
    for (const t of content) {
      const when = getTime(t)
      if (when < cutoff) continue
      const txType = getType(t)
      const fromIdRaw = pick(t, 'fromUserId', 'from_user_id')
      const toIdRaw = pick(t, 'toUserId', 'to_user_id')
      const fromId = fromIdRaw != null ? String(fromIdRaw) : undefined
      const toId = toIdRaw != null ? String(toIdRaw) : undefined
      let isOutgoing: boolean | undefined
      if (currentUserId) {
        if (fromId === currentUserId) isOutgoing = true
        else if (toId === currentUserId) isOutgoing = false
      }
      if (isOutgoing === undefined) {
        if (["P2P_SEND", "SEND", "OUT", "DEBIT"].includes(txType)) isOutgoing = true
        if (["P2P_RECEIVE", "RECEIVE", "IN", "CREDIT"].includes(txType)) isOutgoing = false
      }
      const amount = toNum(pick(t, 'amount', 'points', 'value'))
      if (!Number.isFinite(amount) || amount <= 0) continue
      if (isOutgoing === true) outSum += amount
      else if (isOutgoing === false) inSum += amount
    }
    return { p2pIn: inSum, p2pOut: outSum }
  }, [pointsData, user, cutoff])

  const netInclP2P = useMemo(() => netExternal + (p2pIn - p2pOut), [netExternal, p2pIn, p2pOut])

  const formatPts = (n: number) => {
    if (!Number.isFinite(n)) return "0.00"
    const abs = Math.abs(n)
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: abs > 0 && abs < 1 ? 4 : 2,
      maximumFractionDigits: 6,
    })
    return formatter.format(n)
  }

  const netColor = netExternal > 0 ? "text-green-400" : netExternal < 0 ? "text-red-400" : "text-gray-300"

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Hero - Simplified for Light Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[#0087E0] to-[#005E9D] text-white border-none"
      >
        <div className="card-body text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">
              {formatPts(pointsBalance)} PTS
            </h1>
            <p className="opacity-90 text-lg font-medium mb-1">TOTAL BALANCE</p>
            <p className="opacity-75 text-sm">1 point = 1 USDT equivalent</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-gray-500 text-sm font-medium">Deposited (30d)</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatPts(depositsSum)} PTS</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-gray-500 text-sm font-medium">Withdrawn (30d)</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatPts(withdrawalsSum)} PTS</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-gray-500 text-sm font-medium">Net Volume</div>
            </div>
            <div className={`text-2xl font-bold ${netExternal > 0 ? "text-green-600" : netExternal < 0 ? "text-red-600" : "text-gray-900"}`}>{formatPts(netExternal)} PTS</div>
            <div className="text-xs text-gray-400 mt-1">Inclusive P2P: {formatPts(netInclP2P)} PTS</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-gray-500 text-sm font-medium">Transactions</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{txs?.totalElements || 0}</div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionCard
            icon={<ArrowDownCircle className="w-6 h-6" />}
            title="Deposit"
            description="Add funds to wallet"
            colorClass="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            iconColor="text-green-600"
            onClick={() => onNavigate("/user/wallet")}
          />
          <ActionCard
            icon={<ArrowUpCircle className="w-6 h-6" />}
            title="Withdraw"
            description="Send funds out"
            colorClass="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            iconColor="text-red-600"
            onClick={() => onNavigate("/user/wallet")}
          />
          <ActionCard
            icon={<Users className="w-6 h-6" />}
            title="Transfer"
            description="Send to other users"
            colorClass="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            iconColor="text-purple-600"
            onClick={() => onNavigate("/user/p2p")}
          />
          <ActionCard
            icon={<History className="w-6 h-6" />}
            title="History"
            description="View transactions"
            colorClass="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            iconColor="text-blue-600"
            onClick={() => onNavigate("/user/transactions")}
          />
        </div>
      </motion.div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  description,
  colorClass,
  iconColor,
  onClick
}: {
  icon: React.ReactNode
  title: string
  description: string
  colorClass: string
  iconColor: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-4 rounded-xl border transition-all duration-200 text-left ${colorClass}`}
    >
      <div className={`${iconColor} mb-2`}>
        {icon}
      </div>
      <div className="font-semibold mb-1">
        {title}
      </div>
      <div className="text-sm opacity-80">{description}</div>
    </button>
  )
}