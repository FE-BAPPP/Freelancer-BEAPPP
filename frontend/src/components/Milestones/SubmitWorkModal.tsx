import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, Upload, Loader2, Trash2 } from 'lucide-react';
import { FileUpload } from '../Common/FileUpload';
import { filesApi } from '../../services/filesApi';
import { FileResponse } from '../../services/api';

interface SubmitWorkModalProps {
  milestone: any;
  onClose: () => void;
  onSubmit: (deliverables: string, notes: string) => Promise<void>;
}

export function SubmitWorkModal({ milestone, onClose, onSubmit }: SubmitWorkModalProps) {
  const [deliverables, setDeliverables] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState('');

  // Load existing files when modal opens
  useEffect(() => {
    loadExistingFiles();
  }, [milestone.id]);

  const loadExistingFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await filesApi.getFilesByEntity('MILESTONE', milestone.id);
      if (response.success && response.data) {
        setUploadedFiles(response.data);
      }
    } catch (err) {
      console.error('Failed to load existing files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleUploadSuccess = (file: FileResponse) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleUploadError = (msg: string) => {
    setError(msg);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await filesApi.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err: any) {
      setError('Failed to delete file: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deliverables.trim() || deliverables.trim().length < 20) {
      setError('Please provide at least 20 characters describing your deliverables');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(deliverables, notes);
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-gray-100 rounded-2xl p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl custom-scrollbar"
      >
        <h2 className="text-xl font-black text-gray-900 mb-2">Nộp sản phẩm để đánh giá</h2>
        <p className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
          Giai đoạn: <span className="text-[#007fed] font-bold">{milestone.title}</span>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error === 'Please provide at least 20 characters describing your deliverables' ? 'Vui lòng cung cấp ít nhất 20 ký tự mô tả sản phẩm của bạn' : error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deliverables Text */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Sản phẩm / Công việc đã hoàn thành *
            </label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#007fed]/10 focus:border-[#007fed] transition-all font-medium resize-none shadow-sm"
              rows={5}
              placeholder="Mô tả chi tiết những gì bạn đã hoàn thành..."
              required
              disabled={loading}
            />
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Tối thiểu 20 ký tự</p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              📁 Tải tệp dự án lên <span className="text-gray-400 font-medium">(ZIP, PDF, Ảnh, v.v.)</span>
            </label>

            <FileUpload
              entityType="MILESTONE"
              entityId={milestone.id}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              acceptedTypes=".zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.psd,.ai,.fig"
              maxSizeMB={50}
              label="Nhấp để tải lên hoặc kéo thả"
            />

            {/* Uploaded Files List */}
            {loadingFiles ? (
              <div className="flex items-center justify-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Loader2 className="w-6 h-6 animate-spin mr-3 text-[#007fed]" />
                <span className="font-bold text-sm">Đang tải danh sách tệp...</span>
              </div>
            ) : uploadedFiles.length > 0 ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Tệp đã tải lên ({uploadedFiles.length}):</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={file.id || idx} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-[#007fed] transition-all group shadow-sm">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-[#007fed] flex-shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm truncate font-bold">{file.fileName}</p>
                          <p className="text-gray-400 text-[10px] font-bold">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <a
                          href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#007fed] hover:underline font-bold"
                        >
                          Tải về
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                          title="Xóa tệp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-sm font-bold text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có tệp nào được tải lên
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Ghi chú thêm <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#007fed]/10 focus:border-[#007fed] transition-all font-medium resize-none shadow-sm"
              rows={3}
              placeholder="Thông tin bổ sung cho nhà tuyển dụng..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold border border-gray-200 text-sm"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-[#007fed] text-white font-black rounded-xl hover:bg-[#006bb3] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Gửi để đánh giá
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
