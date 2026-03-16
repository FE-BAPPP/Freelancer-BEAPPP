// frontend/src/components/Proposals/SubmitProposalModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Clock, FileText, AlertCircle, CheckCircle, Upload, Paperclip } from 'lucide-react';
import { proposalApi, ProposalCreateRequest } from '../../services/proposalApi';
import { projectApi } from '../../services/api';
import { formatDuration } from '../../components/Jobs/types';

interface SubmitProposalModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubmitProposalModal({ job, isOpen, onClose, onSuccess }: SubmitProposalModalProps) {
  const [formData, setFormData] = useState<ProposalCreateRequest>({
    jobId: '',
    coverLetter: '',
    proposedAmount: 0,
    estimatedDurationDays: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);


  useEffect(() => {
    if (isOpen && job?.id) {
      setFormData(prev => ({
        ...prev,
        jobId: job.id // Ensure jobId is set from job object
      }));
      setError(null);
      setSuccess(false);
      setUploadedFiles([]);
    }
  }, [isOpen, job]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.jobId) {
      setError('Thiếu mã định danh công việc (Job ID). Vui lòng thử lại.');
      return;
    }

    if (!formData.coverLetter || formData.coverLetter.trim().length < 50) {
      setError('Thư giới thiệu phải có ít nhất 50 ký tự');
      return;
    }

    if (!formData.proposedAmount || formData.proposedAmount < 1) {
      setError('Giá thầu đề xuất phải ít nhất là 1 PTS');
      return;
    }

    if (!formData.estimatedDurationDays || formData.estimatedDurationDays < 1) {
      setError('Thời gian thực hiện dự kiến phải ít nhất là 1 ngày');
      return;
    }

    try {
      setLoading(true);

      const payload: ProposalCreateRequest = {
        jobId: formData.jobId,
        coverLetter: formData.coverLetter.trim(),
        proposedAmount: Number(formData.proposedAmount),
        estimatedDurationDays: Number(formData.estimatedDurationDays)
      };

      const response = await proposalApi.submitProposal(payload);

      // Upload files if any
      const proposalId = response.data?.id || response.id;
      if (uploadedFiles.length > 0 && proposalId) {
        setUploadingFiles(true);
        for (const file of uploadedFiles) {
          try {
            await projectApi.uploadFile(file, 'PROPOSAL', proposalId);
          } catch (err) {
            console.error('Failed to upload file:', err);
          }
        }
        setUploadingFiles(false);
      }

      setSuccess(true);

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setFormData({
          jobId: job.id,
          coverLetter: '',
          proposedAmount: 0,
          estimatedDurationDays: 1
        });

        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Gửi đề xuất thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#007fed]" />
                Gửi đề xuất dự án
              </h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-1 font-medium italic">
                {job?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Messages */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-green-800 font-bold text-sm">Gửi đề xuất thành công!</p>
                  <p className="text-green-700 text-xs mt-1">Chủ dự án sẽ sớm liên hệ với bạn.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Details Summary Header */}
              {job && (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tổng quan ngân sách dự án</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngân sách dự kiến</p>
                      <p className="text-gray-900 font-bold">{job.budgetMin?.toLocaleString()} - {job.budgetMax?.toLocaleString()} PTS</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Thời hạn mong muốn</p>
                      <p className="text-gray-900 font-bold">{formatDuration(job.duration)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-xs text-gray-500 mb-1">Danh mục</p>
                      <p className="text-gray-900 font-bold">{job.category || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Proposed Amount */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Giá thầu của bạn (PTS) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.proposedAmount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        proposedAmount: parseFloat(e.target.value) || 0
                      })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#007fed]/10 focus:border-[#007fed] font-bold transition-all"
                      placeholder="0.00"
                      required
                      min="1"
                      step="0.01"
                      disabled={loading || success}
                    />
                  </div>
                  {formData.proposedAmount > (job?.budgetMax || Infinity) && (
                    <p className="text-amber-600 text-[10px] font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Vượt quá ngân sách tối đa
                    </p>
                  )}
                </div>

                {/* Estimated Duration */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Thời gian hoàn thành (Ngày) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.estimatedDurationDays}
                      onChange={(e) => setFormData({
                        ...formData,
                        estimatedDurationDays: parseInt(e.target.value) || 1
                      })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#007fed]/10 focus:border-[#007fed] font-bold transition-all"
                      placeholder="Ví dụ: 7"
                      required
                      min="1"
                      max="365"
                      disabled={loading || success}
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Thư giới thiệu / Đề xuất thực hiện <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#007fed]/10 focus:border-[#007fed] transition-all min-h-[160px] leading-relaxed"
                    placeholder="Giới thiệu kinh nghiệm và cách bạn sẽ thực hiện dự án này..."
                    required
                    minLength={50}
                    maxLength={2000}
                    disabled={loading || success}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  <span>Tối thiểu 50 ký tự</span>
                  <span className={formData.coverLetter.length < 50 ? 'text-amber-500' : 'text-emerald-500'}>
                    {formData.coverLetter.length} / 2000
                  </span>
                </div>
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Tài liệu đính kèm (Tùy chọn)
                </label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#007fed] transition-all group cursor-pointer relative">
                  <input
                    type="file"
                    id="proposal-file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    disabled={loading || success}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-[#007fed]" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Tải lên hồ sơ năng lực hoặc mẫu thiết kế</p>
                    <p className="text-xs text-gray-400">PDF, Word, Ảnh, ZIP (Max 10MB/file)</p>
                  </div>
                </div>

                {/* Uploaded Files List */}
                <AnimatePresence>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {uploadedFiles.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-blue-50 rounded-lg text-[#007fed]">
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                              <p className="text-[10px] font-bold text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            disabled={loading || success}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100 mt-8 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || uploadingFiles}
                  className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading || success || uploadingFiles}
                  className="flex-[1.5] px-6 py-3.5 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading || uploadingFiles ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {uploadingFiles ? 'Đang tải tệp...' : 'Đang xử lý...'}
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Đã gửi thành công
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi đề xuất ngay
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
