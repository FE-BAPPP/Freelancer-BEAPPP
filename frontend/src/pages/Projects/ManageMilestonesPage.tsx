import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  ArrowLeft, Plus, AlertCircle, FileText,
  Shield, X, Calendar, DollarSign, RefreshCw
} from 'lucide-react';
import { projectApi } from '../../services/api';
import { milestoneApi } from '../../services/milestoneApi';
import { useAuth } from '../../hooks/useAuth';
import { AccordionMilestoneList } from '../../components/Milestones/AccordionMilestoneList';
import type { Milestone } from '../../types/api';
import { SubmitWorkModal } from '../../components/Milestones/SubmitWorkModal';
import { RejectMilestoneModal } from '../../components/Milestones/RejectMilestoneModal';

export function ManageMilestonesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingMilestone, setSubmittingMilestone] = useState<Milestone | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingMilestone, setRejectingMilestone] = useState<Milestone | null>(null);

  const isEmployer = role === 'EMPLOYER';
  const isFreelancer = role === 'FREELANCER';

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const projectRes = await projectApi.getProjectById(projectId!);
      setProject(projectRes.data || projectRes);

      const milestonesRes = await projectApi.getProjectMilestones(projectId!);
      setMilestones(milestonesRes.data || milestonesRes || []);

    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giai đoạn này?')) {
      return;
    }

    try {
      await projectApi.deleteMilestone(milestoneId);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete milestone:', error);
      alert(error.response?.data?.message || 'Không thể xóa giai đoạn');
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    // Validation: Ensure previous milestones are completed
    const targetMilestone = milestones.find(m => m.id === milestoneId);
    if (targetMilestone) {
      const incompletePrevious = milestones.find(m =>
        m.sequenceOrder < targetMilestone.sequenceOrder &&
        m.status !== 'APPROVED' &&
        m.status !== 'RELEASED'
      );

      if (incompletePrevious) {
        alert(`Bạn không thể bắt đầu giai đoạn này vì giai đoạn "${incompletePrevious.title}" chưa hoàn thành (được phê duyệt).`);
        return;
      }
    }

    try {
      await milestoneApi.startMilestone(milestoneId);
      loadData();
    } catch (error: any) {
      console.error('Failed to start milestone:', error);
      alert(error.response?.data?.message || error.message || 'Không thể bắt đầu giai đoạn');
    }
  };

  const handleSubmitMilestone = async (milestoneId: string, deliverables: string, notes: string) => {
    try {
      await projectApi.submitMilestone(milestoneId, { deliverables, notes });
      setShowSubmitModal(false);
      setSubmittingMilestone(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to submit milestone:', error);
      alert(error.response?.data?.message || 'Không thể nộp giai đoạn');
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!confirm('Phê duyệt giai đoạn này và giải ngân thanh toán?')) {
      return;
    }

    try {
      await projectApi.approveMilestone(milestoneId);
      loadData();
    } catch (error: any) {
      console.error('Failed to approve milestone:', error);
      alert(error.response?.data?.message || 'Không thể phê duyệt giai đoạn');
    }
  };

  const handleRejectMilestone = async (milestoneId: string, reason: string) => {
    try {
      await projectApi.rejectMilestone(milestoneId, { reason });
      setShowRejectModal(false);
      setRejectingMilestone(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to reject milestone:', error);
      alert(error.response?.data?.message || 'Không thể từ chối giai đoạn');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#007fed] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-12">
      {/* Header with Dark Background */}
      <div className="bg-[#1f2125] pt-12 pb-24 px-6 mb-[-64px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">Quản lý Giai đoạn</h1>
              <p className="text-gray-400 font-medium">Lập kế hoạch và theo dõi tiến độ công việc cho "{project?.jobTitle || project?.title}"</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-5 h-5 text-[#007fed] ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            {isEmployer && project?.status === 'IN_PROGRESS' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] transition-all shadow-lg shadow-[#007fed]/20"
              >
                <Plus className="w-5 h-5" />
                Thêm Giai đoạn mới
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Project Info Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-black text-gray-900 mb-1">{project?.jobTitle || project?.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <DollarSign className="w-4 h-4 text-[#007fed]" />
                Ngân sách: <span className="text-gray-900">{project?.agreedAmount} PTS</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Shield className="w-4 h-4 text-green-500" />
                Trạng thái: <span className="text-gray-900">{project?.status}</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <FileText className="w-4 h-4 text-blue-500" />
                Tổng số giai đoạn: <span className="text-gray-900">{milestones.length}</span>
              </span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg md:w-64 text-center">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Số dư còn lại</p>
            <p className="text-2xl font-black text-[#007fed]">
              {(project?.agreedAmount || 0) - milestones.reduce((sum, m) => sum + (m.amount || 0), 0)} PTS
            </p>
          </div>
        </div>

        {/* Milestones List Area */}
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg text-center py-24 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-black text-xl mb-2">Chưa có giai đoạn nào</h3>
              <p className="text-gray-500 max-w-md mx-auto font-medium">Hãy chia nhỏ dự án thành tập hợp các mục tiêu cụ thể để theo dõi tiến độ và giải ngân thanh toán an toàn.</p>
              {isEmployer && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-8 px-8 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] transition-all shadow-md"
                >
                  Tạo giai đoạn đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <AccordionMilestoneList
                milestones={milestones}
                isEmployer={isEmployer}
                isFreelancer={isFreelancer}
                onEdit={(m) => {
                  setEditingMilestone(m);
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteMilestone}
                onApprove={handleApproveMilestone}
                onReject={(m) => {
                  setRejectingMilestone(m);
                  setShowRejectModal(true);
                }}
                onSubmit={(m) => {
                  setSubmittingMilestone(m);
                  setShowSubmitModal(true);
                }}
                onStart={handleStartMilestone}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingMilestone) && (
        <MilestoneModal
          projectId={projectId!}
          project={project}
          milestone={editingMilestone}
          milestones={milestones}
          onClose={() => {
            setShowCreateModal(false);
            setEditingMilestone(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingMilestone(null);
            loadData();
          }}
        />
      )}

      {/* Submit Work Modal */}
      {showSubmitModal && submittingMilestone && (
        <SubmitWorkModal
          milestone={submittingMilestone}
          onClose={() => {
            setShowSubmitModal(false);
            setSubmittingMilestone(null);
          }}
          onSubmit={async (deliverables, notes) => {
            await handleSubmitMilestone(submittingMilestone.id, deliverables, notes);
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectingMilestone && (
        <RejectMilestoneModal
          milestone={rejectingMilestone}
          onClose={() => {
            setShowRejectModal(false);
            setRejectingMilestone(null);
          }}
          onReject={async (reason) => {
            await handleRejectMilestone(rejectingMilestone.id, reason);
          }}
        />
      )}
    </div>
  );
}

// ===== MILESTONE MODAL (CREATE/EDIT) =====
interface MilestoneModalProps {
  projectId: string;
  project: any;
  milestone: Milestone | null;
  milestones?: Milestone[];
  onClose: () => void;
  onSuccess: () => void;
}

function MilestoneModal({ projectId, project, milestone, onClose, onSuccess, milestones }: MilestoneModalProps) {
  const [formData, setFormData] = useState({
    title: milestone?.title || '',
    description: milestone?.description || '',
    amount: milestone?.amount ? milestone.amount.toString() : '',
    dueDate: milestone?.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate budget status
  const agreedAmount = project?.agreedAmount || 0;
  const existingMilestones = milestones || [];

  // Safe parsing for amount
  const currentAmount = parseFloat(formData.amount.toString()) || 0;

  // For edit, subtract the current milestone's amount from sum to calculate remaining correctly
  const currentlyLockedAmount = existingMilestones.reduce((sum, m) => sum + (m.id === milestone?.id ? 0 : (m.amount || 0)), 0);
  const remainingBudget = agreedAmount - currentlyLockedAmount;
  const willExceedBudget = (currentlyLockedAmount + currentAmount) > agreedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.title.trim().length < 3) {
      setError('Tiêu đề phải có ít nhất 3 ký tự');
      return;
    }

    if (!currentAmount || currentAmount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    if (willExceedBudget) {
      setError(`Tổng số tiền giai đoạn (${(currentlyLockedAmount + currentAmount).toFixed(2)} PTS) vượt quá ngân sách dự án (${agreedAmount} PTS). Còn lại: ${remainingBudget.toFixed(2)} PTS`);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        amount: currentAmount,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };

      if (milestone) {
        await projectApi.updateMilestone(milestone.id, payload);
      } else {
        await projectApi.createMilestone(projectId, payload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu giai đoạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-0 max-w-lg w-full border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[#1f2125] p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-black">
            {milestone ? 'Chỉnh sửa giai đoạn' : 'Tạo giai đoạn mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Budget Info Panel */}
          <div className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm space-y-3 shadow-sm">
            <div className="flex items-center justify-between font-bold">
              <span className="text-blue-700">Ngân sách dự án:</span>
              <span className="text-gray-900">{agreedAmount} PTS</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="text-blue-700">Đã phân bổ:</span>
              <span className="text-gray-900">{currentlyLockedAmount} PTS</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-200 pt-3 font-black">
              <span className="text-blue-800">Còn lại có thể dùng:</span>
              <span className={`${remainingBudget > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingBudget.toFixed(2)} PTS
              </span>
            </div>
            {willExceedBudget && (
              <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">Vượt quá ngân sách còn lại: {(currentlyLockedAmount + currentAmount - agreedAmount).toFixed(2)} PTS</span>
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-xs font-bold flex items-start gap-3">
            <Shield className="w-5 h-5 shrink-0 text-green-500" />
            <p>
              Số tiền này sẽ được trích từ <strong>Ngân sách Dự án đang tạm giữ</strong>. Bạn không cần thanh toán thêm từ ví cá nhân.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Tiêu đề giai đoạn *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] transition-all font-medium"
                placeholder="Ví dụ: Thiết kế giao diện (UI/UX)"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Mô tả công việc</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] transition-all font-medium"
                rows={4}
                placeholder="Mô tả chi tiết các sản phẩm cần bàn giao..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Số tiền (PTS) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-[#f7f7f7] border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all font-black ${willExceedBudget
                      ? 'border-red-500 focus:ring-red-500/10'
                      : 'border-gray-200 focus:ring-[#007fed]/10'
                      }`}
                    placeholder="0.00"
                    required
                    min="0.01"
                    max={remainingBudget}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Hạn bàn giao</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fed]/10 transition-all font-bold"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#007fed] text-white font-black rounded-lg hover:bg-[#006bb3] transition-all shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu giai đoạn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

