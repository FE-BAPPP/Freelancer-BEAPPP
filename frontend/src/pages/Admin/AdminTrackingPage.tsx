import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import { getDepositsHistory } from '../../services/adminApi';
import {
  BarChart3,
  Wallet,
  TrendingUp,
  RefreshCw,
  Zap,
  DollarSign,
  Target,
  Activity,
  Search,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

export function AdminTrackingPage() {
  const [overview, setOverview] = useState<any>(null);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [depositsPage, setDepositsPage] = useState<number>(0);
  const [depositsSize, setDepositsSize] = useState<number>(10);
  const [depositsTotalPages, setDepositsTotalPages] = useState<number>(1);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const load = async () => {
    try {
      const [ovRes, depRes] = await Promise.all([
        adminApi.getDashboardOverview(),
        getDepositsHistory(depositsPage, depositsSize)
      ]);

      if (ovRes.success) setOverview(ovRes.data);
      if (depRes.success) {
        const payload = depRes.data || {};
        setRecentDeposits(payload.deposits || payload || []);
        setDepositsTotalPages(typeof payload.totalPages === 'number' ? payload.totalPages : (payload.total_pages ?? 1));
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reload deposits when pagination changes
  useEffect(() => {
    const loadDepositsOnly = async () => {
      try {
        const depRes = await getDepositsHistory(depositsPage, depositsSize);
        if (depRes.success) {
          const payload = depRes.data || {};
          setRecentDeposits(payload.deposits || payload || []);
          setDepositsTotalPages(typeof payload.totalPages === 'number' ? payload.totalPages : (payload.total_pages ?? 1));
        }
      } catch (e) {
        console.error('Failed to load deposits page:', e);
      }
    };
    loadDepositsOnly();
  }, [depositsPage, depositsSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Tracking</h1>
          <p className="text-gray-500">Monitor deposits, wallet pools, and system operations</p>
        </div>
      </motion.div>

      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="card-header border-b border-gray-100 flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">System Overview</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Master Wallet Address */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Master Wallet</div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-gray-900 font-mono text-xs break-all bg-white px-2 py-1 rounded border border-gray-200">
                    {overview?.masterWallet?.address || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* TRX Balance */}
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Zap className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">TRX Gas Balance</div>
                <div className={`text-2xl font-bold mb-1 ${overview?.masterWallet?.isLowTrxBalance ? 'text-red-600' : 'text-gray-900'
                  }`}>
                  {typeof overview?.masterWallet?.trxBalance === 'number'
                    ? overview.masterWallet.trxBalance.toFixed(2)
                    : '0.00'}
                </div>
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Zap className="w-3 h-3 text-gray-400" /> TRON Network
                </div>
              </div>
            </div>

            {/* USDT Balance */}
            <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <DollarSign className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">USDT Holdings</div>
                <div className={`text-2xl font-bold mb-1 ${overview?.masterWallet?.isLowUsdtBalance ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {typeof overview?.masterWallet?.usdtBalance === 'number'
                    ? overview.masterWallet.usdtBalance.toFixed(2)
                    : '0.00'}
                </div>
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <DollarSign className="w-3 h-3 text-gray-400" /> TRC-20 Token
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Deposits (Left Column, larger) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2 flex flex-col"
        >
          <div className="card-header p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recent Deposits</h2>
            </div>
          </div>

          <div className="p-0 flex-1 flex flex-col">
            {recentDeposits.length ? (
              <div className="flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-500">Transaction Info</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-right">Amount</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentDeposits.map((d: any, idx: number) => (
                        <tr key={d.id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs text-gray-500 break-all max-w-xs sm:max-w-md">
                              {d.address || d.toAddress || d.from || d.to || '—'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {d.username ? <span className="font-medium text-gray-600">{d.username} • </span> : ''}
                              {new Date(d.createdAt || d.created_at || d.timestamp || Date.now()).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-green-600 whitespace-nowrap">
                              +{d.amount ?? d.value} <span className="text-xs font-normal text-gray-500">{d.asset ?? 'USDT'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                const tx = d.txHash || d.transactionHash || d.tx || d.hash;
                                if (tx) {
                                  window.open(`https://nile.tronscan.org/#/transaction/${tx}`, '_blank');
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                              title="View on TronScan"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium">No recent deposits</h3>
                <p className="text-gray-500 text-sm mt-1">Transactions will appear here automatically.</p>
              </div>
            )}

            {/* Pagination */}
            {recentDeposits.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">Page {depositsPage + 1} of {depositsTotalPages}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDepositsPage(p => Math.max(0, p - 1))}
                    disabled={depositsPage <= 0}
                    className="btn-secondary py-1 px-3 text-xs disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setDepositsPage(p => Math.min(depositsTotalPages - 1, p + 1))}
                    disabled={depositsPage >= depositsTotalPages - 1}
                    className="btn-secondary py-1 px-3 text-xs disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Wallet Pool & Sweep */}
        <div className="space-y-6">
          {/* Wallet Pool Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="card-header p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">Wallet Pool</h3>
              </div>
              <button
                disabled={!overview || isRetrying}
                onClick={async () => {
                  setIsRetrying(true);
                  const r = await adminApi.retryFailedWithdrawals();
                  setActionMsg(r.message || r.data?.message || 'Triggered');
                  setIsRetrying(false);
                  setTimeout(() => setActionMsg(null), 3000);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Retry Failed Withdrawals"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-5">
              {overview?.walletPool ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Wallets</span>
                    <span className="font-bold text-gray-900">{overview.walletPool.total ?? 0}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                      <div className="text-xl font-bold text-green-700">{overview.walletPool.free ?? 0}</div>
                      <div className="text-[10px] uppercase font-bold text-green-600 tracking-wide mt-1">Free</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-100">
                      <div className="text-xl font-bold text-yellow-700">{overview.walletPool.assigned ?? 0}</div>
                      <div className="text-[10px] uppercase font-bold text-yellow-600 tracking-wide mt-1">Assigned</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                      <div className="text-xl font-bold text-blue-700">{overview.walletPool.active ?? 0}</div>
                      <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wide mt-1">Active</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No pool data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sweep Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="card-header p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">Manual Sweep</h3>
              </div>
            </div>
            <div className="p-5">
              <ManualSweepCard onRun={async (addr) => {
                const r = await adminApi.sweepAddress(addr);
                setActionMsg(r.message || r.data?.message || 'Sweep address triggered');
                await load();
                setTimeout(() => setActionMsg(null), 3000);
              }} />
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

function ManualSweepCard({ onRun }: { onRun: (address: string) => Promise<void> }) {
  const [address, setAddress] = useState('');
  const [running, setRunning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || running) return;

    setRunning(true);
    try {
      await onRun(address.trim());
      setAddress('');
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Target Wallet Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input text-sm"
          placeholder="T..."
          disabled={running}
        />
        <p className="text-xs text-gray-400 mt-1">Funds will be swept to Master Wallet</p>
      </div>
      <button
        type="submit"
        disabled={!address.trim() || running}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sweeping...
          </>
        ) : (
          <>
            Run Sweep
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}