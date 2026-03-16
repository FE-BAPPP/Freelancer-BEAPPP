import { motion } from 'framer-motion';
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  onClick?: () => void;
  badge?: string;
  variant?: 'horizontal' | 'vertical';
}

export function ActionCard({ 
  icon, 
  title, 
  description, 
  color = 'bg-pink-500/10 text-pink-500', 
  onClick,
  badge,
  variant = 'horizontal'
}: ActionCardProps) {
  if (variant === 'vertical') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative p-5 bg-[#1c1c1e] border border-white/10 rounded-2xl hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all cursor-pointer flex flex-col items-center text-center gap-3 group h-full justify-center overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {badge && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
            {badge}
          </span>
        )}
        <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform relative z-10`}>
          {icon}
        </div>
        <div className="relative z-10">
          <h3 className="font-bold text-white text-sm">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative p-5 bg-[#1c1c1e] border border-white/10 rounded-2xl hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all cursor-pointer flex items-center gap-4 group overflow-hidden"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
          {badge}
        </span>
      )}
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform relative z-10`}>
        {icon}
      </div>
      <div className="flex-1 relative z-10">
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors relative z-10" />
    </motion.div>
  );
}
