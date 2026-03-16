import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  Scan,
  Activity,
  Play,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import * as adminApi from '../../services/adminApi';

type TabType = 'stats' | 'gas' | 'sweeps' | 'scanner';

export function AdminSweepMonitoring() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats Tab
  const [sweepStats, setSweepStats] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState('');

  // Gas Topups Tab
  const [gasTopups, setGasTopups] = useState<any[]>([]);
  const [gasFilter, setGasFilter] = useState<string>('');

  // Token Sweeps Tab
  const [tokenSweeps, setTokenSweeps] = useState<any[]>([]);
  const [sweepFilter, setSweepFilter] = useState<string>('');

  // Scanner Tab
  const [scannerStatus, setScannerStatus] = useState<any>(null);
  const [scanAddress, setScanAddress] = useState('');
  const [scanFromBlock, setScanFromBlock] = useState('');
  const [scanToBlock, setScanToBlock] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [activeTab, gasFilter, sweepFilter]);

  const loadData = async () => {
    try {
      if (activeTab === 'stats') {
        const res = await adminApi.getSweepStats();
        if (res.success) setSweepStats(res.data);
      } else if (activeTab === 'gas') {
        const res = await adminApi.getGasTopups(gasFilter || undefined, 100);
        if (res.success) setGasTopups(res.data.topups || []);
      } else if (activeTab === 'sweeps') {
        const res = await adminApi.getTokenSweeps(sweepFilter || undefined, 100);
        if (res.success) setTokenSweeps(res.data.sweeps || []);
      } else if (activeTab === 'scanner') {
        const res = await adminApi.getScannerStatus();
        if (res.success) setScannerStatus(res.data);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
    }
  };

  const handleManualSweep = async () => {
    if (!manualAddress.trim()) {
      setError('Please enter a valid address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await adminApi.manualSweepAddress(manualAddress);
      if (res.success) {
        setSuccess(`Sweep initiated for ${manualAddress}`);
        setManualAddress('');
        await loadData();
      } else {
        setError(res.message || 'Sweep failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sweep address');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAddress = async () => {
    if (!scanAddress.trim()) {
      setError('Please enter a valid address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const from = scanFromBlock ? parseInt(scanFromBlock) : undefined;
      const to = scanToBlock ? parseInt(scanToBlock) : undefined;
      const res = await adminApi.scanAddress(scanAddress, from, to);
      if (res.success) {
        setSuccess(`Scan completed for ${scanAddress}`);
        setScanAddress('');
        setScanFromBlock('');
        setScanToBlock('');
        await loadData();
      } else {
        setError(res.message || 'Scan failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan address');
    } finally {
      setLoading(false);
    }
  };

  const handleScanRange = async () => {
    if (!rangeFrom || !rangeTo) {
      setError('Please enter both from and to block numbers');
      return;
    }

    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);

    if (isNaN(from) || isNaN(to) || from >= to) {
      setError('Invalid block range');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await adminApi.scanBlockRange(from, to);
      if (res.success) {
        setSuccess(`Block range scan completed: ${from} to ${to}`);
        setRangeFrom('');
        setRangeTo('');
        await loadData();
      } else {
        setError(res.message || 'Scan failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan block range');
    } finally {
      setLoading(false);
    }
  };

  const handleResetScanner = async () => {
    if (!confirm('Reset scanner position to 50 blocks ago?')) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await adminApi.resetScannerPosition(50);
      if (res.success) {
        setSuccess('Scanner position reset successfully');
        await loadData();
      } else {
        setError(res.message || 'Reset failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset scanner');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; bg: string }> = {
      PENDING: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100' },
      SENT: { icon: Activity, color: 'text-blue-700', bg: 'bg-blue-100' },
      CONFIRMED: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      FAILED: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const tabs = [
    { id: 'stats', label: 'Sweep Stats', icon: DollarSign },
    { id: 'gas', label: 'Gas Topups', icon: Zap },
    { id: 'sweeps', label: 'Token Sweeps', icon: Target },
    { id: 'scanner', label: 'Block Scanner', icon: Scan },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            Sweep & Scanner Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Monitor USDT sweeps, gas topups, and blockchain scanning</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'stats' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Unswept Deposits</h3>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sweepStats?.unsweptDeposits || 0}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Unswept Amount</h3>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sweepStats?.unsweptAmount || '0'} USDT
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Sweep Status</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sweepStats?.isSweeping ? (
                      <span className="text-blue-600">Active</span>
                    ) : (
                      <span className="text-gray-400">Idle</span>
                    )}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Auto Sweep</h3>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sweepStats?.sweepEnabled ? (
                      <span className="text-green-600">Enabled</span>
                    ) : (
                      <span className="text-red-600">Disabled</span>
                    )}
                  </p>
                </motion.div>
              </div>

              {/* Manual Sweep */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Manual Sweep Address
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="TRON Address (T...)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleManualSweep}
                    disabled={loading || !manualAddress.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Sweep
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'gas' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Gas Topups History
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={gasFilter}
                    onChange={(e) => setGasFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SENT">SENT</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                  <button
                    onClick={loadData}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Index</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount TRX</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TX Hash</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gasTopups.length > 0 ? (
                      gasTopups.map((topup: any) => (
                        <tr key={topup.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{topup.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{topup.childIndex}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{topup.amountTrx} TRX</td>
                          <td className="px-6 py-4">{getStatusBadge(topup.status)}</td>
                          <td className="px-6 py-4">
                            {topup.txHash ? (
                              <a
                                href={`https://nile.tronscan.org/#/transaction/${topup.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm font-mono"
                              >
                                {topup.txHash.substring(0, 8)}...
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(topup.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No gas topups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sweeps' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Token Sweeps History
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={sweepFilter}
                    onChange={(e) => setSweepFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SENT">SENT</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                  <button
                    onClick={loadData}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TX Hash</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tokenSweeps.length > 0 ? (
                      tokenSweeps.map((sweep: any) => (
                        <tr key={sweep.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{sweep.id}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-gray-600">
                              {sweep.childAddress?.substring(0, 10)}...
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sweep.amount} USDT</td>
                          <td className="px-6 py-4">{getStatusBadge(sweep.status)}</td>
                          <td className="px-6 py-4">
                            {sweep.sweepTxHash ? (
                              <a
                                href={`https://nile.tronscan.org/#/transaction/${sweep.sweepTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm font-mono"
                              >
                                {sweep.sweepTxHash.substring(0, 8)}...
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600">{sweep.errorMessage || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(sweep.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          No token sweeps found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <>
              {/* Scanner Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Scanner Status</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {scannerStatus?.isScanning ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Running
                      </span>
                    ) : (
                      <span className="text-gray-400">Idle</span>
                    )}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Last Scanned</h3>
                    <Scan className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {scannerStatus?.lastScannedBlock?.toLocaleString() || '-'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Current Block</h3>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {scannerStatus?.currentBlock?.toLocaleString() || '-'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-sm font-medium">Blocks Behind</h3>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {scannerStatus?.blocksBehind?.toLocaleString() || 0}
                  </p>
                </motion.div>
              </div>

              {/* Scan Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Scan Specific Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value)}
                    placeholder="TRON Address (T...)"
                    className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={scanFromBlock}
                    onChange={(e) => setScanFromBlock(e.target.value)}
                    placeholder="From Block (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={scanToBlock}
                    onChange={(e) => setScanToBlock(e.target.value)}
                    placeholder="To Block (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleScanAddress}
                  disabled={loading || !scanAddress.trim()}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Scan Address
                </button>
              </motion.div>

              {/* Scan Block Range */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Scan Block Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    placeholder="From Block"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    placeholder="To Block"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleScanRange}
                    disabled={loading || !rangeFrom || !rangeTo}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Scan Range
                  </button>
                </div>
              </motion.div>

              {/* Reset Scanner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
                  <RotateCcw className="w-5 h-5" />
                  Reset Scanner Position
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Reset scanner position to 50 blocks ago. Use this if the scanner is stuck or needs to rescan recent blocks.
                  </p>
                  <button
                    onClick={handleResetScanner}
                    disabled={loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Reset (-50 blocks)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
