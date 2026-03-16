import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  default: 'bg-white/5 text-gray-400 border-white/10',
  primary: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot,
  className = ''
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-emerald-400' :
          variant === 'warning' ? 'bg-amber-400' :
          variant === 'error' ? 'bg-red-400' :
          variant === 'info' ? 'bg-blue-400' :
          variant === 'primary' ? 'bg-pink-400' :
          'bg-gray-400'
        }`} />
      )}
      {icon}
      {children}
    </span>
  );
}

// Status badge helper for common statuses
export function StatusBadge({ status }: { status: string }) {
  const s = String(status || '').toLowerCase();
  
  let variant: BadgeVariant = 'default';
  let label = status;
  
  if (s.includes('completed') || s.includes('success') || s === 'confirmed' || s === 'approved') {
    variant = 'success';
    label = s.includes('approved') ? 'APPROVED' : 'COMPLETED';
  } else if (s.includes('pending') || s.includes('processing') || s === 'in_progress' || s === 'in progress') {
    variant = s === 'in_progress' || s === 'in progress' ? 'info' : 'warning';
    label = s === 'in_progress' || s === 'in progress' ? 'IN PROGRESS' : 'PENDING';
  } else if (s.includes('failed') || s.includes('error') || s.includes('cancel') || s.includes('reject')) {
    variant = 'error';
    label = s.includes('cancel') ? 'CANCELED' : s.includes('reject') ? 'REJECTED' : 'FAILED';
  } else if (s === 'open' || s === 'active') {
    variant = 'info';
    label = s.toUpperCase();
  }
  
  return <Badge variant={variant} dot>{label}</Badge>;
}
