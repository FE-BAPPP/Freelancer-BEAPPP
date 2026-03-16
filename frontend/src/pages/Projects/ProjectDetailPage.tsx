import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, CheckCircle, MessageSquare, Briefcase, Settings, Star, RefreshCw, Lock, Unlock, DollarSign, ExternalLink
} from 'lucide-react';
import { projectApi, reviewApi, escrowApi } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { ChatButton } from '../../components/Chat/ChatButton';
import { MilestoneCard } from '../../components/Milestones/MilestoneCard';
import { SubmitWorkModal } from '../../components/Milestones/SubmitWorkModal';
import { RejectMilestoneModal } from '../../components/Milestones/RejectMilestoneModal';
import { useMilestoneActions } from '../../hooks/useMilestoneActions';
import { ReviewForm, ReviewList } from '../../components/Reviews';
import type { Escrow } from '../../types/api';

// New Components
import { ProjectLayout } from '../../components/Projects/ProjectLayout';
import { ActionBanner, BannerType } from '../../components/Projects/ActionBanner';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const isEmployer = role === 'EMPLOYER';
  const isFreelancer = role === 'FREELANCER';

  // Use custom hook for milestone actions
  const milestoneActions = useMilestoneActions(loadProjectDetails, milestones);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  async function loadProjectDetails() {
    try {
      setLoading(true);

      // Load project
      const projectRes = await projectApi.getProjectById(projectId!);
      const projectData = (projectRes.data || projectRes) as any;
      setProject(projectData);

      // Load milestones
      const milestonesRes = await projectApi.getProjectMilestones(projectId!);
      const milestonesData = (milestonesRes as any).data || milestonesRes || [];
      setMilestones(Array.isArray(milestonesData) ? milestonesData : []);

      // Load escrows
      try {
        const escrowsRes = await escrowApi.getEscrowsByProject(projectId!);
        const escrowsData = (escrowsRes as any).data || escrowsRes || [];
        setEscrows(Array.isArray(escrowsData) ? escrowsData : []);
      } catch (err) {
        console.error('Failed to load escrows:', err);
        setEscrows([]);
      }

      // Check review eligibility
      if (projectData.status === 'COMPLETED') {
        try {
          const reviewExists = await reviewApi.checkReviewExists(projectId!);
          setCanReview(!reviewExists);
        } catch (err) {
          setCanReview(true);
        }
      }

      // Calculate stats
      const totalMilestones = milestonesData?.length || 0;
      const completedMilestones = milestonesData?.filter((m: any) =>
        m.status === 'APPROVED' || m.status === 'RELEASED'
      ).length || 0;

      setStats({
        totalMilestones,
        completedMilestones,
        progress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
      });

    } catch (error) {
      console.error('Failed to load project details:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- Helpers ---
  const getBannerConfig = (): { type: BannerType; title: string; description: string; action?: React.ReactNode } | null => {
    if (!project) return null;

    // 1. Waiting for Milestone Funding (Flexible Funding)
    const hasMilestones = milestones && milestones.length > 0;

    if (project.status === 'IN_PROGRESS' && !hasMilestones) {
      if (isEmployer) {
        return {
          type: 'INFO',
          title: 'Xác định giai đoạn (Milestones)',
          description: 'Ngân sách dự án đã được nạp vào hệ thống. Vui lòng xác định các giai đoạn (Milestones) để phân bổ ngân sách và theo dõi tiến độ.',
          action: (
            <button
              onClick={() => navigate(`/projects/${projectId}/milestones`)}
              className="px-4 py-2 bg-[#007fed] rounded-lg text-white font-bold hover:bg-[#006bb3] transition shadow-sm"
            >
              Quản lý Giai đoạn
            </button>
          )
        };
      } else if (isFreelancer) {
        return {
          type: 'INFO',
          title: 'Đang chờ xác định giai đoạn',
          description: 'Dự án đã được nạp ngân sách. Vui lòng chờ khách hàng xác định các giai đoạn (Milestones) để bạn có thể bắt đầu làm việc.',
        };
      }
    }

    // 2. Pending Milestone Approval (Employer)
    const pendingApproval = milestones.find((m: any) => m.status === 'SUBMITTED');
    if (isEmployer && pendingApproval) {
      return {
        type: 'REVIEW_REQUIRED',
        title: 'Sản phẩm đã được nộp',
        description: `${project.freelancerName} đã nộp sản phẩm cho giai đoạn "${pendingApproval.title}". Vui lòng kiểm tra.`,
        action: (
          <button
            onClick={() => document.getElementById('milestones-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-green-600 rounded-lg text-white font-bold hover:bg-green-700 transition shadow-sm"
          >
            Xem xét Sản phẩm
          </button>
        )
      };
    }

    // 3. Milestone Work Required (Freelancer)
    const activeMilestone = milestones.find((m: any) => m.status === 'IN_PROGRESS');
    if (isFreelancer && activeMilestone) {
      return {
        type: 'MILESTONE_DUE',
        title: 'Đang thực hiện công việc',
        description: `Bạn đang thực hiện giai đoạn "${activeMilestone.title}". Hạn nộp: ${activeMilestone.dueDate ? new Date(activeMilestone.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}`,
        action: (
          <button
            onClick={() => milestoneActions.handleOpenSubmitModal(activeMilestone)}
            className="px-4 py-2 bg-[#007fed] rounded-lg text-white font-bold hover:bg-[#006bb3] transition shadow-sm"
          >
            Nộp Sản phẩm
          </button>
        )
      };
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f7f7] text-gray-500">
        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-[#007fed]" />
        <p className="font-bold">Đang tải không gian làm việc dự án...</p>
      </div>
    );
  }

  if (!project) {
    return <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center text-red-500 font-bold">Không tìm thấy dự án</div>;
  }

  // Determine Banner
  const banner = getBannerConfig();

  // --- Components for Layout ---

  // 1. Header
  const Header = (
    <div className="flex flex-col md:flex-row items-center justify-between pb-8 border-b border-gray-100 gap-4">
      <div className="text-center md:text-left">
        <button
          onClick={() => navigate(isEmployer ? '/employer/my-projects' : '/freelancer/my-projects')}
          className="flex items-center gap-2 text-[#007fed] hover:text-[#006bb3] transition-colors mb-3 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
        <h1 className="text-3xl font-black text-gray-900 flex flex-wrap items-center gap-3 justify-center md:justify-start">
          {project.jobTitle}
          <span className={`text-sm px-4 py-1 rounded-full border shadow-sm ${project.status === 'COMPLETED' ? 'border-green-200 text-green-700 bg-green-50' :
            project.status === 'IN_PROGRESS' ? 'border-blue-200 text-blue-700 bg-blue-50' :
              'border-gray-200 text-gray-600 bg-gray-50'
            }`}>
            {project.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
              project.status === 'COMPLETED' ? 'Đã hoàn thành' :
                project.status === 'CANCELLED' ? 'Đã hủy' : project.status}
          </span>
        </h1>
      </div>
      <div className="flex gap-3">
        {/* Refresh Button */}
        <button
          onClick={() => loadProjectDetails()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 text-[#007fed] ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
        {/* Top Actions */}
        {isEmployer && (
          <button
            onClick={() => navigate(`/projects/${projectId}/milestones`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm"
          >
            <Settings className="w-4 h-4 text-[#007fed]" />
            Cài đặt dự án
          </button>
        )}
      </div>
    </div>
  );

  // 2. Main Content (Workflow)
  const MainContent = (
    <div className="space-y-8">
      {/* ACTION BANNER */}
      {banner && (
        <ActionBanner
          type={banner.type}
          title={banner.title}
          description={banner.description}
          action={banner.action}
        />
      )}

      {/* Escrow Status Panel */}
      {escrows.length > 0 && (
        <div className="bg-white border border-blue-200 rounded-lg p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#007fed]"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Lock className="w-6 h-6 text-[#007fed]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Trạng thái Thanh toán</h3>
              <p className="text-sm text-gray-500 font-medium">Theo dõi ngân sách đang được tạm giữ an toàn</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {escrows.map((escrow) => (
              <div key={escrow.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-gray-700 mb-3 truncate">{escrow.milestoneTitle}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5 text-green-600 font-bold" />
                    <span className="text-2xl font-black text-gray-900">{escrow.amount}</span>
                    <span className="text-sm font-bold text-gray-500">PTS</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  {escrow.status === 'LOCKED' ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Đang giữ tại Escrow</span>
                    </>
                  ) : escrow.status === 'RELEASED' ? (
                    <>
                      <Unlock className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-black text-green-600 uppercase tracking-wider">Đã hoàn tất thanh toán</span>
                    </>
                  ) : (
                    <span className={`text-xs font-black uppercase tracking-wider ${escrow.status === 'REFUNDED' ? 'text-blue-600' : 'text-red-600'}`}>
                      {escrow.status === 'REFUNDED' ? 'Đã hoàn tiền' : escrow.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Section */}
      <div id="milestones-section" className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Giai đoạn & Thanh toán
            </h2>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">
                Tiến độ: {stats?.completedMilestones} / {stats?.totalMilestones} giai đoạn
              </span>
              <div className="w-48 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden border border-gray-200">
                <div className="h-full bg-green-500 transition-all duration-500 shadow-sm" style={{ width: `${stats?.progress}%` }}></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {milestones.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p className="font-bold text-gray-700">Chưa có giai đoạn nào được tạo.</p>
                {isEmployer && <p className="text-sm text-[#007fed] mt-2 font-bold cursor-pointer hover:underline" onClick={() => navigate(`/projects/${projectId}/milestones`)}>Click để thiết lập giai đoạn ngay</p>}
              </div>
            ) : (
              milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  isFreelancer={isFreelancer}
                  isEmployer={isEmployer}
                  onStartMilestone={milestoneActions.handleStartMilestone}
                  onSubmitWork={milestoneActions.handleOpenSubmitModal}
                  onApprove={milestoneActions.handleApproveMilestone}
                  onReject={milestoneActions.handleOpenRejectModal}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Section (Conditional) */}
      {(canReview || project.status === 'COMPLETED') && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400" />
                Đánh giá & Nhận xét
              </h2>
              {canReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition text-sm font-bold border border-amber-200 shadow-sm"
                >
                  Viết đánh giá ngay
                </button>
              )}
            </div>
            <ReviewList projectId={projectId} showProject={false} />
          </div>
        </div>
      )}
    </div>
  );

  // 3. Sidebar (Context)
  const Sidebar = (
    <div className="space-y-8">
      {/* Budget Card */}
      <div className="bg-[#1f2125] text-white rounded-lg shadow-xl relative overflow-hidden p-8 border border-gray-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#007fed]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Tổng ngân sách dự án</h3>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-black text-[#007fed]">{project.agreedAmount}</span>
          <span className="text-xl font-bold text-gray-400">PTS</span>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Đang được tạm giữ</span>
            <span className="font-black text-amber-500">
              {escrows.filter(e => e.status === 'LOCKED').reduce((acc, e) => acc + e.amount, 0)} PTS
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Đã thanh toán</span>
            <span className="font-black text-green-500">
              {escrows.filter(e => e.status === 'RELEASED').reduce((acc, e) => acc + e.amount, 0)} PTS
            </span>
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-8">
          <h3 className="font-black text-gray-900 flex items-center gap-3 mb-4 text-lg">
            <MessageSquare className="w-6 h-6 text-[#007fed]" />
            Trao đổi công việc
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
            Sử dụng kênh chat này để trao đổi trực tiếp với đối tác về chi tiết dự án.
          </p>
          <ChatButton
            projectId={projectId!}
            projectTitle={project.jobTitle}
            className="w-full justify-center"
          />
        </div>
      </div>

      {/* Counterparty Info */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-8">
          <h3 className="font-black text-gray-900 flex items-center gap-3 mb-6 text-lg">
            <User className="w-6 h-6 text-[#007fed]" />
            {isEmployer ? 'Người thực hiện' : 'Khách hàng'}
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-black text-[#007fed] border-2 border-blue-100">
              {isEmployer ? project.freelancerName?.charAt(0) : project.employerName?.charAt(0)}
            </div>
            <div>
              <h4 className="text-gray-900 font-black text-lg">
                {isEmployer ? project.freelancerName : project.employerName}
              </h4>
              <button
                onClick={() => navigate(isEmployer ? `/freelancer/profile/${project.freelancerId}` : `/employer/profile/${project.employerId}`)}
                className="text-sm text-[#007fed] hover:text-[#006bb3] font-bold mt-1 flex items-center gap-1 group"
              >
                Xem hồ sơ chi tiết
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f7f7f7] min-h-screen">
      <ProjectLayout
        header={Header}
        main={MainContent}
        sidebar={Sidebar}
      />

      {/* MODALS */}
      {milestoneActions.showSubmitModal && milestoneActions.selectedMilestone && (
        <SubmitWorkModal
          milestone={milestoneActions.selectedMilestone}
          onClose={milestoneActions.closeModals}
          onSubmit={milestoneActions.handleSubmitWork}
        />
      )}

      {milestoneActions.showRejectModal && milestoneActions.selectedMilestone && (
        <RejectMilestoneModal
          milestone={milestoneActions.selectedMilestone}
          onClose={milestoneActions.closeModals}
          onReject={milestoneActions.handleRejectMilestone}
        />
      )}

      {showReviewForm && project && (
        <ReviewForm
          projectId={projectId!}
          revieweeId={isEmployer ? project.freelancerId : project.employerId}
          revieweeName={isEmployer ? project.freelancerName : project.employerName}
          onSubmit={async (data) => {
            await reviewApi.createReview(data);
            setShowReviewForm(false);
            setCanReview(false);
            loadProjectDetails();
          }}
          onClose={() => setShowReviewForm(false)}
        />
      )}

    </div>
  );
}
