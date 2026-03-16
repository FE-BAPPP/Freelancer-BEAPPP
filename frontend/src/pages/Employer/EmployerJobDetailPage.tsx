import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Clock, Calendar,
  Briefcase, Users, AlertCircle, Edit, Trash2, XCircle,
  FileText, Paperclip, Globe, Shield, CheckCircle2,
  Trash, RefreshCw
} from 'lucide-react';
import { jobApi, Job } from '../../services/jobApi';
import { projectApi, FileResponse } from '../../services/api';

export function EmployerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [jobFiles, setJobFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'delete' | 'close' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
    window.scrollTo(0, 0);
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobApi.getJobById(jobId!);
      const jobData: Job | null = (response as any).data || (response as any);

      if (!jobData || !jobData.id) {
        throw new Error('Invalid job data');
      }

      setJob(jobData);

      try {
        const files = await projectApi.getFiles('JOB', jobData.id);
        setJobFiles(files || []);
      } catch (fileErr) {
        console.warn('Failed to fetch job files:', fileErr);
      }
    } catch (err: any) {
      console.error('Failed to load employer job detail:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    try {
      setActionLoading('delete');
      const response = await jobApi.deleteJob(job.id);
      if (response.success) {
        navigate('/employer/my-jobs');
      } else {
        setError(response.message || 'Xóa công việc thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Xóa công việc thất bại');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) return;
    try {
      setActionLoading('close');
      const response = await jobApi.closeJob(job.id);
      if (response.success) {
        setJob(response.data || { ...job, status: 'CLOSED' });
      } else {
        setError(response.message || 'Đóng công việc thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Đóng công việc thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#007fed] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-8 flex flex-col items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center max-w-lg shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-500 mb-6">{error || 'Không tìm thấy thông tin công việc'}</p>
          <button
            onClick={() => navigate('/employer/my-jobs')}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      {/* Dark Header */}
      <div className="bg-[#1f2125] text-white pt-8 pb-16 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/employer/my-jobs')}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý Job</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadJobDetails()}
                disabled={loading}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                title="Chỉnh sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Xóa công việc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${job.status === 'OPEN'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}>
                  {job.status === 'OPEN' ? 'Đang mở tuyển' : 'Đã đóng tuyển'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  Cập nhật {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                {job.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Ngân sách</p>
                <p className="text-lg font-bold text-[#007fed] flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {job.budgetMin && job.budgetMax
                    ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                    : (job.budgetMax || job.budgetMin || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Loại hình</p>
                <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {job.projectType?.replace('_', ' ') || 'Cố định'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Đề xuất</p>
                <p className="text-lg font-bold text-purple-600 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.proposalCount || 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Thời hạn</p>
                <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {job.duration ? (
                    job.duration === 'LESS_THAN_1_WEEK' ? 'Dưới 1 tuần' :
                      job.duration === '1_TO_2_WEEKS' ? '1-2 tuần' :
                        job.duration === '2_TO_4_WEEKS' ? '2-4 tuần' :
                          job.duration === '1_TO_3_MONTHS' ? '1-3 tháng' :
                            job.duration === '3_TO_6_MONTHS' ? '3-6 tháng' :
                              job.duration === 'MORE_THAN_6_MONTHS' ? 'Trên 6 tháng' : job.duration
                  ) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Chi tiết công việc
              </h3>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.description || 'Không có mô tả chi tiết'}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Kỹ năng yêu cầu</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {jobFiles.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  Tài liệu đính kèm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobFiles.map(file => (
                    <a
                      key={file.id}
                      href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#007fed] hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-500 group-hover:text-[#007fed] group-hover:border-blue-200">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate group-hover:text-[#007fed]">{file.fileName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Globe className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#007fed]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/employer/jobs/${job.id}/proposals`)}
                  className="w-full py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Xem {job.proposalCount || 0} Đề xuất
                </button>

                {job.status === 'OPEN' && (
                  <button
                    onClick={handleCloseJob}
                    disabled={actionLoading === 'close'}
                    className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'close' ? <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Đóng tuyển dụng
                  </button>
                )}

                <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium">Được bảo vệ bởi hệ thống</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-[#007fed]" />
                    <span className="text-xs font-medium">Thanh toán an toàn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wide mb-4">Thông tin nhanh</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Ngày đăng</span>
                  <span className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Lượt xem</span>
                  <span className="font-medium text-gray-900">124</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">ID Dự án</span>
                  <span className="font-family-mono text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{job.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xóa dự án?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Hành động này không thể hoàn tác. Các đề xuất đã nhận cũng sẽ bị ẩn đi.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={actionLoading === 'delete'}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-wide transition-colors disabled:opacity-70"
              >
                {actionLoading === 'delete' ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
