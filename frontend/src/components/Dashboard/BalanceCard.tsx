import { motion } from 'framer-motion';
import { History, ArrowUpRight, ArrowDownLeft, Sparkles } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  currencyColor?: string;
  lockedAmount?: number;
  lockedLabel?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onManage?: () => void;
  showActions?: boolean;
}

export function BalanceCard({
  balance,
  currency = 'PTS',
  currencyColor = 'text-pink-500',
  lockedAmount,
  lockedLabel = 'Pending',
  onDeposit,
  onWithdraw,
  onManage,
  showActions = true
}: BalanceCardProps) {
  const formatBalance = (val: number) => {
    return typeof val === 'number' && isFinite(val) ? val.toFixed(2) : '0.00';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-[#1c1c1e] to-[#2a2a2e] rounded-2xl p-6 border border-white/10 flex flex-col justify-center h-full relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Available Balance
          </h3>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-white">
            {formatBalance(balance)}
          </span>
          <span className={`text-lg font-medium ${currencyColor}`}>
            {currency}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-6">1 PTS = 1 USDT</p>

        <div className="mt-auto space-y-3">
          {/* Locked/Pending amount */}
          {lockedAmount !== undefined && lockedAmount > 0 && (
            <div className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 flex items-center gap-2">
                <History className="w-4 h-4" /> {lockedLabel}
              </span>
              <span className="font-semibold text-white">
                {formatBalance(lockedAmount)} {currency}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {showActions && (
            <>
              {onDeposit && onWithdraw ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onDeposit}
                    className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={onWithdraw}
                    className="py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              ) : onManage && (
                <button
                  onClick={onManage}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  Manage Wallet
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
