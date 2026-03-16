import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../services/notificationApi'; // Import notificationApi
import { NotificationBell } from '../notifications/NotificationBell';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { Sidebar } from './Sidebar';
import { Avatar, Badge } from '../Common';
import { profileApi } from '../../services/profileApi';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Wallet as WalletIcon,
  ChevronDown,
  Briefcase,
  FileText,
  Star,
  MessageSquare,
  LayoutDashboard,
  Search as SearchIcon,
  Folder,
  Shield,
  PlusCircle,
  Users,
  BarChart3,
  AlertTriangle,
  Receipt,
  Waves,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { JOB_CATEGORIES } from '../Jobs/types';

export function Header() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // State for unread count
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: 10, display: 'none' },
    visible: {
      opacity: 1,
      y: 0,
      display: 'block',
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  // Fetch avatar from profile
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!role) return;
      try {
        if (role === 'FREELANCER') {
          const res = await profileApi.getMyFreelancerProfile();
          if (res.success && res.data?.avatar) {
            setAvatarUrl(res.data.avatar);
          }
        } else if (role === 'EMPLOYER') {
          const res = await profileApi.getMyEmployerProfile();
          if (res.success && res.data?.avatar) {
            setAvatarUrl(res.data.avatar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      }
    };
    fetchAvatar();
  }, [role]);

  // Polling for unread notifications
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        if (res.success) {
          // Handle { count: number } response structure
          const count = (res.data as any)?.count ?? 0;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 5 seconds
    const intervalId = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const navItems = () => {
    switch (role) {
      case "FREELANCER":
        return [
          { to: "/freelancer/dashboard", icon: LayoutDashboard, label: "Bảng điều khiển" },
          { to: "/freelancer/my-proposals", icon: FileText, label: "Đề xuất của tôi" },
          { to: "/freelancer/my-projects", icon: Folder, label: "Dự án của tôi" },
          { to: "/freelancer/chat", icon: MessageSquare, label: "Tin nhắn" },
          { to: "/freelancer/reviews", icon: Star, label: "Đánh giá" },
        ];
      case "EMPLOYER":
        return [
          { to: "/employer/dashboard", icon: LayoutDashboard, label: "Bảng điều khiển" },
          { to: "/employer/my-jobs", icon: Briefcase, label: "Quản lý bài đăng" },
          { to: "/employer/my-projects", icon: Folder, label: "Quản lý hợp đồng" },
          { to: "/employer/chat", icon: MessageSquare, label: "Tin nhắn" },
          { to: "/employer/reviews", icon: Star, label: "Nhận xét/Đánh giá" },
        ];
      case "ADMIN":
        return [
          { to: "/admin/dashboard", icon: LayoutDashboard, label: "Trang quản trị" },
          { to: "/admin/users", icon: Users, label: "Quản lý người dùng" },
          { to: "/admin/tracking", icon: BarChart3, label: "Giao dịch hệ thống" },
          { to: "/admin/sweep-monitoring", icon: DollarSign, label: "Sweep Monitoring" },
          { to: "/admin/withdrawals", icon: Shield, label: "Lệnh rút tiền" },
          { to: "/admin/disputes", icon: AlertTriangle, label: "Khiếu nại/Tranh chấp" },
        ];
      default:
        return [];
    }
  };

  const items = navItems();

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full">
      {/* Primary Header */}
      <header className="bg-gradient-to-r from-[#00244d] to-[#003870] border-b border-white/5 h-16 shrink-0 transition-all duration-300 relative z-20 shadow-lg">
        <div className="container-app h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Content Area: Logo + Marketplace Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-[#5B8DEF] rounded flex items-center justify-center shadow-inner">
                    <Waves className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">Ocean Hire</span>
                </Link>
              </div>

              {/* Marketplace Nav - Visible based on role */}
              <nav className="hidden md:flex items-center gap-1">
                {/* Hire Freelancers Dropdown - Hide for Freelancers */}
                {(!user || role === 'EMPLOYER') && (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown('hire')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white flex items-center gap-1 rounded-lg transition-colors">
                      Đăng tin tuyển dụng <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'hire' ? 'rotate-180' : ''}`} />
                    </button>
                    <motion.div
                      variants={dropdownVariants}
                      animate={activeDropdown === 'hire' ? 'visible' : 'hidden'}
                      className="absolute top-full left-0 w-64 bg-[#002b5c] border border-white/10 shadow-2xl rounded-xl py-3 mt-1 backdrop-blur-xl"
                    >
                      <div className="px-4 py-2 border-b border-white/5 mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dành cho nhà tuyển dụng</p>
                      </div>
                      <Link
                        to="?postJob=true"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#5B8DEF]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Đăng tin tuyển dụng</p>
                          <p className="text-xs text-gray-500">Tìm kiếm nhân tài ngay lập tức</p>
                        </div>
                      </Link>
                    </motion.div>
                  </div>
                )}

                {/* Find Work Dropdown - Hide for Employers */}
                {(!user || role === 'FREELANCER') && (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown('work')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white flex items-center gap-1 rounded-lg transition-colors">
                      Tìm việc <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'work' ? 'rotate-180' : ''}`} />
                    </button>
                    <motion.div
                      variants={dropdownVariants}
                      animate={activeDropdown === 'work' ? 'visible' : 'hidden'}
                      className="absolute top-full left-0 w-[480px] bg-[#002b5c] border border-white/10 shadow-2xl rounded-2xl p-6 mt-1 backdrop-blur-xl"
                    >
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="col-span-2 border-b border-white/5 pb-3 mb-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục công việc</p>
                        </div>
                        {JOB_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/browse-jobs?category=${encodeURIComponent(cat.vi)}`}
                            className="group flex items-center gap-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            <div className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-[#5B8DEF] rounded-full transition-colors" />
                            {cat.vi}
                          </Link>
                        ))}
                        <div className="col-span-2 pt-4 border-t border-gray-800 mt-2">
                          <Link to="/browse-jobs" className="text-sm font-bold text-[#5B8DEF] flex items-center gap-1 hover:underline">
                            Xem tất cả công việc <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Solutions Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('solutions')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white flex items-center gap-1 rounded-lg transition-colors">
                    Giải pháp <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div
                    variants={dropdownVariants}
                    animate={activeDropdown === 'solutions' ? 'visible' : 'hidden'}
                    className="absolute top-full left-0 w-64 bg-[#002b5c] border border-white/10 shadow-2xl rounded-xl py-3 mt-1 backdrop-blur-xl"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sản phẩm & Dịch vụ</p>
                    </div>
                    <div className="px-4 py-3 opacity-30 cursor-not-allowed">
                      <p className="text-sm font-bold text-white">Doanh nghiệp</p>
                      <p className="text-xs text-gray-500">Sắp ra mắt</p>
                    </div>
                    <div className="px-4 py-3 opacity-30 cursor-not-allowed">
                      <p className="text-sm font-bold text-white">Thanh toán an toàn</p>
                      <p className="text-xs text-gray-500">Hệ thống ký quỹ (Escrow)</p>
                    </div>
                  </motion.div>
                </div>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Quick Actions (Desktop) */}
              {role === 'EMPLOYER' && (
                <Link
                  to="?postJob=true"
                  className="hidden xl:flex items-center gap-2 px-4 py-2 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white rounded-lg font-bold text-sm transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Đăng tin tuyển dụng</span>
                </Link>
              )}

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <NotificationBell
                    count={unreadCount} // Pass unread count
                    onClick={() => setShowNotifications(!showNotifications)}
                  />
                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => {
                      setShowNotifications(false);
                      setUnreadCount(0); // Optional: Reset count locally on open if desired, or let polling/read API handle it
                    }}
                  />
                </div>
              )}

              {/* User Menu or Login/Register */}
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  {role && (
                    <Badge
                      variant={
                        role === 'FREELANCER' ? 'success' :
                          role === 'EMPLOYER' ? 'info' :
                            role === 'ADMIN' ? 'error' : 'default'
                      }
                      className="hidden md:inline-flex shadow-sm"
                    >
                      {role === 'FREELANCER' ? 'FREELANCER' :
                        role === 'EMPLOYER' ? 'EMPLOYER' :
                          role === 'ADMIN' ? 'ADMIN' : role}
                    </Badge>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-gray-800"
                    >
                      <Avatar
                        src={avatarUrl}
                        name={user?.username || 'User'}
                        size="sm"
                        className="w-8 h-8 rounded-lg"
                      />
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 bg-[#002b5c] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 overflow-hidden backdrop-blur-xl"
                        >
                          <div className="px-4 py-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={avatarUrl}
                                name={user?.username || 'User'}
                                size="md"
                                className="w-12 h-12 rounded-xl"
                              />
                              <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-white truncate">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 space-y-1">
                            <Link
                              to={role === 'FREELANCER' ? '/freelancer/freelancer-profile' : role === 'EMPLOYER' ? '/employer/employer-profile' : '/profile'}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="w-4 h-4 group-hover:scale-110" />
                              <span className="text-sm font-bold">Hồ sơ cá nhân</span>
                            </Link>

                            {role !== 'ADMIN' && (
                              <>
                                <Link
                                  to={role === 'FREELANCER' ? '/freelancer/wallet' : '/employer/wallet'}
                                  className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <WalletIcon className="w-4 h-4 group-hover:scale-110" />
                                  <span className="text-sm font-bold">Ví thanh toán</span>
                                </Link>

                                <Link
                                  to={role === 'FREELANCER' ? '/freelancer/transactions' : '/employer/transactions'}
                                  className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  <Receipt className="w-4 h-4 group-hover:scale-110" />
                                  <span className="text-sm font-bold">Giao dịch</span>
                                </Link>
                              </>
                            )}

                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span className="text-sm font-bold">Thiết lập tài khoản</span>
                            </Link>
                          </div>

                          <div className="border-t border-white/5 mt-2 pt-2 px-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full group"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm font-bold">Đăng xuất</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-bold px-4 py-2 transition-all">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white text-sm font-bold rounded-lg transition-all shadow-sm">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div >
      </header >

      {/* Secondary Navigation (Sub-Header) - Only for authenticated users */}
      {
        user && role && items.length > 0 && (
          <div className="bg-gradient-to-r from-[#00244d] to-[#003870] border-b border-white/5 overflow-x-auto no-scrollbar relative z-10 shadow-md">
            <div className="container-app">
              <nav className="flex items-center h-12">
                {items.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center h-full px-5 text-sm font-bold transition-all relative whitespace-nowrap group",
                        isActive ? "text-[#5B8DEF]" : "text-gray-400 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 mr-2 transition-transform group-hover:scale-110", isActive ? "text-[#5B8DEF]" : "text-gray-500 group-hover:text-gray-300")} />
                      {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B8DEF] rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )
      }

      {/* Mobile Menu Sidebar */}
      <Sidebar isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
    </div >
  );
}
