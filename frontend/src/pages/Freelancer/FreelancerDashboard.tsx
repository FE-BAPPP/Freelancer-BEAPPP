import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useApi';
import { projectApi } from '../../services/projectApi';
import { profileApi } from '../../services/profileApi';
import { proposalApi } from '../../services/proposalApi';
import {
    Briefcase,
    FileText,
    Star,
    ChevronRight,
    Wallet,
    Zap,
    DollarSign,
    Search as SearchIcon,
    MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function FreelancerDashboard() {
    const { user } = useAuth();
    const { loading: walletLoading } = useWallet();
    const [projects, setProjects] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [proposalCount, setProposalCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load recent projects
                const projectsRes = await projectApi.getFreelancerProjects(0, 5);
                if (projectsRes.success && projectsRes.data) {
                    setProjects(projectsRes.data.content);
                }

                // Load stats from profile
                const profileRes = await profileApi.getMyFreelancerProfile();
                if (profileRes.success) {
                    setStats(profileRes.data);
                }

                // Load proposal count
                try {
                    const proposalsRes = await proposalApi.getMyProposals(0, 1);
                    if (proposalsRes.success && proposalsRes.data) {
                        setProposalCount(proposalsRes.data.totalElements || 0);
                    }
                } catch (err) {
                    console.error('Failed to load proposal count:', err);
                }

            } catch (err) {
                console.error('Failed to load freelancer dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || walletLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-[#f7f7f7]">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f7f7]">
            {/* Header Section */}
            <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Chào mừng trở lại, {user?.fullName || user?.username}!</h1>
                            <p className="text-gray-400">Hôm nay bạn muốn hoàn thành công việc gì nào?</p>
                        </div>
                        <Link
                            to="/freelancer/jobs"
                            className="px-6 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-all flex items-center gap-2"
                        >
                            <Briefcase className="w-4 h-4" /> Tìm Việc Làm
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<DollarSign className="w-6 h-6 text-green-600" />}
                        label="Tổng thu nhập"
                        value={`${stats?.totalEarnings?.toFixed(2) || '0.00'} PTS`}
                        trend="Tất cả thời gian"
                    />
                    <StatCard
                        icon={<Briefcase className="w-6 h-6 text-[#007fed]" />}
                        label="Dự án đang làm"
                        value={stats?.activeProjects || 0}
                        trend="Đang tiến hành"
                    />
                    <StatCard
                        icon={<FileText className="w-6 h-6 text-purple-600" />}
                        label="Đề xuất đã gửi"
                        value={proposalCount}
                        trend="Đang cập nhật"
                    />
                    <StatCard
                        icon={<Star className="w-6 h-6 text-amber-500" />}
                        label="Đánh giá trung bình"
                        value={stats?.avgRating?.toFixed(1) || '0.0'}
                        trend={`${stats?.jobsCompleted || 0} dự án`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Projects */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Dự án gần đây</h2>
                                <Link to="/freelancer/my-projects" className="text-[#007fed] hover:underline text-sm font-bold flex items-center gap-1">
                                    Xem tất cả <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {projects.length > 0 ? (
                                    projects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <p className="text-gray-500 mb-4">Bạn chưa có dự án nào.</p>
                                        <Link to="/freelancer/jobs" className="text-[#007fed] font-bold hover:underline">Bắt đầu tìm việc ngay</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Center & Profile Status */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <Zap className="w-4 h-4 text-amber-500" /> Hoàn thiện hồ sơ
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Độ hoàn thiện</span>
                                    <span className="text-[#007fed] font-bold">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#007fed] h-full w-[85%]" />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Cập nhật thêm kỹ năng để tăng cơ hội nhận dự án lên gấp 3 lần.
                                </p>
                                <Link
                                    to="/freelancer/profile"
                                    className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-[#007fed] border border-gray-200 rounded font-bold text-sm transition-all"
                                >
                                    Cập nhật ngay
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Lối tắt nhanh</h3>
                            <div className="space-y-2">
                                <QuickLink
                                    to="/freelancer/jobs"
                                    icon={<SearchIcon className="w-4 h-4" />}
                                    label="Tìm kiếm dự án"
                                    color="bg-blue-50 text-blue-600"
                                />
                                <QuickLink
                                    to="/freelancer/wallet"
                                    icon={<Wallet className="w-4 h-4" />}
                                    label="Quản lý ví tiền"
                                    color="bg-emerald-50 text-emerald-600"
                                />
                                <QuickLink
                                    to="/freelancer/chat"
                                    icon={<MessageSquare className="w-4 h-4" />}
                                    label="Tin nhắn"
                                    color="bg-purple-50 text-purple-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend }: any) {
    return (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-[10px] text-gray-400 uppercase mt-1 tracking-wider font-bold">{trend}</p>
                </div>
            </div>
        </div>
    );
}

function ProjectCard({ project }: any) {
    return (
        <Link
            to={`/projects/${project.id}`}
            className="block p-6 hover:bg-gray-50 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#007fed] group-hover:underline transition-colors truncate max-w-[200px]">{project.jobTitle}</h3>
                        <p className="text-xs text-gray-500 mt-1">Đối tác: {project.employerName || 'N/A'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{project.agreedAmount?.toFixed(2)} PTS</p>
                    <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded uppercase font-bold mt-2 inline-block border",
                        project.status === 'ACTIVE' ? "bg-green-50 text-green-600 border-green-100" :
                            project.status === 'COMPLETED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                "bg-gray-50 text-gray-600 border-gray-100"
                    )}>
                        {project.status === 'ACTIVE' ? 'Đang chạy' :
                            project.status === 'COMPLETED' ? 'Hoàn thành' : project.status}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function QuickLink({ to, icon, label, color }: any) {
    return (
        <Link to={to} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group">
            <div className={cn("p-2 rounded", color)}>
                {icon}
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-[#007fed]">{label}</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#007fed]" />
        </Link>
    );
}
