import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Heart,
  DollarSign,
  Star,
  ShieldCheck,
  Zap,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { Job } from '../../services/jobApi';
import { getRelativeTime, formatBudget } from './types';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSaved?: boolean;
  onSave?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  isSaved = false,
  onSave
}) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-white/[0.02] backdrop-blur-md rounded-[24px] border border-white/10 hover:border-pink-500/40 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden group shadow-2xl relative"
    >
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-pink-500/20 transition-colors" />

      <div className="p-8">
        {/* Top Row - Meta & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {getRelativeTime(job.createdAt)}
              </span>
            </div>
            {job.proposalCount !== undefined && job.proposalCount < 5 && (
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Ứng tuyển ngay</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSave?.(); }}
            className={`p-2.5 rounded-xl transition-all border ${isSaved
              ? 'text-white bg-pink-500 border-pink-500 shadow-xl shadow-pink-500/20'
              : 'text-gray-500 bg-white/5 border-white/5 hover:border-pink-500/30 hover:text-pink-400'
              }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Info */}
        <div className="mb-6">
          <h3
            onClick={onClick}
            className="text-2xl font-black text-white group-hover:text-pink-400 cursor-pointer transition-colors mb-4 leading-tight"
          >
            {job.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Giá cố định</span>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/10 to-purple-600/10 px-3 py-1.5 rounded-xl border border-pink-500/20">
              <DollarSign className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-black text-white">{formatBudget(job)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">{job.proposalCount || 0} đề xuất</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
          {job.description}
        </p>

        {/* Skills Tag Cloud */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-white/[0.03] text-gray-300 border border-white/5 group-hover:border-pink-500/20 transition-all hover:bg-pink-500/10 hover:text-pink-400"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <div className="flex items-center px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                +{job.skills.length - 4} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between group-hover:bg-white/[0.03] transition-colors">
        <div className="flex items-center gap-4">
          <div className="relative">
            {job.employerAvatar ? (
              <img
                src={job.employerAvatar}
                alt={job.employerName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/5">
                {job.employerName?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#0e0e10] p-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white">{job.employerName || 'Nhà tuyển dụng'}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-gray-400">4.9/5 RATING</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClick}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-pink-500 text-gray-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 hover:border-pink-500 shadow-lg active:scale-95"
        >
          <span>Chi tiết</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
