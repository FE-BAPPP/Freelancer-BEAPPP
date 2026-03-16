"use client"

import { useEffect, useState } from 'react';
import { User, Briefcase, DollarSign, Star, Link, Edit, Tag, X, MapPin, FileText, MessageSquare, BarChart3, ExternalLink, Github, Linkedin } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { FreelancerProfile } from '../../types/api';
import { AvatarUpload, Avatar } from '../../components/Common';

export function FreelancerProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    professionalTitle: '',
    bio: '',
    availability: 'AVAILABLE',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Skills as simple comma-separated text (no skill IDs)
  const [skillText, setSkillText] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getMyFreelancerProfile();

      if (response.success && response.data) {
        const data = response.data;
        setProfile(data);
        setFormData({
          professionalTitle: data.professionalTitle || '',
          bio: data.bio || '',
          availability: data.availability || 'AVAILABLE',
          portfolioUrl: data.portfolioUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
        });
        // set simple skill text from profile
        setSkillText((data.skills || []).join(', '));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getMyFreelancerProfile();

      if (response.success && response.data) {
        const data = response.data;
        setProfile(data);
        setFormData({
          professionalTitle: data.professionalTitle || '',
          bio: data.bio || '',
          availability: data.availability || 'AVAILABLE',
          portfolioUrl: data.portfolioUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
        });
        setSkillText((data.skills || []).join(', '));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // include skills (as simple names) in update request
      const skills = skillText.split(',').map(s => s.trim()).filter(Boolean);
      const response = await profileApi.updateFreelancerProfile({ ...formData, skills } as any);
      if (response.success) {
        await loadProfile();
        setEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-[#1f2125] text-white pt-10 pb-16 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                {editing ? (
                  <AvatarUpload
                    currentAvatar={profile?.avatar}
                    name={profile?.userName}
                    size="xl"
                    onUpload={async (file) => {
                      const response = await profileApi.uploadAvatar(file);
                      if (response.success && response.data) {
                        await loadProfile();
                      } else {
                        throw new Error(response.message || 'Upload failed');
                      }
                    }}
                    onDelete={async () => {
                      const response = await profileApi.deleteAvatar();
                      if (response.success) {
                        await loadProfile();
                      } else {
                        throw new Error(response.message || 'Delete failed');
                      }
                    }}
                  />
                ) : (
                  <Avatar
                    src={profile?.avatar}
                    name={profile?.userName}
                    size="xl"
                    className="w-24 h-24 border border-gray-200"
                  />
                )}
              </div>

              <div className="pt-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.userName}
                </h1>
                <p className="text-lg text-[#007fed] font-medium mt-1">
                  {profile?.professionalTitle || 'Freelancer'}
                </p>

                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Vietnam</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-2 ${profile?.availability === 'AVAILABLE'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${profile?.availability === 'AVAILABLE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {profile?.availability === 'AVAILABLE' ? 'Sẵn sàng làm việc' : 'Bận'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded bg-[#007fed] hover:bg-[#006bb3] text-white text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded border border-[#007fed] text-[#007fed] hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                Giới thiệu
              </h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chức danh chuyên môn</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#007fed] focus:ring-1 focus:ring-[#007fed] outline-none text-sm shadow-sm"
                      value={formData.professionalTitle}
                      onChange={e => setFormData({ ...formData, professionalTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Giới thiệu bản thân</label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#007fed] focus:ring-1 focus:ring-[#007fed] outline-none text-sm min-h-[120px] shadow-sm"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || 'Chưa có giới thiệu. Nhấn chỉnh sửa để thêm thông tin về bản thân.'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-400" />
                Kỹ năng
              </h2>

              <div className="flex flex-wrap gap-2">
                {/* Display skills from profile when not editing; when editing use free-text input */}
                {((editing ? (skillText.split(',').map(s => s.trim()).filter(Boolean)) : (profile?.skills || [])) || []).length > 0 ? (
                  (editing ? skillText.split(',').map(s => s.trim()).filter(Boolean) : (profile?.skills || [])).map((skillName, idx) => (
                    <span
                      key={`${skillName}-${idx}`}
                      className="px-3 py-1 bg-white hover:bg-gray-50 text-[#007fed] hover:text-[#006bb3] border border-gray-300 rounded-full text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {skillName}
                      {editing && (
                        <button
                          onClick={() => {
                            const parts = skillText.split(',').map(s => s.trim()).filter(Boolean);
                            const remaining = parts.filter(s => s !== skillName);
                            setSkillText(remaining.join(', '));
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">{editing ? 'Thêm kỹ năng (phân cách bằng dấu phẩy)' : 'Chưa có kỹ năng nào'}</p>
                )}

                {editing && (
                  <div className="w-full mt-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Thêm kỹ năng</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: React, Node.js, UI/UX"
                      value={skillText}
                      onChange={e => setSkillText(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:border-[#007fed] focus:ring-1 focus:ring-[#007fed] outline-none shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Rate & Availability */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Trạng thái
              </h3>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Tình trạng</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:border-[#007fed] outline-none"
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option value="AVAILABLE">Sẵn sàng làm việc</option>
                      <option value="BUSY">Bận</option>
                      <option value="UNAVAILABLE">Không tìm việc</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600 text-sm font-medium">Trạng thái</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${profile?.availability === 'AVAILABLE'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-yellow-50 text-yellow-600'
                      }`}>
                      {profile?.availability === 'AVAILABLE' ? 'Sẵn sàng' : 'Bận'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Dự án hoàn thành', value: profile?.jobsCompleted || 0, icon: Briefcase, color: 'text-[#007fed]' },
                { label: 'Thu nhập', value: `$${profile?.totalEarnings?.toFixed(0) || 0}`, icon: BarChart3, color: 'text-green-600' },
                { label: 'Đánh giá', value: profile?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-amber-500' },
                { label: 'Nhận xét', value: profile?.jobsCompleted || 0, icon: MessageSquare, color: 'text-purple-500' },
              ].map((stat, idx) => {
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
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Link className="w-4 h-4 text-gray-500" />
                Liên kết mạng xã hội
              </h3>
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="URL Portfolio"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:border-[#007fed] outline-none"
                    value={formData.portfolioUrl}
                    onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="URL LinkedIn"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:border-[#007fed] outline-none"
                    value={formData.linkedinUrl}
                    onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="URL GitHub"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm focus:border-[#007fed] outline-none"
                    value={formData.githubUrl}
                    onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {profile?.portfolioUrl ? (
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group">
                      <Briefcase className="w-4 h-4 flex-shrink-0" /> Portfolio
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </a>
                  ) : null}
                  {profile?.linkedinUrl ? (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group">
                      <Linkedin className="w-4 h-4 flex-shrink-0" /> LinkedIn
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </a>
                  ) : null}
                  {profile?.githubUrl ? (
                    <a href={profile.githubUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-[#007fed] hover:underline text-sm truncate group">
                      <Github className="w-4 h-4 flex-shrink-0" /> GitHub
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </a>
                  ) : null}
                  {!profile?.portfolioUrl && !profile?.linkedinUrl && !profile?.githubUrl ? (
                    <p className="text-sm text-gray-500 italic">Chưa có liên kết nào</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
