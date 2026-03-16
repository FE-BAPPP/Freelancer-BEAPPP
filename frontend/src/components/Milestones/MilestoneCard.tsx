import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, FileText, Upload, AlertCircle, Paperclip, Download, Play, X, Loader2 } from 'lucide-react';
import { EscrowStatusBadge } from '../Escrow';
import { filesApi } from '../../services/filesApi';
import { FileResponse } from '../../services/api';

interface MilestoneCardProps {
  milestone: any;
  index: number;
  isFreelancer: boolean;
  isEmployer: boolean;
  onStartMilestone: (milestoneId: string) => void;
  onSubmitWork: (milestone: any) => void;
  onApprove: (milestoneId: string) => void;
  onReject: (milestone: any) => void;
}

export function MilestoneCard({
  milestone,
  index,
  isFreelancer,
  isEmployer,
  onStartMilestone,
  onSubmitWork,
  onApprove,
  onReject
}: MilestoneCardProps) {

  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch files when milestone has deliverables (submitted)
  useEffect(() => {
    if (milestone.deliverables || milestone.status === 'SUBMITTED' || milestone.status === 'APPROVED' || milestone.status === 'RELEASED') {
      fetchFiles();
    }
  }, [milestone.id, milestone.status]);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await filesApi.getFilesByEntity('MILESTONE', milestone.id);
      if (response.success && response.data) {
        setFiles(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch milestone files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED':
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PENDING': return 'bg-gray-50 text-gray-400 border-gray-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'SUBMITTED': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'Đã giải ngân';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'SUBMITTED': return 'Đã nộp';
      case 'IN_PROGRESS': return 'Đang bàn giao';
      case 'REJECTED': return 'Bị từ chối';
      case 'PENDING': return 'Đang chờ';
      default: return status;
    }
  };

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header Row: Title + Amount */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Milestone Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Giai đoạn #{milestone.sequenceOrder || index + 1}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMilestoneStatusColor(milestone.status)}`}>
              {getStatusLabel(milestone.status)}
            </span>
            {milestone.escrowStatus && (
              <EscrowStatusBadge status={milestone.escrowStatus} size="sm" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
          <p className="text-gray-600 text-sm">{milestone.description}</p>
        </div>

        <div className="ml-4 text-right">
          <p className="text-2xl font-black text-[#007fed]">
            {milestone.amount.toLocaleString()} <span className="text-base font-normal text-gray-400">PTS</span>
          </p>
          {milestone.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 justify-end font-medium">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>Hạn: {new Date(milestone.dueDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deliverables */}
      {milestone.deliverables && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Sản phẩm đã bàn giao:
          </h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{milestone.deliverables}</p>
          {milestone.completionNotes && (
            <p className="text-gray-500 text-xs mt-2 italic font-medium">Ghi chú: {milestone.completionNotes}</p>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {milestone.rejectionReason && milestone.status === 'IN_PROGRESS' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Phản hồi từ chối:
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">{milestone.rejectionReason}</p>
        </div>
      )}

      {/* Attachments - fetched from API */}
      {(files.length > 0 || loadingFiles) && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            📁 Tệp tin đính kèm ({files.length}):
          </h4>
          {loadingFiles ? (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải danh sách tệp...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 hover:border-[#007fed] hover:bg-blue-50 transition-all text-xs group shadow-sm"
                >
                  <FileText className="w-4 h-4 text-[#007fed] flex-shrink-0" />
                  <span className="flex-1 text-gray-700 truncate font-bold group-hover:text-[#007fed]">{file.fileName}</span>
                  <span className="text-gray-400 font-medium">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#007fed] flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Always visible at bottom */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-4">
        {isFreelancer && (
          <FreelancerActions
            milestone={milestone}
            onStartMilestone={onStartMilestone}
            onSubmitWork={onSubmitWork}
          />
        )}

        {isEmployer && (
          <EmployerActions
            milestone={milestone}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </div>
    </div>
  );
}

// Freelancer Actions Component
function FreelancerActions({ milestone, onStartMilestone, onSubmitWork }: any) {
  switch (milestone.status) {
    case 'PENDING':
      return (
        <button
          onClick={() => onStartMilestone(milestone.id)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
        >
          <Play className="w-4 h-4" />
          Bắt đầu làm việc
        </button>
      );

    case 'IN_PROGRESS':
      return (
        <button
          onClick={() => onSubmitWork(milestone)}
          className="px-6 py-2.5 bg-[#007fed] text-white rounded-lg hover:bg-[#006bb3] transition-all flex items-center gap-2 text-sm font-bold shadow-md"
        >
          <Upload className="w-4 h-4" />
          Nộp sản phẩm
        </button>
      );

    case 'SUBMITTED':
      return (
        <div className="flex items-center gap-2 text-amber-600 text-sm px-4 py-2 bg-amber-50 rounded-lg border border-amber-200 font-bold">
          <Clock className="w-4 h-4" />
          <span>Đang chờ duyệt</span>
        </div>
      );

    case 'APPROVED':
    case 'RELEASED':
      return (
        <div className="flex items-center gap-2 text-emerald-600 text-sm px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200 font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Đã thanh toán</span>
        </div>
      );

    default:
      return null;
  }
}

// Employer Actions Component
function EmployerActions({ milestone, onApprove, onReject }: any) {
  switch (milestone.status) {
    case 'SUBMITTED':
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(milestone.id)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            Phê duyệt & Thanh toán
          </button>
          <button
            onClick={() => onReject(milestone)}
            className="px-6 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold border border-gray-200 hover:border-red-200"
          >
            <X className="w-4 h-4" />
            Từ chối
          </button>
        </div>
      );

    case 'PENDING':
      return (
        <div className="text-gray-500 text-sm px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 font-bold">
          Chờ freelancer bắt đầu
        </div>
      );

    case 'IN_PROGRESS':
      return (
        <div className="flex items-center gap-2 text-blue-600 text-sm px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 font-bold">
          <Clock className="w-4 h-4" />
          <span>Đang thực hiện</span>
        </div>
      );

    case 'APPROVED':
    case 'RELEASED':
      return (
        <div className="flex items-center gap-2 text-emerald-600 text-sm px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200 font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Đã thanh toán</span>
        </div>
      );

    default:
      return null;
  }
}
