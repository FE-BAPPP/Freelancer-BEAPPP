"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import {
  LogIn, User, Lock, Eye, EyeOff, AlertCircle, Loader2,
  Github, Mail, Waves, ArrowRight
} from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { login, isLoggedIn, role } = useAuth()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  // Redirect based on role
  useEffect(() => {
    if (isLoggedIn && role) {
      if (redirect) {
        navigate(redirect, { replace: true })
        return
      }

      switch (role) {
        case 'ADMIN':
          navigate("/admin/dashboard", { replace: true })
          break
        case 'FREELANCER':
          navigate("/freelancer/dashboard", { replace: true })
          break
        case 'EMPLOYER':
          navigate("/employer/dashboard", { replace: true })
          break
        case 'USER':
          navigate("/user/dashboard", { replace: true })
          break
        default:
          navigate("/login", { replace: true })
      }
    }
  }, [isLoggedIn, role, navigate, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(formData.username, formData.password)
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setSocialLoading(provider)
    try {
      // Placeholder for social login integration
      // TODO: Integrate with OAuth providers (GitHub, Google)
      console.log(`${provider} login clicked`)
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#5B8DEF] rounded-xl flex items-center justify-center shadow-lg">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Ocean Hire</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-600">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                Tiếp tục với Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'github' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Github className="w-5 h-5" />
                )}
                Tiếp tục với GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với email</span>
              </div>
            </div>

            {/* Email/Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#5B8DEF] focus:ring-4 focus:ring-[#5B8DEF]/10 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#5B8DEF] hover:text-[#4A90E2] font-medium"
                >
                  Quên?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#5B8DEF] focus:ring-4 focus:ring-[#5B8DEF]/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#5B8DEF] border-gray-300 rounded focus:ring-[#5B8DEF] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                Giữ đăng nhập
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-[#5B8DEF] hover:text-[#4A90E2] font-semibold flex items-center justify-center gap-1 mt-2"
              >
                Tạo tài khoản
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Ocean Hire. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </div>
  )
}
