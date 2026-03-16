import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewApi } from '../../services';
import { Review } from '../../types/api';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  userId?: string;
  projectId?: string;
  limit?: number;
  showProject?: boolean;
}

export function ReviewList({ userId, projectId, limit, showProject = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [userId, projectId]);

  async function loadReviews() {
    try {
      setLoading(true);

      let response;
      if (projectId) {
        response = await reviewApi.getReviewsForProject(projectId);
      } else if (userId) {
        response = await reviewApi.getReviewsForUser(userId, 0, limit || 10);
      } else {
        response = await reviewApi.getMyReviews(0, limit || 10);
      }

      const data = (response as any)?.content || (response as any)?.data || response || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Star className="w-8 h-8 text-[#007fed]" />
        </div>
        <p className="text-gray-500 font-medium font-bold">Chưa có đánh giá nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showProject={showProject}
        />
      ))}
    </div>
  );
}
