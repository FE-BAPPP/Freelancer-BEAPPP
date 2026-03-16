"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { useWallet, useDeposits, useWithdrawals } from "../../hooks/useApi"
import { userApi } from "../../services/api"
import { QRCodeCanvas } from "qrcode.react"
import {
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  WalletIcon,
  Copy,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  DollarSign
} from "lucide-react"


export function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useWallet()
  const {
    data: depositsData,
    loading: depositsLoading,
    error: depositsError,
    refetch: refetchDeposits,
  } = useDeposits(0, 10)
  const { data: withdrawalsData, refetch: refetchWithdrawals } = useWithdrawals(0, 10)

  // Store refetch functions in refs to avoid dependency changes
  const refetchFunctionsRef = useRef({
    refetchWallet,
    refetchDeposits,
    refetchWithdrawals
  })

  // Update refs when functions change
  useEffect(() => {
    refetchFunctionsRef.current = {
      refetchWallet,
      refetchDeposits,
      refetchWithdrawals
    }
  }, [refetchWallet, refetchDeposits, refetchWithdrawals])



  // Listen to global balance updates from NotificationContainer
  useEffect(() => {
    const handleBalanceUpdate = () => {
      setLastUpdateTime(new Date());

      // Refresh wallet data to get latest state
      setTimeout(() => {
        const { refetchWallet, refetchDeposits, refetchWithdrawals } = refetchFunctionsRef.current;
        refetchWallet();
        refetchDeposits();
        refetchWithdrawals();
      }, 1000); // Small delay to ensure backend is updated
    };

    window.addEventListener('balanceUpdate', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate as EventListener);
    };
  }, []);

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "deposit", label: "Nạp tiền", icon: ArrowDownCircle },
    { id: "withdraw", label: "Rút tiền", icon: ArrowUpCircle },
  ]

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#007fed] rounded-lg">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Ví của tôi</h1>
              <p className="text-gray-400">Quản lý thu nhập và số dư của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Balance Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                Số dư khả dụng
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                  Cập nhật: {lastUpdateTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">
                  {(walletData?.pointsAvailable ?? walletData?.pointsBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-semibold text-gray-600">PTS</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Tổng tài sản:</span>
                  <span className="text-sm font-bold text-gray-700">
                    {(walletData?.pointsBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PTS
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-xs font-bold text-amber-500 uppercase">Đang ký quỹ:</span>
                  <span className="text-sm font-bold text-amber-600">
                    {(walletData?.pointsLocked || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PTS
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                1 Point = 1 USDT tương đương
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wide">Bảo mật</div>
              </div>
              <div className="text-center px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Tức thì</div>
              </div>
              <div className="text-center px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">Xác minh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 pt-2 text-sm font-bold border-b-2 transition-colors duration-200 ${activeTab === tab.id
                ? 'border-[#007fed] text-[#007fed]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#007fed]" : "text-gray-500"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <WalletOverview depositsData={depositsData} withdrawalsData={withdrawalsData} onRefreshWithdrawals={refetchWithdrawals} />}
          {activeTab === "deposit" && (
            <DepositSection
              depositsData={depositsData}
              loading={depositsLoading}
              error={depositsError}
              onRefresh={refetchDeposits}
            />
          )}
          {activeTab === "withdraw" && (
            <WithdrawSection walletData={walletData} withdrawalsData={withdrawalsData} onSuccess={() => { refetchWallet(); refetchWithdrawals(); }} />
          )}
        </div>
      </div>
    </div>
  )
}

function WalletOverview({ depositsData, withdrawalsData, onRefreshWithdrawals }: any) {
  const statusBadge = (status: string) => {
    const s = String(status || '').toLowerCase()
    if (s.includes('completed') || s.includes('success') || s === 'confirmed') {
      return { className: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle className="w-3 h-3" />, text: 'HOÀN THÀNH' }
    }
    if (s.includes('pending') || s.includes('processing')) {
      return { className: 'bg-amber-50 text-amber-600 border-amber-200', icon: <Clock className="w-3 h-3" />, text: 'CHỜ XỬ LÝ' }
    }
    if (s.includes('failed') || s.includes('error') || s.includes('cancel')) {
      return { className: 'bg-red-50 text-red-600 border-red-200', icon: <X className="w-3 h-3" />, text: s.includes('cancel') ? 'ĐÃ HỦY' : 'THẤT BẠI' }
    }
    return { className: 'bg-blue-50 text-blue-600 border-blue-200', icon: <Clock className="w-3 h-3" />, text: status || 'KHÔNG RÕ' }
  }

  const canCancelWithdrawal = (w: any) => {
    const s = String(w?.status || '').toUpperCase()
    const noHash = !w?.txHash || String(w.txHash).length === 0
    const processedAt = w?.processedAt ? new Date(w.processedAt).getTime() : null
    const now = Date.now()
    const windowSec = Number(withdrawalsData?.limits?.confirmDelaySeconds ?? 0)
    const withinWindow = processedAt == null || (Number.isFinite(windowSec) && now < processedAt + windowSec * 1000)
    return s === 'PENDING' && noHash && withinWindow
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Recent Deposits */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-green-600" />
            Nạp tiền gần đây
          </h2>
        </div>
        <div className="p-4">
          {depositsData?.history?.content?.length > 0 ? (
            <div className="space-y-3">
              {depositsData.history.content.slice(0, 5).map((deposit: any, index: number) => {
                const badge = statusBadge(deposit.status);
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div>
                      <div className="font-bold text-gray-900">{deposit.amount} USDT</div>
                      <div className="text-xs text-gray-500">{deposit.username ? `${deposit.username} • ` : ''}{new Date(deposit.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border ${badge.className}`}>
                      {badge.icon}
                      {badge.text}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3 border border-gray-200">
                <WalletIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">Chưa có giao dịch nạp tiền</p>
              <p className="text-gray-500 text-sm">Các khoản nạp tiền sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Withdrawals */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-red-600" />
            Rút tiền gần đây
          </h2>
        </div>
        <div className="p-4">
          {withdrawalsData?.history?.content?.length > 0 ? (
            <div className="space-y-3">
              {withdrawalsData.history.content.slice(0, 5).map((withdrawal: any, index: number) => {
                const badge = statusBadge(withdrawal.status);
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div>
                      <div className="font-bold text-gray-900">{withdrawal.amount} USDT</div>
                      <div className="text-xs text-gray-500">{new Date(withdrawal.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border ${badge.className}`}>
                        {badge.icon}
                        {badge.text}
                      </div>
                      {canCancelWithdrawal(withdrawal) && (
                        <button
                          onClick={async () => {
                            const r = await userApi.cancelWithdrawal(withdrawal.id)
                            alert(r.message || (r.success ? 'Hủy thành công' : 'Hủy thất bại'))
                            if (r.success && onRefreshWithdrawals) onRefreshWithdrawals()
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                          title="Hủy rút tiền"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3 border border-gray-200">
                <WalletIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">Chưa có giao dịch rút tiền</p>
              <p className="text-gray-500 text-sm">Các khoản rút tiền sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DepositSection({ depositsData, loading, error, onRefresh }: any) {
  const [txHash, setTxHash] = useState("")
  const [statusResult, setStatusResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const address: string = useMemo(() => {
    const raw = depositsData?.address
    if (!raw) return ""
    if (typeof raw === "string") return raw
    return raw.address || raw.depositAddress || raw.usdtAddress || raw.trc20 || raw.tron || ""
  }, [depositsData])


  if (loading) return <div className="text-center py-12 text-gray-500">Đang tải thông tin nạp tiền...</div>
  if (error) return <div className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg text-center my-8">Lỗi: {error}</div>

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txHash) return
    setChecking(true)
    setStatusResult(null)
    try {
      const res = await userApi.checkDepositStatus(txHash.trim())
      setStatusResult(res)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Deposit Address */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-green-600" />
            Nạp USDT (TRC20)
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Địa chỉ nạp tiền của bạn</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg relative group">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm break-all flex-1 min-w-0 text-[#007fed] font-mono font-medium">
                      {address || "Đang tải..."}
                    </code>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => address && navigator.clipboard.writeText(address)}
                        disabled={!address}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#007fed] border border-transparent hover:border-gray-300"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRefresh && onRefresh()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#007fed] border border-transparent hover:border-gray-300"
                        title="Làm mới"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4" />
                  Lưu ý quan trọng:
                </h3>
                <ul className="text-sm text-blue-900 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                    Chỉ gửi USDT (TRC20) đến địa chỉ này
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                    Số tiền nạp tối thiểu: 10 USDT
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                    Tiền sẽ được cộng sau 1 xác nhận
                  </li>
                </ul>
              </div>
            </div>

            {address && (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                  <QRCodeCanvas value={address} size={180} />
                </div>
                <div className="text-sm font-medium text-gray-600">Quét để nạp USDT</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Deposits */}
      {depositsData?.pending?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-amber-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Giao dịch đang chờ
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {depositsData.pending.map((deposit: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-amber-200">
                  <div>
                    <div className="font-bold text-gray-900">{deposit.amount} USDT</div>
                    <div className="text-sm text-gray-600">Xác nhận: {deposit.confirmations}/1</div>
                  </div>
                  <div className="px-3 py-1 bg-amber-100 text-amber-600 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Đang chờ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Check Status */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#007fed]" />
            Kiểm tra trạng thái nạp tiền
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleCheckStatus} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã giao dịch (Transaction Hash)</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed] focus:border-[#007fed] transition-all"
                placeholder="Nhập mã giao dịch Tron"
              />
            </div>
            <button
              type="submit"
              disabled={checking || !txHash}
              className="px-6 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {checking ? "Đang kiểm tra..." : "Kiểm tra"}
            </button>
          </form>

          {statusResult && (
            <div className="mt-6 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-hidden border border-gray-700">
              <pre className="text-xs overflow-x-auto font-mono">
                {JSON.stringify(statusResult.data || statusResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WithdrawSection({ walletData, withdrawalsData, onSuccess }: any) {
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", toAddress: "" })
  const [error, setError] = useState("")
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwd, setPwd] = useState("")
  const [otp, setOtp] = useState("")
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getProfile()
        if (res?.success && res.data) {
          setTwoFAEnabled(!!(res.data as any).twoFactorEnabled)
        }
      } catch { }
    })()
  }, [])

  const availablePoints = useMemo(() => {
    const av = walletData?.pointsAvailable
    const bal = walletData?.pointsBalance ?? walletData?.points ?? walletData?.balance
    const n = typeof av === "number" ? av : Number(av ?? (typeof bal === 'number' ? bal : Number(bal || 0)))
    return Number.isFinite(n) ? n : 0
  }, [walletData])


  const limits = withdrawalsData?.limits

  // Fee preview
  const amountNumber = useMemo(() => parseFloat(withdrawForm.amount) || 0, [withdrawForm.amount])
  const feePreview = useMemo(() => {
    const fixed = Number(limits?.fixedFee ?? 0)
    const pctRaw = limits?.feePercentage
    const pctNum = typeof pctRaw === 'string' ? (parseFloat(pctRaw.replace('%', '')) || 0) / 100 : Number(pctRaw || 0)
    const variable = amountNumber * (isFinite(pctNum) ? pctNum : 0)
    const totalFee = fixed + variable
    const receive = Math.max(0, amountNumber - totalFee)
    return { totalFee, receive }
  }, [limits, amountNumber])

  const validateAndOpenPwd = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const amount = parseFloat(withdrawForm.amount)
    if (!withdrawForm.amount || !withdrawForm.toAddress) return setError("Vui lòng điền đầy đủ thông tin")
    if (isNaN(amount) || amount <= 0) return setError("Số tiền không hợp lệ")
    if (amount < (limits?.minAmount || 10)) return setError(`Số tiền rút tối thiểu là ${limits?.minAmount || 10} PTS`)
    if (amount > (limits?.maxAmount || 10000)) return setError(`Số tiền rút tối đa là ${limits?.maxAmount || 10000} PTS`)
    if (amount > availablePoints) return setError("Số dư không đủ")
    setPwd(""); setOtp(""); setPwdMsg(null); setPwdOpen(true)
  }

  const submitWithdrawWithPwd = async () => {
    if (!pwd) return setPwdMsg("Vui lòng nhập mật khẩu")
    if (twoFAEnabled && (!otp || otp.trim().length !== 6)) return setPwdMsg("Vui lòng nhập mã 2FA 6 chữ số")
    setPwdSubmitting(true)
    try {
      const createRes = await userApi.createWithdrawal({ amount: parseFloat(withdrawForm.amount), toAddress: withdrawForm.toAddress })
      if (!createRes.success) return setPwdMsg(createRes.message || "Tạo yêu cầu rút tiền thất bại")
      const wId = (createRes.data as any)?.withdrawalId || (createRes.data as any)?.id
      if (!wId) return setPwdMsg("Thiếu mã rút tiền")

      const confirmRes = await userApi.confirmWithdrawal({ withdrawalId: wId, password: pwd, twoFactorCode: twoFAEnabled ? otp.trim() : undefined })
      if (!confirmRes.success) return setPwdMsg(confirmRes.message || "Xác nhận rút tiền thất bại")

      setWithdrawForm({ amount: "", toAddress: "" })
      setPwdOpen(false)
      onSuccess && onSuccess()
      const windowSec = (confirmRes.data && ((confirmRes.data as any).cancelWindowSeconds ?? (confirmRes.data as any).cancelSeconds)) ?? withdrawalsData?.limits?.confirmDelaySeconds
      alert(`Rút tiền thành công và đang xử lý.${windowSec ? ` Bạn có thể hủy trong vòng ${windowSec}s khi trạng thái là CHỜ XỬ LÝ.` : ''}`)
    } catch (e: any) {
      setPwdMsg(e.message || "Lỗi mạng")
    } finally {
      setPwdSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-red-600" />
            Rút USDT
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={validateAndOpenPwd} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (PTS)</label>
              <div className="relative">
                <input type="number" step="0.01" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed] focus:border-[#007fed] transition-all" placeholder="Nhập số tiền" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">PTS</span>
              </div>
              <div className="text-sm text-gray-600 mt-2 flex justify-between">
                <span>Số dư khả dụng:</span>
                <span className="font-bold text-gray-900">{availablePoints.toFixed(2)} PTS</span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 mb-1">Phí dự kiến</div>
                  <div className="text-gray-900 font-bold">{feePreview.totalFee.toFixed(2)} PTS</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-600 mb-1">Bạn nhận được</div>
                  <div className="text-green-700 font-bold">{feePreview.receive.toFixed(2)} PTS</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-500 mb-1">Quy tắc phí</div>
                  <div className="text-gray-700 font-medium text-xs truncate" title={`Cố định: ${limits?.fixedFee} + Tỷ lệ: ${limits?.feePercentage}`}>
                    {Number(limits?.fixedFee ?? 0)} + {typeof limits?.feePercentage === 'string' ? limits?.feePercentage : ((Number(limits?.feePercentage || 0) * 100).toFixed(2) + '%')}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ nhận</label>
              <input type="text" value={withdrawForm.toAddress} onChange={(e) => setWithdrawForm({ ...withdrawForm, toAddress: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed] focus:border-[#007fed] transition-all" placeholder="Nhập địa chỉ USDT (TRC20)" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {limits && (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2 uppercase tracking-wide">Giới hạn rút tiền</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div><div className="text-gray-500">Tối thiểu</div><div className="text-gray-900 font-bold">{limits.minAmount || 10} PTS</div></div>
                  <div><div className="text-gray-500">Tối đa</div><div className="text-gray-900 font-bold">{limits.maxAmount || 10000} PTS</div></div>
                  <div><div className="text-gray-500">Hạn mức hàng ngày</div><div className="text-gray-900 font-bold">{limits.dailyLimit || 50000} PTS</div></div>
                </div>
              </div>
            )}

            <button type="submit" disabled={pwdSubmitting} className="w-full py-4 text-lg font-bold bg-[#007fed] text-white rounded-lg hover:bg-[#006bb3] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Yêu cầu rút tiền</button>
          </form>
        </div>
      </div>


      {pwdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Xác nhận rút tiền</h3>
                <button onClick={() => setPwdOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Vui lòng nhập mật khẩu{twoFAEnabled ? ' và mã 2FA' : ''} để xác nhận rút <strong className="text-gray-900">{withdrawForm.amount} PTS</strong> đến <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-[#007fed]">{withdrawForm.toAddress.substring(0, 6)}...</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed] focus:border-[#007fed] transition-all" placeholder="Mật khẩu của bạn" autoFocus />
                </div>

                {twoFAEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã 2FA</label>
                    <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed] focus:border-[#007fed] transition-all text-center tracking-widest text-lg" placeholder="000000" />
                  </div>
                )}
              </div>

              {pwdMsg && (<div className="text-sm text-red-600 mt-4 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {pwdMsg}</div>)}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setPwdOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">Hủy</button>
                <button onClick={submitWithdrawWithPwd} disabled={pwdSubmitting} className="flex-1 px-4 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] shadow-sm disabled:opacity-50 transition-all">
                  {pwdSubmitting ? 'Đang xác nhận...' : 'Xác nhận rút tiền'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}