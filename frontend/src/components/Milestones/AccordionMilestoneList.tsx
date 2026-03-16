import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Clock, DollarSign, Upload, FileText,
    ChevronDown, ChevronUp, Edit, Trash2, Play, Shield, TrendingUp
} from 'lucide-react';
import type { Milestone } from '../../types/api';

interface AccordionMilestoneListProps {
    milestones: Milestone[];
    isEmployer: boolean;
    isFreelancer: boolean;
    onEdit?: (milestone: Milestone) => void;
    onDelete?: (milestoneId: string) => void;
    onApprove?: (milestoneId: string) => void;
    onReject?: (milestone: Milestone) => void;
    onSubmit?: (milestone: Milestone) => void;
    onStart?: (milestoneId: string) => void;
}

export function AccordionMilestoneList({
    milestones,
    isEmployer,
    isFreelancer,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onSubmit,
    onStart
}: AccordionMilestoneListProps) {
    // Config status colors using light theme
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RELEASED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'APPROVED': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'SUBMITTED': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RELEASED': return 'Đã giải ngân';
            case 'APPROVED': return 'Đã phê duyệt';
            case 'SUBMITTED': return 'Đã nộp';
            case 'IN_PROGRESS': return 'Đang thực hiện';
            case 'REJECTED': return 'Đã từ chối';
            case 'PENDING': return 'Đang chờ';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            {milestones.map((milestone, index) => (
                <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    isEmployer={isEmployer}
                    isFreelancer={isFreelancer}
                    handlers={{ onEdit, onDelete, onApprove, onReject, onSubmit, onStart }}
                    statusColor={getStatusColor(milestone.status)}
                    statusLabel={getStatusLabel(milestone.status)}
                />
            ))}
        </div>
    );
}

function MilestoneItem({ milestone, index, isEmployer, isFreelancer, handlers, statusColor, statusLabel }: any) {
    const [isOpen, setIsOpen] = useState(milestone.status === 'IN_PROGRESS' || milestone.status === 'SUBMITTED');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border rounded-xl overflow-hidden transition-all shadow-sm ${isOpen ? 'bg-white border-[#007fed]/30' : 'bg-white border-gray-200 hover:border-[#007fed]/40'
                }`}
        >
            {/* Header (Always Visible) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-5 cursor-pointer select-none group"
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${statusColor}`}>
                        {milestone.status === 'RELEASED' ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#007fed] transition-colors">
                            {milestone.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1 font-bold text-gray-900">
                                <DollarSign className="w-3 h-3 text-[#007fed]" /> {milestone.amount.toLocaleString()} {milestone.currency}
                            </span>
                            {milestone.dueDate && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" /> {new Date(milestone.dueDate).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                            {statusLabel}
                        </span>
                        {/* Escrow Status Badge */}
                        {milestone.escrowStatus && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${milestone.escrowStatus === 'LOCKED'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : milestone.escrowStatus === 'RELEASED'
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                <Shield className="w-3 h-3" />
                                {milestone.escrowStatus === 'LOCKED' ? 'Ký quỹ: Đã khóa' :
                                    milestone.escrowStatus === 'RELEASED' ? 'Ký quỹ: Đã giải ngân' :
                                        'Chưa phân bổ'}
                            </span>
                        )}
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 border-t border-gray-100">
                            {/* Escrow & Fund Status */}
                            {milestone.escrowStatus && (
                                <div className={`mb-6 p-4 rounded-lg border ${milestone.escrowStatus === 'LOCKED'
                                    ? 'bg-emerald-50 border-emerald-100'
                                    : milestone.escrowStatus === 'RELEASED'
                                        ? 'bg-blue-50 border-blue-100'
                                        : 'bg-amber-50 border-amber-100'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield className={`w-5 h-5 ${milestone.escrowStatus === 'LOCKED' ? 'text-emerald-600' :
                                                milestone.escrowStatus === 'RELEASED' ? 'text-blue-600' :
                                                    'text-amber-600'
                                                }`} />
                                            <div>
                                                <p className={`font-bold text-sm ${milestone.escrowStatus === 'LOCKED' ? 'text-emerald-700' :
                                                    milestone.escrowStatus === 'RELEASED' ? 'text-blue-700' :
                                                        'text-amber-700'
                                                    }`}>
                                                    {milestone.escrowStatus === 'LOCKED' ? 'Đã khóa trong Ký quỹ' :
                                                        milestone.escrowStatus === 'RELEASED' ? 'Đã giải ngân từ Ký quỹ' :
                                                            'Chưa khóa Ký quỹ'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                                    Số tiền: {milestone.amount.toLocaleString()} {milestone.currency}
                                                </p>
                                            </div>
                                        </div>
                                        {milestone.escrowStatus === 'LOCKED' && (
                                            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-200 rounded text-xs text-emerald-700 font-bold uppercase tracking-wider">
                                                <TrendingUp className="w-3 h-3" />
                                                100% Bảo vệ
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                                {milestone.description || 'Không có mô tả.'}
                            </div>

                            {/* Attachments & Deliverables Logic */}
                            <div className="mt-6 space-y-4">
                                {/* Deliverables (if submitted) */}
                                {milestone.deliverables && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Sản phẩm đã nộp
                                        </h4>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap font-medium">{milestone.deliverables}</p>
                                    </div>
                                )}

                                {/* Existing Attachments */}
                                {milestone.attachments?.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {milestone.attachments.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={file.fileUrl}
                                                target="_blank"
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#007fed]/40 hover:bg-blue-50 transition shadow-sm group"
                                            >
                                                <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#007fed]" />
                                                <div className="truncate text-sm text-gray-700 font-medium group-hover:text-[#007fed]">{file.fileName}</div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-100">
                                {/* Freelancer: Start (PENDING -> IN_PROGRESS) */}
                                {isFreelancer && milestone.status === 'PENDING' && milestone.escrowStatus === 'LOCKED' && (
                                    <button
                                        onClick={() => handlers.onStart?.(milestone.id)}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm"
                                    >
                                        <Play className="w-4 h-4" /> Bắt đầu làm việc
                                    </button>
                                )}
                                {/* Freelancer: Waiting for Funds (PENDING, not funded) */}
                                {isFreelancer && milestone.status === 'PENDING' && milestone.escrowStatus !== 'LOCKED' && (
                                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Đã phân bổ tự động
                                    </div>
                                )}
                                {/* Freelancer: Submit (IN_PROGRESS) */}
                                {isFreelancer && milestone.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handlers.onSubmit?.(milestone)}
                                        className="px-6 py-2.5 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md"
                                    >
                                        <Upload className="w-4 h-4" /> Nộp công việc
                                    </button>
                                )}


                                {/* Employer: Waiting for Freelancer (PENDING, funded) */}
                                {isEmployer && milestone.status === 'PENDING' && milestone.escrowStatus === 'LOCKED' && (
                                    <div className="px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Chờ freelancer
                                    </div>
                                )}
                                {/* Employer: Approve/Reject (SUBMITTED) */}
                                {isEmployer && milestone.status === 'SUBMITTED' && (
                                    <>
                                        <button
                                            onClick={() => handlers.onReject?.(milestone)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition border border-gray-200 hover:border-red-200"
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            onClick={() => handlers.onApprove?.(milestone.id)}
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Phê duyệt & Thanh toán
                                        </button>
                                    </>
                                )}

                                {/* Edit/Delete (Employer Only for Pending, not funded) */}
                                {isEmployer && milestone.status === 'PENDING' && milestone.escrowStatus !== 'LOCKED' && (
                                    <>
                                        <button
                                            onClick={() => handlers.onEdit?.(milestone)}
                                            className="p-2.5 text-gray-500 hover:text-[#007fed] hover:bg-blue-50 rounded-lg transition"
                                            title="Sửa"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlers.onDelete?.(milestone.id)}
                                            className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
