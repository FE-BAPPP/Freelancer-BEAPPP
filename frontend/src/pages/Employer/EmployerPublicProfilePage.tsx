import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Globe, Users, Briefcase, DollarSign, ArrowLeft, Star, ExternalLink, MapPin, Calendar, Search, Shield } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { reviewApi } from '../../services/reviewApi';
import { EmployerProfile } from '../../types/api';

interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function EmployerPublicProfilePage() {
  const { employerId } = useParams<{ employerId: string }>();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employerId) {
      loadProfile();
    }
  }, [employerId]);

  const loadProfile = async () => {
    if (!employerId) return;

    try {
      setLoading(true);
      setError(null);

      const [profileRes, statsRes]: [any, any] = await Promise.all([
        profileApi.getEmployerProfile(employerId),
        reviewApi.getReviewStatistics(employerId).catch(() => null),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      } else {
        setError(profileRes.message || 'Không tìm thấy hồ sơ nhà tuyển dụng');
      }

      if (statsRes) {
        setStats({
          averageRating: statsRes.averageRating || 0,
          totalReviews: statsRes.totalReviews || 0,
          ratingDistribution: {
            5: statsRes.fiveStars || 0,
            4: statsRes.fourStars || 0,
            3: statsRes.threeStars || 0,
            2: statsRes.twoStars || 0,
            1: statsRes.oneStar || 0,
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải hồ sơ này');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#007fed]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-8 flex flex-col items-center justify-center">
        <Link to={-1 as any} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold uppercase text-xs tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm max-w-lg w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-gray-500">{error || 'Hồ sơ nhà tuyển dụng này không tồn tại hoặc đã bị ẩn.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-12">
      {/* Header Banner */}
      <div className="h-64 bg-[#1f2125] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <Link to={-1 as any} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-bold text-xs uppercase tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-24 h-24 bg-white rounded-xl shadow-md border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                {/* Reuse avatar if available or icon */}
                <div className="w-full h-full bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-[#007fed]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.companyName || 'Tên Công Ty'}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                  {profile.industry && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {profile.industry}
                    </span>
                  )}
                  {profile.industry && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                  {profile.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Tham gia {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {stats && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-2xl text-gray-900">{stats.averageRating?.toFixed(1) || '0.0'}</span>
                      <div>
                        {renderStars(Math.round(stats.averageRating || 0))}
                        <p className="text-xs text-gray-400 mt-0.5">{stats.totalReviews || 0} đánh giá</p>
                      </div>
                    </div>
                  )}

                  {profile.companyWebsite && (
                    <a
                      href={profile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-[#007fed] hover:bg-blue-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:border-blue-200 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-50 text-[#007fed] rounded-full flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.jobsPosted || 0}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tin đã đăng</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:border-emerald-200 transition-colors"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.activeProjects || 0}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Dự án đang chạy</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:border-amber-200 transition-colors"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.totalSpent?.toLocaleString() || '0'}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tổng chi (PTS)</p>
          </motion.div>

          {/* Details & Reviews */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                Thông tin chi tiết
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {profile.companySize && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quy mô công ty</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {profile.companySize === 'SOLO' ? 'Cá nhân' :
                        profile.companySize === 'SMALL' ? 'Nhỏ (1-10 nhân viên)' :
                          profile.companySize === 'MEDIUM' ? 'Vừa (11-50 nhân viên)' :
                            profile.companySize === 'LARGE' ? 'Lớn (50+ nhân viên)' : profile.companySize}
                    </p>
                  </div>
                )}

                {profile.industry && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Lĩnh vực</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {profile.industry}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Xác thực</p>
                  <p className="text-emerald-600 font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Đã xác thực email
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-1">
            {stats && stats.totalReviews > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full"
              >
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Phân bố đánh giá</h2>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingDistribution?.[star] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold text-xs w-8 flex items-center gap-1">
                          {star} <Star className="w-3 h-3" />
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-6 text-right font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Chưa có đánh giá nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerPublicProfilePage;
