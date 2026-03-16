import { motion } from 'framer-motion';
import React from 'react';
import { Wallet, Copy, ExternalLink, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface WelcomeHeaderProps {
  icon: React.ReactNode;
  title: string;
  userName: string;
  subtitle: string;
  walletAddress?: string;
  gradientFrom?: string;
  gradientTo?: string;
  accentColor?: string;
}

export function WelcomeHeader({
  icon,
  title,
  userName,
  subtitle,
  walletAddress,
  gradientFrom = 'from-pink-500',
  gradientTo = 'to-purple-600',
  accentColor = 'text-pink-200'
}: WelcomeHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1c1c1e] rounded-2xl p-8 text-white border border-white/10 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none`}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
      
      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="20%" y1="100%" x2="100%" y2="20%" stroke="url(#line-gradient)" strokeWidth="1" />
      </svg>

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl shadow-lg shadow-pink-500/20`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Sparkles className="w-3 h-3 text-pink-500" />
              <span>Premium Member</span>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome back, {userName}!
        </h2>
        <p className="text-gray-400 text-lg mb-6">
          {subtitle}
        </p>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>Profile views up 12%</span>
          </div>
        </div>

        {/* Wallet address */}
        {walletAddress ? (
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10">
            <div className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg">
              <Wallet className="w-4 h-4 text-pink-500" />
            </div>
            <span className="font-mono text-sm text-gray-300">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </span>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button
              onClick={copyAddress}
              className="text-gray-500 hover:text-pink-500 transition-colors p-1.5 hover:bg-white/5 rounded-lg"
              title={copied ? "Copied!" : "Copy address"}
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`https://nile.tronscan.org/#/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors p-1.5 hover:bg-white/5 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2.5 rounded-xl text-sm border border-red-500/20">
            ⚠️ Wallet Not Connected
          </div>
        )}
      </div>
    </motion.div>
  );
}
