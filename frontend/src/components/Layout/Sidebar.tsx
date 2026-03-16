"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import {
  LayoutDashboard,
  Briefcase,
  Search,
  FileText,
  Folder,
  User,
  Wallet,
  Users,
  BarChart3,
  Shield,
  Building,
  Send,
  MessageSquare,
  Tag,
  Star,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Zap,
  DollarSign
} from "lucide-react"
import { cn } from "../../utils/cn"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  staticMode?: boolean
}

export function Sidebar({ isOpen = true, onClose, staticMode = false }: SidebarProps) {
  const { role, logout } = useAuth()

  const getNavItems = () => {
    switch (role) {
      case "FREELANCER":
        return [
          { to: "/freelancer/dashboard", icon: LayoutDashboard, label: "Bảng điều khiển", badge: null },
          { to: "/freelancer/jobs", icon: Search, label: "Tìm việc làm", badge: "Mới" },
          { to: "/freelancer/my-proposals", icon: FileText, label: "Đề xuất của tôi", badge: null },
          { to: "/freelancer/my-projects", icon: Folder, label: "Dự án của tôi", badge: null },
          { to: "/freelancer/chat", icon: MessageSquare, label: "Tin nhắn", badge: "3" },
          { to: "/freelancer/wallet", icon: Wallet, label: "Ví tiền", badge: null },
          { to: "/freelancer/transactions", icon: BarChart3, label: "Lịch sử giao dịch", badge: null },
          { to: "/freelancer/reviews", icon: Star, label: "Đánh giá", badge: null },
          { to: "/freelancer/disputes", icon: AlertTriangle, label: "Khiếu nại", badge: null },
          { to: "/freelancer/freelancer-profile", icon: User, label: "Hồ sơ cá nhân", badge: null },
        ]

      case "EMPLOYER":
        return [
          { to: "/employer/dashboard", icon: LayoutDashboard, label: "Bảng điều khiển", badge: null },
          { to: "/employer/post-job", icon: Send, label: "Đăng việc làm", badge: null },
          { to: "/employer/my-jobs", icon: Briefcase, label: "Công việc đã đăng", badge: null },
          { to: "/employer/my-projects", icon: Folder, label: "Dự án đang làm", badge: null },
          { to: "/employer/chat", icon: MessageSquare, label: "Tin nhắn", badge: "5" },
          { to: "/employer/wallet", icon: Wallet, label: "Ví tiền", badge: null },
          { to: "/employer/transactions", icon: BarChart3, label: "Lịch sử giao dịch", badge: null },
          { to: "/employer/reviews", icon: Star, label: "Đánh giá", badge: null },
          { to: "/employer/disputes", icon: AlertTriangle, label: "Khiếu nại", badge: null },
          { to: "/employer/employer-profile", icon: Building, label: "Hồ sơ công ty", badge: null },
        ]

      case "ADMIN":
        return [
          { to: "/admin/dashboard", icon: LayoutDashboard, label: "Bảng điều khiển", badge: null },
          { to: "/admin/users", icon: Users, label: "Người dùng", badge: null },
          { to: "/admin/tracking", icon: BarChart3, label: "Theo dõi hệ thống", badge: null },
          { to: "/admin/sweep-monitoring", icon: DollarSign, label: "Sweep Monitoring", badge: null },
          { to: "/admin/withdrawals", icon: Shield, label: "Lệnh rút tiền", badge: "2" },
          { to: "/admin/disputes", icon: AlertTriangle, label: "Tranh chấp", badge: "1" },
        ]

      default:
        return []
    }
  }

  const navItems = getNavItems()

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#1c1c1e] border-r border-white/5 relative overflow-hidden">
      {/* Gradient Background Effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />

      {/* Logo Area */}
      {!staticMode && (
        <div className="h-16 flex items-center px-6 border-b border-white/5 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-lg font-bold text-white">FreelanceHub</span>
          </div>
        </div>
      )}

      {/* Pro Badge */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold text-white">Nâng cấp Pro</span>
          </div>
          <p className="text-xs text-gray-500">Trải nghiệm tính năng cao cấp và ưu tiên hỗ trợ</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.length > 0 && (
          <h3 className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Menu
          </h3>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative",
                isActive
                  ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white border border-pink-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
                    : "bg-white/5 text-gray-400 group-hover:text-white"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full",
                    item.badge === "New"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-pink-500/20 text-pink-400"
                  )}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout (Mobile Only or bottom) */}
        {!staticMode && (
          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {role?.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate">Tài khoản của tôi</p>
            <p className="text-xs text-gray-500 truncate capitalize">{role === 'FREELANCER' ? 'Người làm tự do' : role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Quản trị viên'}</p>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        </div>
      </div>
    </div>
  )

  if (staticMode) {
    return (
      <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10">
        {SidebarContent}
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={clsx(
          "fixed left-0 top-0 h-full w-64 z-50",
          !isOpen && "hidden lg:block lg:relative lg:translate-x-0 lg:w-0 lg:hidden"
        )}
      >
        {SidebarContent}
      </motion.div>
    </>
  )
}
