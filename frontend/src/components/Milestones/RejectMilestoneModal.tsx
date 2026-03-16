import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RejectMilestoneModalProps {
  milestone: any;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
}

export function RejectMilestoneModal({ milestone, onClose, onReject }: RejectMilestoneModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide at least 10 characters explaining why you are rejecting');
      return;
    }

    setLoading(true);
    try {
      await onReject(reason);
    } catch (err: any) {
      setError(err.message || 'Failed to reject milestone');
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
        className="bg-white border border-gray-100 rounded-2xl p-8 max-w-xl w-full shadow-2xl"
      >
        <h2 className="text-xl font-black text-gray-900 mb-2">Từ chối sản phẩm</h2>
        <p className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
          Giai đoạn: <span className="text-[#007fed] font-bold">{milestone.title}</span>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error === 'Please provide at least 10 characters explaining why you are rejecting' ? 'Vui lòng cung cấp ít nhất 10 ký tự giải thích lý do từ chối' : error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Lý do từ chối *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium resize-none shadow-sm"
              rows={5}
              placeholder="Vui lòng giải thích những gì cần được cải thiện hoặc chỉnh sửa..."
              required
              disabled={loading}
            />
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-tighter mt-2 leading-relaxed italic">
              Freelancer sẽ xem phản hồi này và có thể nộp lại sau khi chỉnh sửa.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 font-bold text-sm"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Đang từ chối...
                </div>
              ) : 'Từ chối sản phẩm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
