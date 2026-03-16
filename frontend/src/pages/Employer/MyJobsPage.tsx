import { useState, useEffect } from 'react';
import {
  Briefcase, DollarSign, Clock,
  Calendar, Eye, Plus
} from 'lucide-react';
import { jobApi, Job } from '../../services/jobApi';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const location = useLocation();

  useEffect(() => {
    loadJobs();
    window.scrollTo(0, 0);
  }, [page, location.state]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobApi.getMyJobs(page, 10);
      setJobs(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfigs: Record<string, { label: string; className: string }> = {
    'OPEN': {
      label: 'Đang mở tuyển',
      className: 'bg-green-50 text-green-600 border-green-200'
    },
    'IN_PROGRESS': {
      label: 'Đã đóng tuyển',
      className: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    'CLOSED': {
      label: 'Đã đóng tuyển',
      className: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    'COMPLETED': {
      label: 'Đã đóng tuyển',
      className: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    'CANCELLED': {
      label: 'Đã đóng tuyển',
      className: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  };

  const getStatusConfig = (status: string) => statusConfigs[status] || {
    label: status,
    className: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const formatDuration = (d: string) => {
    if (!d) return '';
    const map: any = {
      'LESS_THAN_1_WEEK': 'Dưới 1 tuần',
      '1_TO_2_WEEKS': '1-2 tuần',
      '2_TO_4_WEEKS': '2-4 tuần',
      '1_TO_3_MONTHS': '1-3 tháng',
      '3_TO_6_MONTHS': '3-6 tháng',
      'MORE_THAN_6_MONTHS': 'Trên 6 tháng'
    };
    return map[d] || d;
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-8 pb-8">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Trước
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = totalPages <= 5 ? i : (page < 3 ? i : (page > totalPages - 4 ? totalPages - 5 + i : page - 2 + i));
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${page === pageNum
                  ? 'bg-[#007fed] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Sau
        </button>
      </div>
    );
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header Section */}
      <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dự án đã đăng</h1>
              <p className="text-gray-400">Theo dõi chất lượng đề xuất và quản lý tiến độ các dự án của bạn.</p>
            </div>
            <Link
              to="?postJob=true"
              className="px-6 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Đăng dự án mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-50 rounded">
                <Briefcase className="w-4 h-4 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tổng bài đăng</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded">
                <Briefcase className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'OPEN').length}</p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đang tuyển dụng</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-50 rounded">
                <Briefcase className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status !== 'OPEN').length}</p>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đã đóng tuyển</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dự án nào</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Bắt đầu tìm kiếm đối tác hoàn hảo bằng cách đăng tin dự án đầu tiên của bạn.
              </p>
              <Link
                to="?postJob=true"
                className="px-6 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Đăng tin ngay
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const status = getStatusConfig(job.status);
              return (
                <div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${status.className}`}>
                          {status.label}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#007fed] hover:underline cursor-pointer mb-3 truncate"
                        onClick={() => navigate(`/employer/jobs/${job.id}`)}>
                        {job.title}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-6">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ngân sách dự án</p>
                          <div className="flex items-center gap-1 text-gray-900 font-bold">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>
                              {job.budgetMin && job.budgetMax
                                ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                                : (job.budgetMax || job.budgetMin || 0).toLocaleString()} PTS
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Số đề xuất</p>
                          <div className="flex items-center gap-1 text-gray-900 font-bold">
                            <Briefcase className="w-4 h-4 text-[#007fed]" />
                            <span>{job.proposalCount || 0}</span>
                          </div>
                        </div>
                        {job.duration && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Thời gian</p>
                            <div className="flex items-center gap-1 text-gray-900 font-bold">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span>{formatDuration(job.duration)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                      <button
                        onClick={() => navigate(`/employer/jobs/${job.id}/proposals`)}
                        className="w-full px-4 py-2 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem đề xuất
                      </button>

                      <button
                        onClick={() => navigate(`/employer/jobs/${job.id}`)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-bold text-sm transition-colors"
                      >
                        Chi tiết Job
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination />
      </div>
    </div>
  );
}