// frontend/src/pages/Employer/ViewProposalsPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, DollarSign, Calendar,
  Star, MessageSquare, Award, X, AlertCircle, Download, Paperclip,
  Shield, FileText, ChevronDown, RefreshCw
} from 'lucide-react';
import { proposalApi, ProposalResponse } from '../../services/proposalApi';
import { jobApi } from '../../services/jobApi';
import { projectApi, FileResponse } from '../../services/api';
import { Avatar } from '../../components/Common';

export function ViewProposalsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<ProposalResponse | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobAndProposals();
    }
    window.scrollTo(0, 0);
  }, [jobId]);

  const loadJobAndProposals = async () => {
    try {
      setLoading(true);
      const jobResponse = await jobApi.getJobById(jobId!);
      const jobData = jobResponse.data || jobResponse;
      if (!jobData || !jobData.id) throw new Error('Invalid job data');
      setJob(jobData);

      const proposalsResponse = await proposalApi.getProposalsForJob(jobId!, 0, 50);
      let proposalsData = proposalsResponse.data || proposalsResponse;
      setProposals(proposalsData.content || []);
    } catch (error: any) {
      console.error('❌ Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardProposal = (proposal: ProposalResponse) => {
    setSelectedProposal(proposal);
    setShowAwardModal(true);
  };

  const confirmAward = async () => {
    if (!selectedProposal) return;
    try {
      setLoading(true);
      const response = await proposalApi.awardProposal(selectedProposal.id);
      setShowAwardModal(false);
      setSelectedProposal(null);
      const projectId = response?.data?.projectId || response?.projectId;
      if (projectId) navigate(`/projects/${projectId}`);
      else navigate('/employer/my-projects');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Failed to award proposal');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !job) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#007fed] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy công việc</h2>
        <button onClick={() => navigate('/employer/my-jobs')} className="text-[#007fed] font-bold hover:underline mt-2">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      {/* Dark Header */}
      <div className="bg-[#1f2125] text-white pt-8 pb-12 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/employer/my-jobs')}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wide mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${job.status === 'OPEN'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}>
                  {job.status === 'OPEN' ? 'Đang tuyển' : 'Đã kết thúc'}
                </span>
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Đăng ngày {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white leading-tight mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ngân sách</p>
                  <p className="flex items-center gap-2 text-white font-bold text-lg">
                    <DollarSign className="w-5 h-5 text-[#007fed]" />
                    {job.budgetMin && job.budgetMax
                      ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                      : (job.budgetMax || job.budgetMin || 0).toLocaleString()} PTS
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Số lượng đề xuất</p>
                  <p className="flex items-center gap-2 text-white font-bold text-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                    {proposals.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:w-72 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Hiệu suất tin đăng</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Lượt xem</span>
                  <span className="text-white font-bold">124</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Chất lượng</span>
                  <span className="text-emerald-400 font-bold">Cao</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadJobAndProposals()}
                  disabled={loading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase tracking-wide transition-colors border border-white/10 disabled:opacity-50 flex items-center gap-2"
                  title="Làm mới"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
                <button
                  onClick={() => navigate(`/employer/jobs/${job.id}`)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase tracking-wide transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Danh sách đề xuất
            <span className="bg-blue-100 text-[#007fed] px-2.5 py-0.5 rounded-full text-sm">{proposals.length}</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Sắp xếp:</span>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007fed] cursor-pointer hover:border-gray-400 transition-colors shadow-sm">
                <option>Mới nhất</option>
                <option>Giá thấp nhất</option>
                <option>Rating cao nhất</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* List */}
        {proposals.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có đề xuất nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Bạn sẽ nhận được thông báo ngay khi có freelancer gửi đề xuất cho dự án này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onAward={() => handleAwardProposal(proposal)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {showAwardModal && selectedProposal && (
          <AwardModal
            isOpen={showAwardModal}
            proposal={selectedProposal}
            onConfirm={confirmAward}
            onClose={() => {
              setShowAwardModal(false);
              setSelectedProposal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Proposal Card Component
function ProposalCard({ proposal, onAward }: { proposal: ProposalResponse; onAward: () => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [proposalFiles, setProposalFiles] = useState<FileResponse[]>([]);

  useEffect(() => {
    loadProposalFiles();
  }, [proposal.id]);

  const loadProposalFiles = async () => {
    try {
      const files = await projectApi.getFiles('PROPOSAL', proposal.id);
      setProposalFiles(files);
    } catch (err) {
      console.error('Failed to load proposal files:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Freelancer Info */}
        <div className="lg:w-56 flex-shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pr-6">
          <div className="relative mb-3">
            <Avatar
              src={proposal.freelancerAvatar}
              name={proposal.freelancerName}
              size="lg"
              className="w-20 h-20 border-2 border-white shadow-sm cursor-pointer"
              onClick={() => navigate(`/freelancer/profile/${proposal.freelancerId}`)}
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-50">
              <Shield className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
            </div>
          </div>

          <h4
            onClick={() => navigate(`/freelancer/profile/${proposal.freelancerId}`)}
            className="text-base font-bold text-[#007fed] hover:underline cursor-pointer mb-1 w-full truncate"
            title={proposal.freelancerName}
          >
            {proposal.freelancerName || 'Freelancer'}
          </h4>

          <div className="flex items-center gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-bold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{proposal.freelancerRating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{proposal.freelancerCompletedJobs || 0} việc</span>
          </div>

          <button
            onClick={() => navigate(`/freelancer/profile/${proposal.freelancerId}`)}
            className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide transition-colors"
          >
            Xem hồ sơ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 min-w-[120px]">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Đề xuất</p>
              <p className="text-lg font-bold text-gray-900">{proposal.proposedAmount.toLocaleString()} PTS</p>
            </div>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 min-w-[120px]">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Thời gian</p>
              <p className="text-lg font-bold text-gray-900">{proposal.estimatedDurationDays || 0} Ngày</p>
            </div>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 min-w-[120px]">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Ngày gửi</p>
              <p className="text-base font-bold text-gray-900">{new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6 relative">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              Thư giới thiệu
            </h5>
            <div className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${!expanded ? 'line-clamp-3' : ''}`}>
              {proposal.coverLetter}
            </div>
            {proposal.coverLetter?.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs font-bold text-[#007fed] hover:underline flex items-center gap-1"
              >
                {expanded ? 'Thu gọn' : 'Đọc tiếp'}
              </button>
            )}
          </div>

          {proposalFiles.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                Tệp đính kèm ({proposalFiles.length})
              </h5>
              <div className="flex flex-wrap gap-3">
                {proposalFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 hover:border-[#007fed] rounded-lg group transition-colors shadow-sm min-w-[200px]"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-[#007fed]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 group-hover:text-[#007fed] truncate">{file.fileName}</p>
                      <p className="text-[10px] text-gray-500 uppercase mt-0.5">{(file.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-[#007fed]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions - Right Side */}
        {proposal.status === 'PENDING' && (
          <div className="mt-6 lg:mt-0 flex flex-col justify-center gap-3 lg:w-48 lg:border-l lg:border-gray-100 lg:pl-6">
            <button
              onClick={onAward}
              className="w-full py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Thuê Freelancer
            </button>
            <button className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors">
              Nhắn tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// AwardModal
function AwardModal({ isOpen, proposal, onConfirm, onClose }: any) {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-0 overflow-hidden transform transition-all scale-100">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Xác nhận thuê</h2>
              <p className="text-xs text-gray-500 mt-0.5">Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 border border-gray-200 hover:border-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <Avatar
              src={proposal.freelancerAvatar}
              name={proposal.freelancerName}
              size="md"
              className="w-12 h-12"
            />
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Freelancer</p>
              <p className="text-base font-bold text-gray-900">{proposal.freelancerName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Thanh toán (Escrow)</p>
              <p className="text-xl font-bold text-gray-900">{proposal.proposedAmount.toLocaleString()} <span className="text-xs font-bold text-gray-500">PTS</span></p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Thời gian</p>
              <p className="text-xl font-bold text-gray-900">{proposal.estimatedDurationDays} <span className="text-xs font-bold text-gray-500">Ngày</span></p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Bạn đang chấp nhận đề xuất này. Số tiền <strong>{proposal.proposedAmount.toLocaleString()} PTS</strong> của bạn sẽ được chuyển vào quỹ đảm bảo (Escrow) ngay lập tức.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg font-bold uppercase tracking-wide text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            Xác nhận & Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}