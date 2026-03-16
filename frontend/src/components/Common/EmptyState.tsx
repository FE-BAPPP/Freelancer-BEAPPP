import { motion } from 'framer-motion';
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center ${sizeClasses[size]}`}
    >
      <div className={`${iconSizeClasses[size]} bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20`}>
        <div className="text-pink-400">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
