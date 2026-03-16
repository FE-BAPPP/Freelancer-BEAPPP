import { motion } from 'framer-motion';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bg?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export function StatCard({ icon, title, value, bg = 'bg-white/5', trend, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      onClick={onClick}
      className={`p-5 bg-[#1c1c1e] border border-white/10 rounded-2xl flex items-center gap-4 relative overflow-hidden group ${
        onClick ? 'cursor-pointer hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all' : ''
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className={`p-3 rounded-xl ${bg} relative z-10`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-gray-500 text-sm font-medium truncate">{title}</div>
        <div className="text-white text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
            trend.positive ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}% {trend.label}
          </div>
        )}
      </div>
    </motion.div>
  );
}
