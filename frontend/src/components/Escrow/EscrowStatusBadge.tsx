import { Lock, Unlock, AlertCircle, Clock } from 'lucide-react';

interface EscrowStatusBadgeProps {
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  amount?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showAmount?: boolean;
}

export function EscrowStatusBadge({ 
  status, 
  amount, 
  currency = 'USDT',
  size = 'md',
  showAmount = false 
}: EscrowStatusBadgeProps) {
  const getIcon = () => {
    switch (status) {
      case 'LOCKED':
        return <Lock className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
      case 'RELEASED':
        return <Unlock className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
      case 'REFUNDED':
        return <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
      default:
        return <Clock className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'LOCKED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'RELEASED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REFUNDED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'LOCKED':
        return 'Funds Locked';
      case 'RELEASED':
        return 'Funds Released';
      case 'REFUNDED':
        return 'Funds Refunded';
      default:
        return status;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  };

  return (
    <div className={`inline-flex items-center rounded-full border font-medium ${getColor()} ${sizeClasses[size]}`}>
      {getIcon()}
      <span>{getLabel()}</span>
      {showAmount && amount !== undefined && (
        <span className="font-bold">
          {amount} {currency}
        </span>
      )}
    </div>
  );
}
