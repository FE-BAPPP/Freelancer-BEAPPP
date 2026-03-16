import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import { DollarSign, RefreshCw, Shield, Clock, TrendingDown, X, ChevronLeft, ChevronRight, Search, Eye, AlertCircle, CheckCircle } from 'lucide-react';

type UIStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'UNKNOWN';
type StatusFilter = 'ALL' | UIStatus;

const normalizeStatus = (status?: string): UIStatus => {
  const s = (status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'SUCCESS') return 'COMPLETED';
  if (s === 'PENDING' || s === 'PROCESSING' || s === 'IN_PROGRESS' || s === 'QUEUED') return 'PENDING';
  if (s === 'FAILED' || s === 'ERROR' || s === 'REJECTED') return 'FAILED';
  return 'UNKNOWN';
};

export function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [rawData, setRawData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const calcStats = (items: any[]) => {
    const counts = { confirmed: 0, processing: 0, failed: 0 };
    for (const w of items) {
      const st = normalizeStatus(w.status);
      if (st === 'COMPLETED') counts.confirmed++;
      else if (st === 'PENDING') counts.processing++;
      else if (st === 'FAILED') counts.failed++;
    }
    return counts;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const recentRes = await adminApi.getRecentWithdrawals(size);
      if (recentRes.success) {
        const items = recentRes.data?.withdrawals ?? recentRes.data ?? [];
        setRawData({
          recentWithdrawals: { items, page: 0, size },
          processingStats: calcStats(items),
          totalPages: null,
        });
      } else {
        const res = await adminApi.getWithdrawalsManagement(page, size);
        if (!res.success) throw new Error(res.message || res.error || 'Failed');
        const items =
          res.data?.content ??
          res.data?.items ??
          res.data?.recentWithdrawals?.items ??
          [];
        setRawData({
          ...res.data,
          processingStats: calcStats(items),
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, size]);

  const list: any[] = useMemo(() => {
    const items =
      rawData?.content ||
      rawData?.items ||
      rawData?.recentWithdrawals?.items ||
      [];
    return Array.isArray(items) ? items : [];
  }, [rawData]);

  const filtered = useMemo(() => {
    let arr = list;
    if (statusFilter !== 'ALL') {
      arr = arr.filter((w) => normalizeStatus(w.status) === statusFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      arr = arr.filter(
        (w) =>
          (w.toAddress || '').toLowerCase().includes(s) ||
          (w.username || '').toLowerCase().includes(s) ||
          String(w.userId || '').includes(s) ||
          String(w.id || '').includes(s)
      );
    }
    return arr;
  }, [list, statusFilter, search]);

  const totalPages =
    rawData?.totalPages ??
    (filtered.length > size ? Math.ceil(filtered.length / size) : 1);

  const paged = useMemo(() => {
    if (rawData?.totalPages != null) return filtered;
    const start = page * size;
    return filtered.slice(start, start + size);
  }, [filtered, page, size, rawData]);

  const badgeClass = (w: any) => {
    const ns = normalizeStatus(w.status);
    return (
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
      (ns === 'PENDING'
        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        : ns === 'COMPLETED'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : ns === 'FAILED'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-gray-50 text-gray-600 border border-gray-200')
    );
  };

  const badgeLabel = (w: any) => normalizeStatus(w.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-500">Monitor and process withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="input py-2 bg-white"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
          <button
            onClick={load}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {rawData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Confirmed Stats */}
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rawData.processingStats?.confirmed ?? 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Processing Stats */}
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Processing</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rawData.processingStats?.processing ?? 0}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>

          {/* Failed Stats */}
          <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rawData.processingStats?.failed ?? 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="card overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            {(['ALL', 'PENDING', 'COMPLETED', 'FAILED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setPage(0);
                  setStatusFilter(s);
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              placeholder="ID, user or address..."
              className="input py-2 pl-9 bg-white w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
              Loading withdrawals...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium">No withdrawals found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-500">Withdrawal Info</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">Destination</th>
                  <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500 mb-1">#{w.id}</div>
                      <div className="font-medium text-gray-900">{w.username || 'Unknown User'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(w.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{w.amount}</span>
                      <span className="text-xs text-gray-500 ml-1">USDT</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block max-w-[150px] truncate" title={w.toAddress}>
                        {w.toAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={badgeClass(w)}>{badgeLabel(w)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const tx = w.txHash || w.transactionHash || w.tx || w.hash;
                            if (tx) {
                              window.open(`https://nile.tronscan.org/#/transaction/${tx}`, '_blank');
                            } else {
                              setSelected(w);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={async () => {
                            if (!confirm('Retry this withdrawal?')) return;
                            const r = await adminApi.retryWithdrawal(w.id);
                            alert(r.success ? 'Retry triggered successfully' : 'Retry failed: ' + (r.message || r.error));
                            if (r.success) await load();
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Retry Withdrawal"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{page + 1}</span> of {totalPages ?? 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={rawData?.totalPages != null ? page >= (rawData.totalPages - 1) : filtered.length <= (page + 1) * size}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                Withdrawal Details
              </h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{selected.amount} <span className="text-sm font-normal text-gray-500">USDT</span></p>
                </div>
                <div className="text-right">
                  <span className={badgeClass(selected)}>{badgeLabel(selected)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">#{selected.id}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</p>
                  <p className="text-sm text-gray-900">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</p>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Destination Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">{selected.toAddress}</p>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Raw Data</p>
                <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-2 rounded border border-gray-200">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWithdrawalsPage;