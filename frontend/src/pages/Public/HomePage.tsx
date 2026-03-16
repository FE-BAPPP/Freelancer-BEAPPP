import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
    Search,
    ArrowRight,
    Code,
    PenTool,
    Smartphone,
    Database,
    Globe,
    Users,
    Briefcase,
    TrendingUp,
    Waves,
    Target,
    MessageSquare,
    FileText,
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { JOB_CATEGORIES } from '../../components/Jobs/types';



function HeroSection() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/browse-jobs?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section className="relative min-h-[85vh] pt-40 pb-24 overflow-hidden bg-[#f5f8fa]">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
            <div className="absolute top-40 -left-20 w-80 h-80 bg-[#5B8DEF]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#4A90E2]/5 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto px-6 relative z-10 flex items-center h-full">
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Chào mừng đến với Ocean Hire,<br />
                            nền tảng freelance cho <span className="text-[#5B8DEF]">mọi nhu cầu</span> của bạn
                        </h1>
                        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                            Tìm kiếm chuyên gia tốt nhất để thực hiện dự án
                        </p>

                        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B8DEF] transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Bạn cần dịch vụ gì?"
                                    className="w-full pl-14 pr-36 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#5B8DEF] focus:ring-4 focus:ring-[#5B8DEF]/10 text-base transition-all shadow-lg"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white font-medium rounded-lg transition-all text-sm"
                                >
                                    Tìm kiếm
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                            <span className="text-gray-500 text-xs font-medium mr-2">🔥 Phổ biến:</span>
                            {['Mạng xã hội & Marketing', 'SEO', 'Phát triển Web'].map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => {
                                        setSearchQuery(skill);
                                        navigate(`/browse-jobs?category=${encodeURIComponent(skill)}`);
                                    }}
                                    className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-gray-700 text-sm font-medium transition-all"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 max-w-5xl mx-auto border-t border-gray-200 pt-16">
                            {[
                                { icon: Users, value: '50M+', label: 'Người dùng' },
                                { icon: Briefcase, value: '10M+', label: 'Dự án đã đăng' },
                                { icon: Globe, value: '247', label: 'Quốc gia' },
                                { icon: ShieldCheck, value: '$1B+', label: 'Đã thanh toán' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#007fed] transition-all">
                                        <stat.icon className="w-6 h-6 text-[#007fed] group-hover:text-white transition-all" />
                                    </div>
                                    <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// Categories Section
function CategoriesSection() {
    const categories = [
        { icon: Code, name: 'Phát triển Web', jobs: '12,543', color: 'bg-blue-50', iconColor: 'text-blue-600' },
        { icon: Smartphone, name: 'App Di động', jobs: '8,234', color: 'bg-purple-50', iconColor: 'text-purple-600' },
        { icon: PenTool, name: 'Thiết kế UI/UX', jobs: '15,672', color: 'bg-orange-50', iconColor: 'text-orange-600' },
        { icon: MessageSquare, name: 'Viết nội dung', jobs: '9,123', color: 'bg-green-50', iconColor: 'text-green-600' },
        { icon: Database, name: 'Phân tích Dữ liệu', jobs: '5,432', color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
        { icon: TrendingUp, name: 'Mạng xã hội & Marketing', jobs: '7,890', color: 'bg-pink-50', iconColor: 'text-pink-600' },
        { icon: Globe, name: 'SEO', jobs: '4,321', color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: Target, name: 'AI & ML', jobs: '6,543', color: 'bg-teal-50', iconColor: 'text-teal-600' }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 uppercase tracking-tighter">
                    <h2 className="text-5xl font-black text-gray-900 mb-4">
                        Khám phá theo <span className="text-[#007fed]">Danh mục</span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-bold uppercase tracking-widest">
                        Tìm kiếm đối tác phù hợp nhất cho dự án của bạn
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            to={`/browse-jobs?category=${encodeURIComponent(category.name)}`}
                            className="group p-8 bg-[#f7f7f7] hover:bg-white rounded-2xl border border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                        >
                            <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">{category.name}</h3>
                            <p className="text-sm text-gray-500 font-bold mb-6">{category.jobs} công việc sẵn sàng</p>
                            <div className="flex items-center text-[#007fed] text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                Xem thêm <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

// How It Works Section
function HowItWorksSection() {
    const steps = [
        { icon: FileText, title: 'Đăng dự án', desc: 'Mô tả nhu cầu của bạn chỉ trong vài phút. Hoàn toàn miễn phí.' },
        { icon: Users, title: 'Chọn chuyên gia', desc: 'Nhận đề xuất từ các freelancer uy tín. So sánh và lựa chọn.' },
        { icon: MessageSquare, title: 'Hợp tác làm việc', desc: 'Sử dụng hệ thống chat để trao đổi và quản lý tiến độ.' },
        { icon: CreditCard, title: 'Thanh toán an toàn', desc: 'Chỉ giải ngân khi bạn hài lòng 100% với kết quả công việc.' }
    ];

    return (
        <section className="py-32 bg-[#1f2125] text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#007fed] to-transparent" />

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-black mb-4">Cách hệ thống <span className="text-[#007fed]">Hoạt động</span></h2>
                    <p className="text-lg text-gray-400 font-bold uppercase tracking-widest">Quy trình đơn giản, hiệu quả và an toàn</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="w-24 h-24 bg-white/5 group-hover:bg-[#007fed] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:rotate-6 shadow-2xl">
                                <step.icon className="w-12 h-12 text-[#007fed] group-hover:text-white transition-all" />
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-center mb-4">{step.title}</h3>
                            <p className="text-gray-400 text-center font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-24">
                    <Link to="/register" className="inline-flex items-center gap-4 px-12 py-5 bg-[#007fed] hover:bg-[#006bb3] text-white text-lg font-black rounded-xl transition-all shadow-2xl shadow-[#007fed]/40 uppercase tracking-widest">
                        Bắt đầu ngay hôm nay <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// Main HomePage Component
export function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <>
            <HeroSection />
            <CategoriesSection />

            {/* Featured Projects Section Simplified for Light Theme */}
            <section className="py-32 bg-[#f7f7f7]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="bg-white p-16 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
                        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Hàng ngàn dự án chuyên nghiệp đang chờ bạn</h2>
                        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">Kết nối cộng đồng chuyên gia hàng đầu để hiện thực hóa mọi ý tưởng kinh doanh của bạn.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/browse-jobs" className="w-full sm:w-auto px-12 py-5 bg-[#1f2125] text-white font-black rounded-2xl hover:bg-[#000] transition-all shadow-xl uppercase tracking-widest">Tìm kiếm dự án</Link>
                            <Link to="?postJob=true" className="w-full sm:w-auto px-12 py-5 bg-[#007fed] text-white font-black rounded-2xl hover:bg-[#006bb3] transition-all shadow-xl shadow-[#007fed]/30 uppercase tracking-widest">Đăng tin tuyển dụng</Link>
                        </div>
                    </div>
                </div>
            </section>

            <HowItWorksSection />

            <footer className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#5B8DEF] rounded-xl flex items-center justify-center">
                                <Waves className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">Ocean Hire</span>
                        </Link>
                        <div className="flex flex-wrap justify-center gap-12">
                            <Link to="/terms" className="text-gray-500 hover:text-[#007fed] font-black uppercase text-xs tracking-widest transition-all">Điều khoản</Link>
                            <Link to="/privacy" className="text-gray-500 hover:text-[#007fed] font-black uppercase text-xs tracking-widest transition-all">Bảo mật</Link>
                            <Link to="/help" className="text-gray-500 hover:text-[#007fed] font-black uppercase text-xs tracking-widest transition-all">Trợ giúp</Link>
                            <Link to="/contact" className="text-gray-500 hover:text-[#007fed] font-black uppercase text-xs tracking-widest transition-all">Liên hệ</Link>
                        </div>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">© 2026 Ocean Hire Inc.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
