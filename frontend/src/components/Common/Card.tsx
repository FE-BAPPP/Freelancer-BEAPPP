import { motion } from 'framer-motion';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  header?: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  footer?: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  header,
  footer
}: CardProps) {
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 }
  } : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`
        bg-[#1c1c1e] rounded-xl border border-white/10 shadow-lg overflow-hidden
        ${hover ? 'hover:shadow-xl hover:border-white/20 transition-all' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {header.icon && (
              <div className="text-gray-400">{header.icon}</div>
            )}
            <div>
              <h3 className="font-bold text-white">{header.title}</h3>
              {header.subtitle && (
                <p className="text-sm text-gray-400">{header.subtitle}</p>
              )}
            </div>
          </div>
          {header.action && (
            <div>{header.action}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={header ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          {footer}
        </div>
      )}
    </Component>
  );
}
