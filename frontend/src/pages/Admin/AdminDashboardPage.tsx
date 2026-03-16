import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/api';
import {
  Shield,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  CreditCard,
  Activity
} from 'lucide-react';

interface AdminDashboardData {
  overview: any;
  withdrawals: any;
}

export function AdminDashboardPage() {
  const [activeTab] = useState<'overview'>('overview');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [softWarn, setSoftWarn] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken') ||
        localStorage.getItem('userToken') ||
        localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }

      console.log('🔑 Fetching with token:', token.substring(0, 20) + '...');

      const overviewResponse = await adminApi.getDashboardOverview();

      if (!overviewResponse?.success) {
        setSoftWarn(overviewResponse?.message || 'Overview failed');
      } else {
        setSoftWarn(null);
      }

      setData({
        overview: overviewResponse?.data ?? null,
        withdrawals: {},
      });

    } catch (err: any) {
      console.error('Admin dashboard error:', err);
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-blue-600 border-r-blue-600"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card border-red-200 bg-red-50 p-6 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 text-lg font-semibold mb-4">Error loading admin dashboard: {error}</p>
        <button
          onClick={fetchAdminData}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </motion.div>
    );
  }

  if (!data) return null;

  const tabs = [{ id: 'overview', label: 'Overview', icon: BarChart3 }];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 border-l-4 border-l-blue-600"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Monitor and manage the USDT payment system</p>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 bg-green-50 border-green-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-gray-900 font-semibold">System Status</div>
              <div className="text-green-700 text-sm">All services operational</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-green-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 text-xs font-bold uppercase">Online</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Soft Warning */}
      {softWarn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-yellow-800"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p>{softWarn}</p>
        </motion.div>
      )}

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <OverviewTab data={data.overview} />
      </motion.div>
    </div>
  );
}

function OverviewTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Master Wallet Card */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-500" />
            Master Wallet
          </h2>
          <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border ${data?.masterWallet?.isLowBalance
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-green-100 text-green-700 border-green-200'
            }`}>
            {data?.masterWallet?.isLowBalance ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                Low Balance
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Healthy
              </>
            )}
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-1 font-medium">Wallet Address</div>
              <div className="text-gray-900 text-sm font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 select-all">
                {data?.masterWallet?.address || '—'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-1 font-medium">TRX Balance</div>
              <div className={`text-3xl font-bold ${data?.masterWallet?.isLowTrxBalance ? 'text-red-500' : 'text-gray-900'
                }`}>
                {typeof data?.masterWallet?.trxBalance === 'number'
                  ? data.masterWallet.trxBalance.toFixed(2)
                  : '0.00'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-sm mb-1 font-medium">USDT Balance</div>
              <div className={`text-3xl font-bold ${data?.masterWallet?.isLowUsdtBalance ? 'text-red-500' : 'text-green-600'
                }`}>
                {typeof data?.masterWallet?.usdtBalance === 'number'
                  ? data.masterWallet.usdtBalance.toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(() => {
          // Compute deposit / withdrawal totals and decide visibility
          const depositTotal = data?.depositScanner?.totalDepositsDetected
            ?? data?.transactionSummary?.totalDeposits
            ?? data?.transaction_summary?.totalDeposits
            ?? data?.stats?.totalDeposits
            ?? 0;

          const withdrawalTotal = data?.withdrawals?.totalVolume
            ?? data?.transactionSummary?.totalWithdrawals
            ?? data?.transaction_summary?.totalWithdrawals
            ?? data?.stats?.totalWithdrawals
            ?? 0;

          const showDeposits = typeof depositTotal === 'number' ? depositTotal !== 0 : (typeof depositTotal === 'string' ? Number(depositTotal) !== 0 : !!depositTotal);
          const showWithdrawals = typeof withdrawalTotal === 'number' ? withdrawalTotal !== 0 : (typeof withdrawalTotal === 'string' ? Number(withdrawalTotal) !== 0 : !!withdrawalTotal);

          return (
            <>
              {showDeposits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card p-6 border-l-4 border-l-green-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Deposits</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${typeof depositTotal === 'number' || typeof depositTotal === 'bigint' ? Number(depositTotal).toFixed(2) : (typeof depositTotal === 'string' && !isNaN(Number(depositTotal)) ? Number(depositTotal).toFixed(2) : '0.00')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {showWithdrawals && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-6 border-l-4 border-l-blue-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <TrendingDown className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Withdrawals</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${typeof withdrawalTotal === 'number' || typeof withdrawalTotal === 'bigint' ? Number(withdrawalTotal).toFixed(2) : (typeof withdrawalTotal === 'string' && !isNaN(Number(withdrawalTotal)) ? Number(withdrawalTotal).toFixed(2) : '0.00')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          );
        })()}
      </div>

      {/* Wallet Pool Statistics */}
      {data?.walletPool && (
        <div className="card">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Wallet Pool Statistics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Wallets</div>
                <div className="text-gray-900 text-3xl font-bold">{data.walletPool.total ?? 0}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center border border-green-100">
                <div className="text-green-600 text-xs font-semibold uppercase mb-1">Free</div>
                <div className="text-green-700 text-3xl font-bold">{data.walletPool.free ?? 0}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl text-center border border-yellow-100">
                <div className="text-yellow-600 text-xs font-semibold uppercase mb-1">Assigned</div>
                <div className="text-yellow-700 text-3xl font-bold">{data.walletPool.assigned ?? 0}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
                <div className="text-blue-600 text-xs font-semibold uppercase mb-1">Active</div>
                <div className="text-blue-700 text-3xl font-bold">{data.walletPool.active ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
