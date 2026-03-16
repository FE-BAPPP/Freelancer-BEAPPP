"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { userApi } from "../../services/api"
import { QRCodeCanvas } from "qrcode.react"
import {
  User,
  Edit3,
  Copy,
  Check,
  Mail,
  Calendar,
  Shield,
  Key,
  Smartphone,
  LogOut,
  Trash2,
  UserCircle,
  AlertTriangle,
  X
} from "lucide-react"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  })

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false)
  const [setupModal, setSetupModal] = useState(false)
  const [otpauthUrl, setOtpauthUrl] = useState<string>("")
  const [setupCode, setSetupCode] = useState("")
  const [disableModal, setDisableModal] = useState(false)
  const [disablePwd, setDisablePwd] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [secMsg, setSecMsg] = useState<string | null>(null)

  useEffect(() => {
    // fetch profile to get 2FA flag
    ; (async () => {
      try {
        const res = await userApi.getProfile()
        if (res.success) {
          const p: any = res.data || {}
          setTwoFAEnabled(!!p.twoFactorEnabled)
        }
      } catch { }
    })()
  }, [])

  const handleSave = async () => {
    try {
      const res = await userApi.updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
      })
      if (!res.success) throw new Error(res.message || "Cập nhật thất bại")
      setIsEditing(false)
      alert("Cập nhật thông tin thành công!")
      window.location.reload() // Reload to sync with Auth context
    } catch (e: any) {
      alert(e.message || "Không thể cập nhật thông tin")
    }
  }

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout()
    }
  }

  const startSetup2FA = async () => {
    setSecMsg(null)
    const r = await userApi.startTwoFactorSetup()
    if (!r.success) {
      setSecMsg(r.message || "Không thể bắt đầu thiết lập 2FA")
      return
    }
    const data: any = r.data || {}
    setOtpauthUrl(data.otpauthUrl || "")
    setSetupCode("")
    setSetupModal(true)
  }

  const confirmEnable2FA = async () => {
    if (!setupCode || setupCode.trim().length !== 6) {
      setSecMsg("Vui lòng nhập mã 6 số từ ứng dụng Authenticator")
      return
    }
    const r = await userApi.enableTwoFactor(setupCode.trim())
    if (!r.success) {
      setSecMsg(r.message || "Kích hoạt 2FA thất bại")
      return
    }
    setTwoFAEnabled(true)
    setSetupModal(false)
    alert("Đã kích hoạt xác thực 2 lớp thành công")
  }

  const confirmDisable2FA = async () => {
    if (!disablePwd) {
      setSecMsg("Cần mật khẩu để tắt 2FA")
      return
    }
    const r = await userApi.disableTwoFactor(disablePwd, disableCode?.trim() || undefined)
    if (!r.success) {
      setSecMsg(r.message || "Tắt 2FA thất bại")
      return
    }
    setTwoFAEnabled(false)
    setDisableModal(false)
    setDisablePwd("")
    setDisableCode("")
    alert("Đã tắt xác thực 2 lớp")
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 mt-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1f2125] p-8 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-[#007fed] rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              Cài đặt tài khoản
            </h1>
            <p className="text-gray-400">Quản lý thông tin đăng nhập, bảo mật (2FA) và thông tin cá nhân</p>
          </div>

          {user?.role === 'FREELANCER' && (
            <a href="/freelancer/profile" className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-[#007fed] transition-all flex items-center gap-2 font-bold shadow-sm">
              <UserCircle className="w-4 h-4" />
              Chỉnh sửa hồ sơ Freelancer
            </a>
          )}
          {user?.role === 'EMPLOYER' && (
            <a href="/employer/profile" className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-[#007fed] transition-all flex items-center gap-2 font-bold shadow-sm">
              <UserCircle className="w-4 h-4" />
              Chỉnh sửa hồ sơ Công ty
            </a>
          )}
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#007fed]" />
              Thông tin tài khoản
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${isEditing
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-[#f7f7f7] text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
            </button>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={user?.username || ""}
                      disabled
                      className="w-full pl-10 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 pl-1 italic">Tên đăng nhập không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã người dùng (Public)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={user?.id || ""}
                      disabled
                      className="flex-1 px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user?.id) return
                        try {
                          await navigator.clipboard.writeText(user.id)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        } catch { }
                      }}
                      className="p-3 bg-[#f7f7f7] border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                      title="Sao chép ID"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 pl-1 italic">Mã định danh duy nhất cho giao dịch P2P</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <UserCircle className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full pl-10 px-4 py-3 border rounded-lg transition-colors ${isEditing
                        ? 'bg-white border-[#007fed] text-gray-900 focus:ring-2 focus:ring-[#007fed]/20'
                        : 'bg-[#f7f7f7] border-gray-200 text-gray-500'
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full pl-10 px-4 py-3 border rounded-lg transition-colors ${isEditing
                        ? 'bg-white border-[#007fed] text-gray-900 focus:ring-2 focus:ring-[#007fed]/20'
                        : 'bg-[#f7f7f7] border-gray-200 text-gray-500'
                        }`}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò</label>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${user?.role === "ADMIN"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-blue-50 text-[#007fed] border border-blue-200"
                        }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày tham gia</label>
                    <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "Không rõ"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-[#f7f7f7] border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-[#007fed] text-white rounded-lg hover:bg-[#006bb3] transition-all font-bold flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Bảo mật & Xác thực
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#007fed]/30 transition-all bg-[#f7f7f7] group cursor-pointer">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Key className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thay đổi mật khẩu</h3>
                  <p className="text-sm text-gray-500 font-medium">Cập nhật mật khẩu tài khoản thường xuyên</p>
                </div>
              </div>
              <button className="text-[#007fed] font-bold text-sm hover:underline">Cập nhật</button>
            </div>

            {/* 2FA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-200 bg-[#f7f7f7]">
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className={`p-3 rounded-lg border ${twoFAEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                  <Smartphone className={`w-6 h-6 ${twoFAEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Xác thực 2 lớp (2FA)</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${twoFAEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <p className="text-sm text-gray-600 font-medium">{twoFAEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</p>
                  </div>
                </div>
              </div>

              {twoFAEnabled ? (
                <button
                  onClick={() => { setDisableModal(true); setSecMsg(null); }}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                >
                  Tắt xác thực
                </button>
              ) : (
                <button
                  onClick={startSetup2FA}
                  className="px-4 py-2 bg-[#007fed] text-white hover:bg-[#006bb3] rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  Kích hoạt 2FA
                </button>
              )}
            </div>
            {secMsg && !disableModal && !setupModal && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 font-medium">{secMsg}</div>}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50">
            <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Vùng nguy hiểm
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 font-medium text-sm mb-6 max-w-2xl">
              Các hành động này không thể hoàn tác. Nếu bạn xóa tài khoản, bạn sẽ mất vĩnh viễn tất cả dữ liệu dự án, tin nhắn và số dư ví.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#f7f7f7] border border-gray-200 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all font-bold text-sm">
                <Trash2 className="w-4 h-4" />
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {
          setupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Thiết lập 2FA</h3>
                    <button onClick={() => setSetupModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-gray-600 text-sm mb-4 font-medium">Quét mã QR này bằng ứng dụng Google Authenticator</p>
                    <div className="mx-auto w-fit p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                      {otpauthUrl ? <QRCodeCanvas value={otpauthUrl} size={160} /> : <div className="w-40 h-40 bg-gray-50 flex items-center justify-center text-gray-400">Đang tải...</div>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-left">Nhập mã 6 chữ số</label>
                    <input
                      type="text"
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      className="w-full px-4 py-4 bg-[#f7f7f7] border border-gray-200 rounded-lg text-center text-2xl tracking-[0.5em] font-mono text-gray-900 focus:ring-2 focus:ring-[#007fed] transition-all"
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                    />

                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setSetupModal(false)} className="flex-1 px-5 py-3 bg-[#f7f7f7] border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-bold">Hủy bỏ</button>
                      <button onClick={confirmEnable2FA} className="flex-1 px-5 py-3 bg-[#007fed] text-white rounded-lg hover:bg-[#006bb3] transition-all font-bold shadow-sm">Kích hoạt 2FA</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* 2FA Disable Modal */}
        {
          disableModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Tắt xác thực 2 lớp</h3>
                    <button onClick={() => setDisableModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  <p className="text-gray-600 text-sm mb-6 font-medium">Nhập mật khẩu để xác minh danh tính trước khi tắt 2FA.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 text-left">Mật khẩu</label>
                      <input
                        type="password"
                        value={disablePwd}
                        onChange={(e) => setDisablePwd(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#007fed]"
                        placeholder="Mật khẩu của bạn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 text-left">Mã 2FA (Tùy chọn)</label>
                      <input
                        type="text"
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#007fed]"
                        placeholder="Nhập mã nếu bạn còn quyền truy cập"
                        maxLength={6}
                      />
                    </div>

                    {secMsg && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 font-medium">{secMsg}</div>}

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setDisableModal(false)} className="flex-1 px-5 py-3 bg-[#f7f7f7] border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-bold">Hủy bỏ</button>
                      <button onClick={confirmDisable2FA} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold">Tắt ngay</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
