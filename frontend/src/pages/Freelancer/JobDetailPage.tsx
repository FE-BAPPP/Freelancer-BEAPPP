import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    ArrowLeft, Clock,
    AlertCircle,
    FileText, Heart,
    Paperclip, CheckCircle2,
    MapPin, Star, Flag, RefreshCw
} from 'lucide-react';
import { jobApi } from '../../services/jobApi';
import { projectApi, FileResponse } from '../../services/api';
import { profileApi } from '../../services/profileApi';
import { reviewApi } from '../../services/reviewApi';
import { SubmitProposalModal } from '../../components/Proposals/SubmitProposalModal';
import { getRelativeTime, formatDuration } from '../../components/Jobs/types';
import { EmployerProfile, ReviewStatistics } from '../../types/api';
import { Avatar } from '../../components/Common/Avatar';



export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [jobFiles, setJobFiles] = useState<FileResponse[]>([]);
    const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
    const [employerStats, setEmployerStats] = useState<ReviewStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (id) {
            loadJobDetails();
        }
        window.scrollTo(0, 0);
    }, [id]);

    const loadJobDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await jobApi.getJobById(id!);

            let jobData: any;
            if (response.success && response.data) jobData = response.data;
            else if ((response as any).id) jobData = response;
            else throw new Error('Invalid response structure');

            setJob(jobData);

            // Fetch Employer Profile and Stats
            if (jobData.employerId) {
                try {
                    const [profileRes, statsRes]: [any, any] = await Promise.all([
                        profileApi.getEmployerProfile(jobData.employerId).catch(() => ({ success: false })),
                        reviewApi.getReviewStatistics(jobData.employerId).catch(() => null)
                    ]);

                    if (profileRes.success && profileRes.data) {
                        setEmployerProfile(profileRes.data);
                    }
                    if (statsRes) {
                        setEmployerStats(statsRes);
                    }
                } catch (profErr) {
                    console.warn('Failed to fetch employer stats:', profErr);
                }
            }

            try {
                const files = await projectApi.getFiles('JOB', jobData.id);
                setJobFiles(files || []);
            } catch (fileErr) {
                console.warn('Failed to fetch job files:', fileErr);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#5B8DEF] animate-spin"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#f7f7f7] p-8 flex flex-col items-center justify-center">
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-lg shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-8">{error || 'Không tìm thấy thông tin công việc'}</p>
                    <button
                        onClick={() => navigate('/browse-jobs')}
                        className="px-6 py-2 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white rounded font-bold transition-all"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const budgetDisplay = job.budgetMin && job.budgetMax
        ? `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()} PTS`
        : `${(job.budgetMax || job.budgetMin || 0).toLocaleString()} PTS`;

    const avgBid = job.avgBid ? `${job.avgBid.toLocaleString()} PTS` : null;

    return (
        <div className="min-h-screen bg-[#f7f7f7] font-sans text-[#4d525b] pb-20">
            {/* Header Section (Dark) */}
            <div className="bg-[#1f2125] text-white pt-8 pb-12 px-4 md:px-8 border-b border-gray-800">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb nav */}
                    <button
                        onClick={() => navigate('/browse-jobs')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Danh sách việc làm</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                                {job.title}
                            </h1>

                            {/* Project Stats in Header */}
                            <div className="flex flex-wrap items-center gap-6 md:gap-12">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-400 font-medium mb-1">Đề xuất</span>
                                    <span className="text-xl font-bold text-white">{job.proposalCount || 0}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-400 font-medium mb-1">Ngân sách (PTS)</span>
                                    <span className="text-xl font-bold text-white">{budgetDisplay}</span>
                                </div>
                                {avgBid && (
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-400 font-medium mb-1">Trung bình (PTS)</span>
                                        <span className="text-xl font-bold text-white">{avgBid}</span>
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-400 font-medium mb-1">Ngày đăng</span>
                                    <span className="text-lg font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {getRelativeTime(job.createdAt)}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-400 font-medium mb-1">Trạng thái</span>
                                    <span className={`text-lg font-bold flex items-center gap-2 ${job.status === 'OPEN' ? 'text-emerald-400' : 'text-gray-400'}`}>
                                        {job.status === 'OPEN' ? 'Đang nhận đề xuất' : 'Đã đóng'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => loadJobDetails()}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-600 text-white hover:bg-white/10 rounded font-bold transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                                title="Làm mới"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </button>
                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className={`px-4 py-2 border rounded font-bold transition-colors text-sm flex items-center gap-2 ${isSaved
                                    ? 'bg-pink-600 border-pink-600 text-white'
                                    : 'border-gray-600 text-white hover:bg-white/10'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                {isSaved ? 'Đã lưu' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs (Visual only to match style) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex gap-8 text-sm font-bold overflow-x-auto">
                        <button className="py-4 border-b-2 border-[#5B8DEF] text-gray-900">Chi tiết</button>
                        <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 transition-colors">Đề xuất</button>
                        <button className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-900 transition-colors">Thảo luận</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column (Left) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Project Details */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Mô tả dự án</h2>
                            <div className="prose max-w-none mb-8 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {job.description || 'Không có mô tả chi tiết'}
                            </div>

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                                <div className="mb-8 pt-8 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Kỹ năng yêu cầu</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gray-100 text-[#5B8DEF] rounded text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Project ID: {job.id}</span>
                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                                    <Flag className="w-3 h-3" />
                                    Báo cáo dự án
                                </button>
                            </div>
                        </div>

                        {/* Attachments */}
                        {jobFiles.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                    Tài liệu đính kèm
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {jobFiles.map(file => (
                                        <a
                                            key={file.id}
                                            href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-gray-500 border border-gray-200">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-[#5B8DEF] truncate group-hover:underline">{file.fileName}</p>
                                                <p className="text-xs font-medium text-gray-500 mt-0.5">
                                                    {(file.fileSize / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column (Right) */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="mb-6">
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate(`/login?redirect=/jobs/${id}`);
                                            return;
                                        }
                                        setShowProposalModal(true);
                                    }}
                                    disabled={job.status !== 'OPEN' || job.hasApplied}
                                    className={`w-full py-3 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 ${job.status === 'OPEN' && !job.hasApplied
                                        ? 'bg-[#5B8DEF] hover:bg-[#4A90E2] text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                                        }`}
                                >
                                    {job.hasApplied ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Đã nộp đề xuất
                                        </>
                                    ) : job.status === 'OPEN' ? (
                                        user ? 'Gửi đề xuất ngay' : 'Đăng nhập để gửi đề xuất'
                                    ) : (
                                        'Đã đóng tuyển'
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Thời gian thực hiện</span>
                                    <span className="text-sm font-bold text-gray-900">{formatDuration(job.duration)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Trạng thái thầu</span>
                                    <span className={`text-sm font-bold ${job.status === 'OPEN' ? "text-green-600" : "text-gray-500"}`}>
                                        {job.status === 'OPEN' ? 'Đang nhận hồ sơ' : 'Đã kết thúc'}
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* Client Info Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="text-md font-bold text-gray-900 mb-6">Thông tin khách hàng</h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0">
                                    <Avatar
                                        src={job.employerAvatar}
                                        name={job.employerName}
                                        className="w-12 h-12 rounded-full border border-gray-200"
                                        size="md"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 font-bold text-sm hover:underline cursor-pointer">{job.employerName || 'Người dùng ẩn danh'}</h4>
                                    {job.location && (
                                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{job.location}</span>
                                        </div>
                                    )}
                                    {employerStats && employerStats.averageRating > 0 && (
                                        <div className="flex items-center gap-1 text-amber-500 text-xs mt-1 font-bold">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{employerStats.averageRating.toFixed(1)}</span>
                                            <span className="text-gray-400 font-normal">({employerStats.totalReviews} đánh giá)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {employerProfile && (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-500">Dự án đã đăng</span>
                                            <span className="font-bold text-gray-900">{employerProfile.jobsPosted || 0}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-500">Đang thực hiện</span>
                                            <span className="font-bold text-green-600">{employerProfile.activeProjects || 0}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-500">Tổng chi trả</span>
                                            <span className="font-bold text-[#5B8DEF]">{employerProfile.totalSpent?.toLocaleString() || 0} PTS</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500">Thành viên từ</span>
                                    <span className="font-bold text-gray-900">Oct 20, 2012</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Đã xác minh thanh toán</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Đã xác minh email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SubmitProposalModal
                job={job}
                isOpen={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                onSuccess={() => loadJobDetails()}
            />
        </div>
    );
}
