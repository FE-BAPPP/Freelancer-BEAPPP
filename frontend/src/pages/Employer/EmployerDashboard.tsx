import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useApi';
import { projectApi } from '../../services/projectApi';
import { profileApi } from '../../services/profileApi';
import {
  Briefcase,
  Plus,
  Users,
  ChevronRight,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function EmployerDashboard() {
  const { user } = useAuth();
  const { loading: walletLoading } = useWallet();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load recent orders/projects
        const projectsRes = await projectApi.getEmployerProjects(0, 5);
        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data.content);
        }

        // Load stats from profile
        const profileRes = await profileApi.getMyEmployerProfile();
        if (profileRes.success) {
          setStats(profileRes.data);
        }
      } catch (err) {
        console.error('Failed to load employer dashboard data:', err);
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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Xin chào, {user?.fullName || user?.username}!</h1>
              <p className="text-gray-400">Quản lý các dự án và tìm kiếm freelancer tài năng.</p>
            </div>
            <Link
              to="?postJob=true"
              className="px-6 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Đăng Dự Án Mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase className="w-6 h-6 text-[#007fed]" />}
            label="Việc đã đăng"
            value={stats?.jobsPosted || 0}
            trend="Tổng số công việc"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            label="Dự án đang làm"
            value={stats?.activeProjects || 0}
            trend="Đang tiến hành"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            label="Tổng chi tiêu"
            value={`${stats?.totalSpent?.toFixed(2) || '0.00'} PTS`}
            trend="Tất cả thời gian"
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6 text-amber-500" />}
            label="Tổng review"
            value={stats?.reviewCount || 0}
            trend="Đánh giá nhận được"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Dự án gần đây</h2>
                <Link to="/employer/my-jobs" className="text-[#007fed] hover:underline text-sm font-bold flex items-center gap-1">
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
                    <Link to="/employer/post-job" className="text-[#007fed] font-bold hover:underline">Đăng dự án ngay</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Lối tắt nhanh</h3>
              <div className="space-y-2">
                <QuickLink
                  to="?postJob=true"
                  icon={<Plus className="w-4 h-4" />}
                  label="Đăng dự án mới"
                  color="bg-blue-50 text-blue-600"
                />
                <QuickLink
                  to="/employer/my-jobs"
                  icon={<Briefcase className="w-4 h-4" />}
                  label="Quản lý dự án"
                  color="bg-purple-50 text-purple-600"
                />
                <QuickLink
                  to="/freelancer/jobs"
                  icon={<Users className="w-4 h-4" />}
                  label="Tìm freelancer"
                  color="bg-emerald-50 text-emerald-600"
                />
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Thống kê
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 text-sm font-medium">Đánh giá TB</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-gray-900">
                      {stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 text-sm font-medium">Tổng đánh giá</span>
                  <span className="font-bold text-gray-900">{stats?.reviewCount || 0}</span>
                </div>
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
      to={`/employer/jobs/${project.jobId}`}
      className="block p-6 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#007fed] group-hover:underline transition-colors truncate max-w-[200px]">{project.jobTitle}</h3>
            <p className="text-xs text-gray-500 mt-1">Freelancer: {project.freelancerName || 'N/A'}</p>
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
