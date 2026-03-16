import { Star, Calendar } from 'lucide-react';
import { Review } from '../../types/api';
import { Avatar } from '../Common/Avatar';

interface ReviewCardProps {
  review: Review;
  showProject?: boolean;
  className?: string;
}

export function ReviewCard({ review, showProject = false, className = '' }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-2 text-lg font-black text-gray-900">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={review.reviewerAvatar}
            name={review.reviewerName}
            size="lg"
            className="w-12 h-12 rounded-full border border-gray-200"
          />
          <div>
            <p className="font-bold text-gray-900">{review.reviewerName || 'Người mua ẩn danh'}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
        {renderStars(review.rating)}
      </div>

      {/* Project Title */}
      {showProject && review.projectTitle && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dự án:</p>
          <p className="text-gray-900 font-bold">{review.projectTitle}</p>
        </div>
      )}

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
          "{review.comment}"
        </p>
      )}

      {/* Rating Categories */}
      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        <div className="flex justify-between items-center bg-white p-2 border-b border-gray-50">
          <span className="text-sm font-bold text-gray-500">Chất lượng:</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm text-gray-900 font-black">{review.qualityRating?.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white p-2 border-b border-gray-50">
          <span className="text-sm font-bold text-gray-500">Giao tiếp:</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm text-gray-900 font-black">{review.communicationRating?.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white p-2 border-b border-gray-50">
          <span className="text-sm font-bold text-gray-500">Chuyên nghiệp:</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm text-gray-900 font-black">{review.professionalismRating?.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white p-2 border-b border-gray-50">
          <span className="text-sm font-bold text-gray-500">Đúng hạn:</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm text-gray-900 font-black">{review.deadlineRating?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
