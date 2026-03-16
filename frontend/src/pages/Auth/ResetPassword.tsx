import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userApi } from "../../services/api";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function ResetPassword() {
  const q = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = q.get("token") || "";
    setToken(t);
  }, [q]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Thiếu hoặc token không hợp lệ.");
      return;
    }
    if (!newPwd || newPwd.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("Mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.resetPassword(token, newPwd);
      if (!res.success) throw new Error(res.message || "Reset failed");
      setMessage("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(err.message || "Không thể đặt lại mật khẩu. Link có thể đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#007fed] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#007fed] focus:ring-2 focus:ring-[#007fed]/20"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#007fed] focus:ring-2 focus:ring-[#007fed]/20"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
