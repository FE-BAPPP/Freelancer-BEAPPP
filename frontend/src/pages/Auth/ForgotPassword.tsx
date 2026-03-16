import { useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../../services/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await userApi.forgotPassword(email.trim());
      if (!res.success) throw new Error(res.message || "Request failed");
      setMessage("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.");
    } catch (err: any) {
      setMessage("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#007fed] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu</h1>
          <p className="text-sm text-gray-600">
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#007fed] focus:ring-2 focus:ring-[#007fed]/20"
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#007fed] text-white font-bold rounded-lg hover:bg-[#006bb3] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại"}
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
