import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/api'; // ✅ CORRECT IMPORT
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  DollarSign,
  User,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const isEmployer = role === 'EMPLOYER';

  useEffect(() => {
    loadProjects();
  }, [page, role]); // ✅ Add role as dependency

  const loadProjects = async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading projects for role:', role); // Debug
      console.log('📍 isEmployer:', isEmployer); // Debug

      const response = isEmployer
        ? await projectApi.getEmployerProjects(page, 20)
        : await projectApi.getFreelancerProjects(page, 20);

      console.log('📦 Projects Response:', response); // Debug

      if (response.success) {
        const pageData = response.data;
        console.log('✅ Projects Data:', pageData); // Debug

        setProjects(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } else {
        console.error('❌ API Error:', response.message);
      }

    } catch (error: any) {
      console.error('❌ Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200',
      COMPLETED: 'bg-green-50 text-green-600 border-green-200',
      CANCELLED: 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
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
              <h1 className="text-3xl font-bold mb-2">
                {isEmployer ? 'Dự án của tôi' : 'Lịch sử công việc'}
              </h1>
              <p className="text-gray-400">Quản lý các dự án đang thực hiện và đã hoàn thành</p>
            </div>
            <button
              onClick={loadProjects}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy dự án nào</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isEmployer
                ? 'Bạn chưa bắt đầu dự án nào.'
                : 'Bạn hiện chưa có công việc nào đang thực hiện.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-[#007fed] text-lg group-hover:underline transition-colors mb-2">
                    {project.jobTitle || `Dự án #${project.id.substring(0, 8)}`}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {project.id.substring(0, 8)}
                  </p>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(project.status)}`}>
                    {project.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                      project.status === 'COMPLETED' ? 'Hoàn thành' :
                        project.status === 'CANCELLED' ? 'Đã hủy' : project.status}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" /> Ngân sách
                    </span>
                    <span className="font-bold text-gray-900">
                      {project.agreedAmount} PTS
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-purple-600" /> Bắt đầu
                    </span>
                    <span className="text-gray-700">
                      {project.startedAt ? new Date(project.startedAt).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4 text-[#007fed]" /> {isEmployer ? 'Freelancer' : 'Khách hàng'}
                    </span>
                    <span className="text-[#007fed] font-medium">
                      {isEmployer
                        ? project.freelancerName || 'Chưa xác định'
                        : project.employerName || 'Chưa xác định'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Trước
            </button>

            <span className="text-gray-700 px-4 font-medium">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}