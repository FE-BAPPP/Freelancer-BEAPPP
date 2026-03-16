"use client"

import { useEffect, useState } from 'react';
import { Building2, Globe, Users, Briefcase, DollarSign, Edit, Plus, MapPin, CheckCircle2 } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { EmployerProfile } from '../../types/api';
import { AvatarUpload, Avatar } from '../../components/Common';

export function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getMyEmployerProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          companyName: response.data.companyName || '',
          companyWebsite: response.data.companyWebsite || '',
          companySize: response.data.companySize || '',
          industry: response.data.industry || '',
        });
        setIsNewProfile(false);
      } else {
        setIsNewProfile(true);
        setEditing(true);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      if (error?.message?.includes('not found') || error?.message?.includes('chưa có')) {
        setIsNewProfile(true);
        setEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      alert('Tên công ty là bắt buộc');
      return;
    }

    try {
      setSaving(true);

      let response;
      if (isNewProfile) {
        response = await profileApi.createEmployerProfile(formData);
      } else {
        response = await profileApi.updateEmployerProfile(formData);
      }

      if (response.success) {
        await loadProfile();
        setEditing(false);
        setIsNewProfile(false);
        // Alert handled by UI feedback ideally
      } else {
        throw new Error(response.message || 'Lưu hồ sơ thất bại');
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      alert(error.message || 'Lưu hồ sơ thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f7f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#007fed]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      {/* Header Banner */}
      <div className="h-64 bg-[#1f2125] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1f2125]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  {editing ? (
                    <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-100">
                      <AvatarUpload
                        currentAvatar={profile?.avatar}
                        name={profile?.companyName || formData.companyName}
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
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white p-1.5 border border-gray-100 shadow-md">
                      {profile?.avatar ? (
                        <Avatar
                          src={profile.avatar}
                          name={profile.companyName}
                          size="xl"
                          className="w-full h-full rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200">
                          <Building2 className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile?.companyName || formData.companyName || 'Công ty Mới'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {profile?.industry || 'Chưa cập nhật lĩnh vực'}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      {profile?.companySize ? `${profile.companySize} nhân viên` : 'Chưa cập nhật quy mô'}
                    </span>
                  </div>

                  {profile?.companyWebsite && !editing && (
                    <div className="mt-4">
                      <a href={profile.companyWebsite} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[#007fed] hover:text-[#006bb3] text-sm font-bold hover:underline">
                        <Globe className="w-4 h-4" />
                        {profile.companyWebsite.replace('https://', '').replace('www.', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2">
                {!isNewProfile && (
                  <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    disabled={saving}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all shadow-sm flex items-center gap-2 ${editing
                      ? 'bg-[#007fed] hover:bg-[#006bb3] text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    {editing ? (
                      <>{saving ? 'Đang lưu...' : <><CheckCircle2 className="w-4 h-4" /> Lưu thay đổi</>}</>
                    ) : (
                      <><Edit className="w-4 h-4" /> Chỉnh sửa</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form/Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                Thông tin Doanh nghiệp
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tên công ty</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 text-sm font-medium transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      disabled={!editing}
                      placeholder="Ví dụ: Công ty TNHH ABC..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Website</label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 text-sm font-medium transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                      disabled={!editing}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quy mô công ty</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 text-sm font-medium transition-all disabled:bg-gray-50 disabled:text-gray-500 appearance-none"
                        value={formData.companySize}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        disabled={!editing}
                      >
                        <option value="">Chọn quy mô...</option>
                        <option value="SOLO">Cá nhân (1 người)</option>
                        <option value="SMALL">Nhỏ (1-10 nhân viên)</option>
                        <option value="MEDIUM">Vừa (11-50 nhân viên)</option>
                        <option value="LARGE">Lớn (50+ nhân viên)</option>
                      </select>
                      {/* Custom arrow could be added here if needed */}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Lĩnh vực hoạt động</label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 text-sm font-medium transition-all disabled:bg-gray-50 disabled:text-gray-500 appearance-none"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      disabled={!editing}
                    >
                      <option value="">Chọn lĩnh vực...</option>
                      <option value="Technology">Công nghệ thông tin</option>
                      <option value="Finance">Tài chính - Ngân hàng</option>
                      <option value="Healthcare">Y tế - Sức khỏe</option>
                      <option value="E-commerce">Thương mại điện tử</option>
                      <option value="Marketing">Marketing & Truyền thông</option>
                      <option value="Construction">Xây dựng</option>
                      <option value="Education">Giáo dục</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {isNewProfile && editing && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg font-bold uppercase tracking-wide transition-all shadow-md active:scale-95"
                  >
                    {saving ? 'Đang khởi tạo...' : 'Tạo hồ sơ công ty'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          {!isNewProfile && profile && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Thống kê hoạt động
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm font-medium">Tin đã đăng</span>
                    <span className="font-bold text-gray-900">{profile.jobsPosted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm font-medium">Dự án đang chạy</span>
                    <span className="font-bold text-gray-900">{profile.activeProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 text-sm font-medium">Tổng chi tiêu</span>
                    <span className="font-bold text-emerald-600">{profile.totalSpent?.toLocaleString() || '0'} PTS</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="text-blue-800 font-bold mb-2 text-sm uppercase tracking-wide">Xác thực tài khoản</h3>
                <p className="text-blue-700 text-sm mb-4 leading-relaxed opacity-80">Xác thực doanh nghiệp để tăng uy tín và thu hút freelancer chất lượng cao.</p>
                <button className="w-full py-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-colors">
                  Xác thực ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
