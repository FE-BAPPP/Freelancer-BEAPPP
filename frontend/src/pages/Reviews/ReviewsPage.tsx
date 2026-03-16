import { useEffect, useState } from 'react';
import { Star, Briefcase, MessageSquare, TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/Common/Avatar';

interface Review {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadReviews();
      loadStats();
    }
  }, [user?.id, activeTab, page]);

  const loadReviews = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = activeTab === 'received'
        ? await reviewApi.getReviewsForUser(user.id, page, 10)
        : await reviewApi.getReviewsByUser(user.id, page, 10);

      if (response) {
        setReviews(response.content || []);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const response: any = await reviewApi.getReviewStatistics(user.id);
      if (response) {
        setStats({
          averageRating: response.averageRating || 0,
          totalReviews: response.totalReviews || 0,
          ratingDistribution: {
            5: response.fiveStars || 0,
            4: response.fourStars || 0,
            3: response.threeStars || 0,
            2: response.twoStars || 0,
            1: response.oneStar || 0,
          }
        });
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1f2125] p-8 rounded-lg shadow-sm border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#007fed] rounded-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Đánh giá của tôi</h1>
              <p className="text-gray-400 font-medium">Theo dõi uy tín và phản hồi từ đối tác</p>
            </div>
          </div>
          <button
            onClick={() => { loadReviews(); loadStats(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-bold border border-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats */}
          <div className="space-y-6">
            {stats && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#007fed]" />
                  Tổng quan
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div>
                      <p className="text-sm text-yellow-800 font-bold mb-1">Xếp hạng trung bình</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-yellow-900">{stats.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm font-bold text-yellow-700">/ 5.0</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(Math.round(stats.averageRating || 0), 'md')}
                      <p className="text-xs text-yellow-700 mt-2 font-bold">{stats.totalReviews} đánh giá</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                      <MessageSquare className="w-5 h-5 text-[#007fed] mx-auto mb-2" />
                      <p className="text-2xl font-black text-[#007fed]">{stats.totalReviews}</p>
                      <p className="text-xs font-bold text-blue-700">Tổng đánh giá</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                      <Star className="w-5 h-5 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-black text-green-700">{stats.ratingDistribution?.[5] || 0}</p>
                      <p className="text-xs font-bold text-green-700">5 sao</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats && stats.totalReviews > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Phân bổ đánh giá</h3>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingDistribution?.[star] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 w-12 font-bold text-gray-600">
                          {star} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500 font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="border-b border-gray-100 p-1 flex gap-2 overflow-x-auto bg-gray-50/50">
                <button
                  onClick={() => { setActiveTab('received'); setPage(0); }}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-all rounded-t-lg
                    ${activeTab === 'received'
                      ? 'bg-white text-[#007fed] border-b-2 border-[#007fed] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:bg-gray-50'
                    }`}
                >
                  Đánh giá đã nhận
                </button>
                <button
                  onClick={() => { setActiveTab('given'); setPage(0); }}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-all rounded-t-lg
                    ${activeTab === 'given'
                      ? 'bg-white text-[#007fed] border-b-2 border-[#007fed] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:bg-gray-50'
                    }`}
                >
                  Đánh giá đã gửi
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#007fed] border-t-transparent mb-4"></div>
                    <p className="font-bold">Đang tải đánh giá...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-24 text-gray-500">
                    <Layers className="w-20 h-20 mx-auto mb-6 opacity-10" />
                    <p className="font-bold text-xl text-gray-900">Không tìm thấy đánh giá nào</p>
                    <p className="text-gray-500 mt-2 font-medium">
                      {activeTab === 'received'
                        ? 'Hoàn thành các dự án để bắt đầu nhận đánh giá từ khách hàng.'
                        : 'Bạn chưa gửi đánh giá nào cho đối tác.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-6 bg-gray-50 border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-all border-l-4 hover:border-l-[#007fed]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={review.reviewerAvatar}
                              name={review.reviewerName}
                              size="lg"
                              className="w-12 h-12 rounded-full border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{review.reviewerName}</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                <span className="flex items-center gap-1 font-bold text-[#007fed]">
                                  <Briefcase className="w-4 h-4" />
                                  {review.projectTitle || 'Dự án'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {renderStars(review.rating, 'md')}
                            <span className="font-black text-[#007fed]">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="pl-0 mt-2">
                          <p className="text-gray-700 text-base leading-relaxed font-medium bg-white/50 p-4 rounded-lg border border-gray-100 italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <div className="text-sm font-bold text-gray-500">Trang {page + 1} / {totalPages}</div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded hover:bg-gray-50 disabled:opacity-50 transition-all"
                      >
                        Trang trước
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 bg-[#007fed] text-white font-bold rounded hover:bg-[#006bb3] disabled:opacity-50 transition-all shadow-sm"
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;
