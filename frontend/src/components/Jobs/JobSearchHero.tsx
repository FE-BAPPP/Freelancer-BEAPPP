import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';

interface JobSearchHeroProps {
  searchKeyword: string;
  onSearchChange: (value: string) => void;
  totalElements: number;
}

export const JobSearchHero: React.FC<JobSearchHeroProps> = ({
  searchKeyword,
  onSearchChange,
  totalElements
}) => {
  return (
    <div className="relative bg-[#0e0e10] text-white overflow-hidden py-16">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-bold mb-8 shadow-lg shadow-pink-500/5"
          >
            <Sparkles className="w-4 h-4" />
            <span className="tracking-wide uppercase text-[10px]">Nền tảng freelancer Web3 hiện đại</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight"
          >
            Tìm kiếm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
              Dự án
            </span>
            <br className="hidden md:block" /> {' '}Tiếp theo của Bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed"
          >
            Tham gia cùng <span className="text-white font-bold">{totalElements.toLocaleString()}+</span> doanh nghiệp và freelancer hàng đầu trên nền tảng phi tập trung.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative flex items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl hover:border-white/20 transition-all p-1.5 group focus-within:ring-4 focus-within:ring-pink-500/10">
            <Search className="absolute left-7 w-6 h-6 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
            <input
              type="text"
              placeholder="Kỹ năng, tên dự án, hoặc lĩnh vực..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-14 pr-36 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none rounded-xl text-lg font-medium"
            />
            <div className="absolute right-3 flex items-center gap-2">
              {searchKeyword && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-2 mr-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20 active:scale-95 text-sm">
                Tìm kiếm
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-pink-400 font-black text-xl">{totalElements.toLocaleString()}</span>
            <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">Dự án mở</span>
          </div>
          <div className="w-px h-10 bg-white/5 hidden md:block" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-purple-400 font-black text-xl">24/7</span>
            <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">Hỗ trợ</span>
          </div>
          <div className="w-px h-10 bg-white/5 hidden md:block" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-blue-400 font-black text-xl">FAST</span>
            <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">Thanh toán</span>
          </div>
          <div className="w-px h-10 bg-white/5 hidden md:block" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-emerald-400 font-black text-xl">LOW</span>
            <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em]">Phí dịch vụ</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
