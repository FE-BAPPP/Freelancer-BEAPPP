import { useState } from 'react';
import { projectApi } from '../services/api';

export function useMilestoneActions(onRefresh: () => void, milestones: any[] = []) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

  const handleStartMilestone = async (milestoneId: string) => {
    // Validation: Ensure previous milestones are completed
    const targetMilestone = milestones.find((m: any) => m.id === milestoneId);
    if (targetMilestone) {
      const incompletePrevious = milestones.find((m: any) =>
        m.sequenceOrder < targetMilestone.sequenceOrder &&
        m.status !== 'APPROVED' &&
        m.status !== 'RELEASED'
      );

      if (incompletePrevious) {
        alert(`Bạn không thể bắt đầu giai đoạn này vì giai đoạn "${incompletePrevious.title}" chưa hoàn thành (được phê duyệt).`);
        return;
      }
    }

    if (!window.confirm('Bắt đầu làm việc cho giai đoạn này?')) {
      return;
    }

    try {
      await projectApi.startMilestone(milestoneId);
      alert('Đã bắt đầu giai đoạn! Bạn có thể bắt đầu làm việc ngay bây giờ.');
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể bắt đầu giai đoạn');
    }
  };

  const handleOpenSubmitModal = (milestone: any) => {
    setSelectedMilestone(milestone);
    setShowSubmitModal(true);
  };

  const handleSubmitWork = async (deliverables: string, notes: string) => {
    if (!selectedMilestone) return;

    try {
      await projectApi.submitMilestone(selectedMilestone.id, { deliverables, notes });
      alert('Đã gửi sản phẩm để xem xét!');
      setShowSubmitModal(false);
      setSelectedMilestone(null);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể gửi sản phẩm');
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!window.confirm('Phê duyệt giai đoạn này và giải ngân thanh toán?')) {
      return;
    }

    try {
      await projectApi.approveMilestone(milestoneId);
      alert('✅ Đã phê duyệt giai đoạn! Thanh toán đã được giải ngân cho freelancer.\n\n🔔 Thông báo đã được gửi cho freelancer.');
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể phê duyệt giai đoạn');
    }
  };

  const handleOpenRejectModal = (milestone: any) => {
    setSelectedMilestone(milestone);
    setShowRejectModal(true);
  };

  const handleRejectMilestone = async (reason: string) => {
    if (!selectedMilestone) return;

    try {
      await projectApi.rejectMilestone(selectedMilestone.id, { reason });
      alert('Đã từ chối giai đoạn kèm theo phản hồi.');
      setShowRejectModal(false);
      setSelectedMilestone(null);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể từ chối giai đoạn');
    }
  };

  const closeModals = () => {
    setShowSubmitModal(false);
    setShowRejectModal(false);
    setSelectedMilestone(null);
  };

  return {
    showSubmitModal,
    showRejectModal,
    selectedMilestone,
    handleStartMilestone,
    handleOpenSubmitModal,
    handleSubmitWork,
    handleApproveMilestone,
    handleOpenRejectModal,
    handleRejectMilestone,
    closeModals,
  };
}
