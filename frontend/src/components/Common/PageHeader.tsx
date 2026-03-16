import { motion } from 'framer-motion';
import React from 'react';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  stats?: Array<{
    value: string | number;
    label: string;
  }>;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  gradient = false,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-indigo-700',
  actions,
  breadcrumb,
  stats
}: PageHeaderProps) {
  if (gradient) {
    return (
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {icon && (
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-white/80 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </motion.div>

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-white/70 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  );
}
