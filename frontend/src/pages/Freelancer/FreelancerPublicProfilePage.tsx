import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Star, Briefcase,
  ExternalLink, Github, Linkedin,
  Globe, MapPin, MessageSquare, BarChart3
} from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { Avatar } from '../../components/Common';

export function FreelancerPublicProfilePage() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (freelancerId) {
      loadProfile();
    }
  }, [freelancerId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getFreelancerProfile(freelancerId!);

      console.log('📋 Freelancer Profile Response:', response);

      const data = response.data || response;
      setProfile(data);
    } catch (error) {
      console.error('Failed to load freelancer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h3>
          <p className="text-gray-500 mb-6">Hồ sơ freelancer này không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-[#1f2125] text-white pt-10 pb-16 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold">Hồ sơ Freelancer</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={profile.avatar}
                name={profile.userName}
                size="xl"
                className="w-24 h-24 border border-gray-200"
              />

              {/* Availability Badge */}
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${profile.availability === 'AVAILABLE' ? 'bg-green-500' :
                profile.availability === 'BUSY' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.userName}</h1>
              <p className="text-lg text-[#007fed] font-medium mt-1">
                {profile.professionalTitle || 'Freelancer'}
              </p>

              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Vietnam</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-2 ${profile.availability === 'AVAILABLE'
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${profile.availability === 'AVAILABLE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {profile.availability === 'AVAILABLE' ? 'Sẵn sàng làm việc' : 'Bận'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'Freelancer chưa thêm giới thiệu.'}
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Kỹ năng</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white hover:bg-gray-50 text-[#007fed] border border-gray-300 rounded-full text-sm font-medium transition-colors"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">Chưa có kỹ năng nào</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Links */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Dự án hoàn thành', value: profile.jobsCompleted || 0, icon: Briefcase, color: 'text-[#007fed]' },
                { label: 'Thu nhập', value: `$${profile.totalEarnings?.toFixed(0) || 0}`, icon: BarChart3, color: 'text-green-600' },
                { label: 'Đánh giá', value: profile.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-amber-500' },
                { label: 'Nhận xét', value: profile.jobsCompleted || 0, icon: MessageSquare, color: 'text-purple-500' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-sm"
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-xs text-gray-500 font-bold uppercase">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Liên kết</h3>
              <div className="space-y-2">
                {profile.portfolioUrl ? (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" /> Portfolio
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </a>
                ) : null}
                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group"
                  >
                    <Linkedin className="w-4 h-4 flex-shrink-0" /> LinkedIn
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </a>
                ) : null}
                {profile.githubUrl ? (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group"
                  >
                    <Github className="w-4 h-4 flex-shrink-0" /> GitHub
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </a>
                ) : null}
                {!profile.portfolioUrl && !profile.linkedinUrl && !profile.githubUrl ? (
                  <p className="text-sm text-gray-500 italic">Chưa có liên kết nào</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}