import { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { CreateReviewRequest } from '../../types/api';

interface ReviewFormProps {
  projectId: string;
  revieweeId: string;
  revieweeName: string;
  onSubmit: (data: CreateReviewRequest) => Promise<void>;
  onClose: () => void;
}

export function ReviewForm({ projectId, revieweeId, revieweeName, onSubmit, onClose }: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      // Only send fields that backend expects
      await onSubmit({
        projectId,
        revieweeId,
        rating: formData.rating,
        comment: formData.comment,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Viết đánh giá</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">cho <span className="text-[#007fed] font-bold">{revieweeName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Đánh giá chung *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 ${star <= formData.rating
                      ? 'fill-amber-400 text-amber-400 shadow-amber-400/20'
                      : 'text-gray-200 hover:text-amber-200'
                      }`}
                  />
                </button>
              ))}
              <div className="ml-auto flex flex-col items-end">
                <span className="text-2xl font-black text-gray-900">{formData.rating}.0</span>
                <span className="text-[10px] font-bold text-[#007fed] uppercase tracking-tighter">Xếp hạng</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Nhận xét của bạn <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Hãy chia sẻ trải nghiệm làm việc của bạn cho dự án này..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#007fed] focus:ring-4 focus:ring-[#007fed]/10 transition-all resize-none font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 font-bold text-sm"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3.5 bg-[#007fed] text-white font-black rounded-xl hover:bg-[#006bb3] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 text-sm"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </div>
              ) : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
