import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Globe, HelpCircle, Waves, Shield, Award } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#0e0e10] border-t border-white/5 pt-16 pb-8 mt-auto relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-pink-500/5 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="container-app relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Stats */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#5B8DEF] rounded-xl flex items-center justify-center shadow-lg">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Ocean Hire</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Nền tảng freelance lớn nhất thế giới với hàng triệu người dùng và dự án.
                        </p>

                        {/* Trust badges */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span>An toàn</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Award className="w-4 h-4 text-yellow-500" />
                                <span>Uy tín</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Waves className="w-4 h-4 text-[#5B8DEF]" />
                                <span>Nhanh chóng</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span>Tiếng Việt - Việt Nam</span>
                        </div>
                    </div>

                    {/* Network */}
                    <div>
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#5B8DEF] rounded-full" />
                            Mạng lưới
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/jobs" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Danh mục dịch vụ</Link></li>
                            <li><Link to="/projects" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Duyệt dự án</Link></li>
                            <li><Link to="/freelancers" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Tìm freelancer</Link></li>
                            <li><Link to="/enterprise" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Doanh nghiệp</Link></li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#5B8DEF] rounded-full" />
                            Về chúng tôi
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Giới thiệu</Link></li>
                            <li><Link to="/how-it-works" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Cách hoạt động</Link></li>
                            <li><Link to="/security" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Bảo mật</Link></li>
                            <li><Link to="/investor" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Nhà đầu tư</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-[#5B8DEF] transition-colors">Điều khoản dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Social & Apps */}
                    <div>
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#5B8DEF] rounded-full" />
                            Theo dõi chúng tôi
                        </h3>
                        <div className="flex gap-3 mb-8">
                            <a href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/30 hover:text-[#5B8DEF] text-gray-500 transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/30 hover:text-[#5B8DEF] text-gray-500 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/30 hover:text-[#5B8DEF] text-gray-500 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/30 hover:text-[#5B8DEF] text-gray-500 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                        <h3 className="font-bold text-white mb-3">Hỗ trợ</h3>
                        <Link to="/support" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[#5B8DEF] hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/30 text-sm font-medium transition-all">
                            <HelpCircle className="w-4 h-4" />
                            Trung tâm trợ giúp
                        </Link>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm">
                        © {new Date().getFullYear()} Ocean Hire. Bảo lưu mọi quyền.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-600">
                        <Link to="/privacy" className="hover:text-[#5B8DEF] transition-colors">Chính sách bảo mật</Link>
                        <Link to="/terms" className="hover:text-[#5B8DEF] transition-colors">Điều khoản và điều kiện</Link>
                        <Link to="/copyright" className="hover:text-[#5B8DEF] transition-colors">Thông tin bản quyền</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
