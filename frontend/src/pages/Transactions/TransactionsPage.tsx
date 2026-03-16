"use client"

import { useEffect, useState } from "react"
import { useTransactions, useWithdrawalHistory } from "../../hooks/useApi"
import { userApi, API_BASE_URL, authHelper } from "../../services/api"
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react"

export function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "deposits" | "withdrawals">("all")
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 20

  const { data: allTransactions, loading: allLoading, error: allError } = useTransactions(currentPage, pageSize)
  const {
    data: withdrawalHistory,
    loading: withdrawalLoading,
    error: withdrawalError,
  } = useWithdrawalHistory(currentPage, pageSize)
  const [summary, setSummary] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTx, setDetailTx] = useState<any | null>(null)

  useEffect(() => {
    // Load 30-day summary
    ; (async () => {
      const res = await userApi.getTransactionSummary(30)
      if (res.success) setSummary(res.data)
    })()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-600 border border-green-200"
      case "PENDING":
        return "bg-amber-50 text-amber-600 border border-amber-200"
      case "FAILED":
        return "bg-red-50 text-red-600 border border-red-200"
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-3 h-3" />
      case "PENDING":
        return <Clock className="w-3 h-3" />
      case "FAILED":
        return <XCircle className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownCircle className="w-5 h-5 text-green-600" />
      case "WITHDRAWAL":
        return <ArrowUpCircle className="w-5 h-5 text-red-600" />
      case "TRANSFER":
        return <History className="w-5 h-5 text-blue-600" />
      case "SWEEP":
        return <BarChart3 className="w-5 h-5 text-purple-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const formatPts = (n: number) => {
    const num = typeof n === "number" ? n : Number(n || 0)
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  const renderTransactionTable = (transactions: any[], loading: boolean, error: string | null) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Đang tải giao dịch...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">Lỗi tải giao dịch: {error}</p>
        </div>
      )
    }

    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy giao dịch</p>
          <p className="text-gray-500 text-sm">Các giao dịch của bạn sẽ hiển thị ở đây</p>
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Loại</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Số tiền</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Trạng thái</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Ngày</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Mã giao dịch / Địa chỉ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx: any) => {
                const type = String(tx.transactionType || "WITHDRAWAL").toUpperCase()
                const clickable = type === "WITHDRAWAL"
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (clickable) {
                        setDetailTx(tx)
                        setDetailOpen(true)
                      }
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(tx.transactionType || "WITHDRAWAL")}
                        <span className="text-gray-900 font-medium">{tx.transactionType || "WITHDRAWAL"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-bold">
                        <span>{typeof tx.amount !== "undefined" ? tx.amount : (typeof tx.netAmount !== "undefined" ? tx.netAmount : 0)} pts</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status || tx.state || "")}`}
                      >
                        {getStatusIcon(tx.status || tx.state || "")}
                        {tx.status || tx.state || ""}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-900">{new Date(tx.createdAt || tx.time || Date.now()).toLocaleDateString('vi-VN')}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(tx.createdAt || tx.time || Date.now()).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {tx.txHash ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 font-mono text-xs">
                            {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 10)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`https://nile.tronscan.org/#/transaction/${tx.txHash}`, "_blank") }}
                            className="flex items-center gap-1 text-[#007fed] hover:text-[#006bb3] text-xs transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Xem
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">{tx.toAddress || "Đang chờ"}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Withdrawal Details Modal */}
        {detailOpen && detailTx && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 text-lg font-bold flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    Chi tiết rút tiền
                  </h3>
                  <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {(() => {
                  const fee = typeof detailTx.fee !== 'undefined' ? Number(detailTx.fee) : undefined
                  const net = typeof detailTx.netAmount !== 'undefined' ? Number(detailTx.netAmount) : undefined
                  let amount: number
                  if (typeof detailTx.amount !== 'undefined') amount = Number(detailTx.amount)
                  else if (typeof net === 'number' && typeof fee === 'number') amount = net + fee
                  else amount = Number(net || 0)

                  return (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yêu cầu</span>
                        <span className="text-gray-900 font-medium">{amount} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí</span>
                        <span className="text-gray-900 font-medium">{typeof fee === 'number' ? fee : '-'} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhận được</span>
                        <span className="text-gray-900 font-medium">{typeof net === 'number' ? net : (amount && typeof fee === 'number' ? amount - fee : '-')} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái</span>
                        <span className="text-gray-900 font-medium">{detailTx.status || detailTx.state || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(detailTx.createdAt || detailTx.time || Date.now()).toLocaleDateString('vi-VN')} {new Date(detailTx.createdAt || detailTx.time || Date.now()).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Địa chỉ nhận</span>
                        <span className="text-gray-700 break-all text-right">{detailTx.toAddress || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Giao dịch</span>
                        {detailTx.txHash ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-mono text-xs">
                              {detailTx.txHash.substring(0, 10)}...{detailTx.txHash.substring(detailTx.txHash.length - 10)}
                            </span>
                            <button
                              onClick={() => window.open(`https://nile.tronscan.org/#/transaction/${detailTx.txHash}`, '_blank')}
                              className="flex items-center gap-1 text-[#007fed] hover:text-[#006bb3] text-xs transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Xem
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Đang chờ</span>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <div className="flex justify-end mt-6">
                  <button onClick={() => setDetailOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg font-medium">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const daysBack = 30
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000
  const toNum = (v: any) => (typeof v === "number" ? v : Number(v || 0))
  const sumListByFields = (arr: any[], fields: string[]) =>
    arr.reduce((acc, item) => {
      const val = fields.find((f) => typeof item?.[f] !== "undefined")
      return acc + toNum(val ? item[val as keyof typeof item] : 0)
    }, 0)
  const parseMaybeArraySum = (val: any, preferFields: string[], fallback = 0) => {
    if (typeof val === "number") return val
    if (Array.isArray(val)) {
      if (val.length === 0) return 0
      if (typeof val[0] === "number") return (val as number[]).reduce((a, b) => a + b, 0)
      return sumListByFields(val as any[], preferFields)
    }
    return fallback
  }

  const depositSumFromSummary = summary
    ?
    toNum(summary.totalDepositAmount ?? summary.depositSum ?? summary.depositAmount ?? Number.NaN) ||
    parseMaybeArraySum(summary.deposits, ["amount", "netAmount", "value", "points"], 0)
    : 0
  const withdrawalSumFromSummary = summary
    ?
    toNum(
      summary.totalWithdrawalAmount ??
      summary.withdrawalSum ??
      summary.withdrawalAmount ??
      summary.totalWithdrawalAmount ??
      Number.NaN,
    ) ||
    parseMaybeArraySum(summary.withdrawals, ["netAmount", "amount", "value", "points"], 0)
    : 0

  const localDepositSum = (() => {
    const txs = allTransactions?.content || []
    return txs
      .filter((tx: any) => (tx.transactionType || "").toUpperCase() === "DEPOSIT")
      .filter((tx: any) => new Date(tx.createdAt || tx.time || 0).getTime() >= cutoff)
      .reduce((acc: number, tx: any) => acc + toNum(typeof tx.amount !== "undefined" ? tx.amount : tx.netAmount), 0)
  })()
  const localWithdrawalSum = (() => {
    const list = withdrawalHistory?.content || []
    return list
      .filter((w: any) => new Date(w.createdAt || w.time || 0).getTime() >= cutoff)
      .reduce((acc: number, w: any) => acc + toNum(typeof w.amount !== "undefined" ? w.amount : w.netAmount), 0)
  })()

  const depositsSum30d =
    Number.isFinite(depositSumFromSummary) && depositSumFromSummary > 0 ? depositSumFromSummary : localDepositSum
  const withdrawalsSum30d =
    Number.isFinite(withdrawalSumFromSummary) && withdrawalSumFromSummary > 0
      ? withdrawalSumFromSummary
      : localWithdrawalSum
  const netVolume30d = depositsSum30d - withdrawalsSum30d

  const handleExportCsv = async () => {
    try {
      setExporting(true)
      const token = authHelper.getUserToken()
      const res = await fetch(`${API_BASE_URL}/api/transactions/export?format=csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "transactions.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#007fed] rounded-lg">
              <History className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Lịch sử giao dịch</h1>
              <p className="text-gray-400">Xem tất cả giao dịch nạp tiền, rút tiền và chuyển khoản</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 p-2 bg-white rounded-lg border border-gray-200 mb-8">
          {[
            { id: "all", label: "Tất cả giao dịch", icon: FileText },
            { id: "deposits", label: "Nạp tiền", icon: ArrowDownCircle },
            { id: "withdrawals", label: "Rút tiền", icon: ArrowUpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 min-w-0 ${activeTab === tab.id
                ? "bg-[#007fed] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#007fed]" />
                Tổng quan
              </h2>
              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 rounded-lg disabled:opacity-50 transition-all duration-300 font-medium"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Đang xuất..." : "Xuất CSV"}
              </button>
            </div>
            {
              (summary || allTransactions || withdrawalHistory) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-600 text-sm font-bold">Tổng nạp</p>
                        <p className="text-green-500 text-xs">30 ngày qua</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-3xl font-bold">{formatPts(depositsSum30d)}</div>
                    <div className="text-green-500 text-sm font-medium">pts</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-red-600 text-sm font-bold">Tổng rút</p>
                        <p className="text-red-500 text-xs">30 ngày qua</p>
                      </div>
                    </div>
                    <div className="text-red-600 text-3xl font-bold">{formatPts(withdrawalsSum30d)}</div>
                    <div className="text-red-500 text-sm font-medium">pts</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-blue-600 text-sm font-bold">Khối lượng ròng</p>
                        <p className="text-blue-500 text-xs">30 ngày qua</p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-3xl font-bold">{formatPts(netVolume30d)}</div>
                    <div className="text-blue-500 text-sm font-medium">pts</div>
                  </div>
                </div>
              )
            }
            {activeTab === "all" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                  Tất cả giao dịch
                </h2>
                {renderTransactionTable(allTransactions?.content || [], allLoading, allError)}
              </>
            )}

            {activeTab === "deposits" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowDownCircle className="w-6 h-6 text-green-600" />
                  Lịch sử nạp tiền
                </h2>
                {renderTransactionTable(
                  allTransactions?.content?.filter((tx: any) => tx.transactionType === "DEPOSIT") || [],
                  allLoading,
                  allError,
                )}
              </>
            )}

            {activeTab === "withdrawals" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowUpCircle className="w-6 h-6 text-red-600" />
                  Lịch sử rút tiền
                </h2>
                {renderTransactionTable(withdrawalHistory?.content || [], withdrawalLoading, withdrawalError)}
              </>
            )}

            {/* Pagination */}
            {((activeTab === "all" && allTransactions?.totalPages > 1) ||
              (activeTab === "withdrawals" && withdrawalHistory?.totalPages > 1)) && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Trước
                  </button>

                  <span className="text-gray-700 font-medium">
                    Trang {currentPage + 1} / {" "}
                    {activeTab === "withdrawals" ? withdrawalHistory?.totalPages || 1 : allTransactions?.totalPages || 1}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      currentPage >=
                      (activeTab === "withdrawals"
                        ? (withdrawalHistory?.totalPages || 1) - 1
                        : (allTransactions?.totalPages || 1) - 1)
                    }
                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Sau
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
