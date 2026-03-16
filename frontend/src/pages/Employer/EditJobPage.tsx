"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { jobApi, JobCreateRequest } from "../../services/jobApi"
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  Save,
  X
} from "lucide-react"

export function EditJobPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [skillText, setSkillText] = useState<string>("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    type: "FIXED_PRICE",
    duration: "",
    category: "",
  })

  useEffect(() => {
    if (jobId) {
      loadJobDetails()
    }
  }, [jobId])

  const loadJobDetails = async () => {
    try {
      setPageLoading(true)
      const response = await jobApi.getJobById(jobId!)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job: any = response.data || response

      if (job) {
        setFormData({
          title: job.title || "",
          description: job.description || "",
          budgetMin: job.budgetMin?.toString() || "",
          budgetMax: job.budgetMax?.toString() || "",
          type: job.projectType || job.type || "FIXED_PRICE",
          duration: job.duration || "",
          category: job.category || "",
        })

        if (job.skills && Array.isArray(job.skills)) {
          setSkillText(job.skills.join(", "))
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin công việc")
    } finally {
      setPageLoading(false)
    }
  }

  // Parse comma-separated skill input
  const parsedSkills = skillText
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const skillsToSend = skillText.trim()
        ? skillText.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const updateData: Partial<JobCreateRequest> = {
        title: formData.title,
        description: formData.description,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        type: "FIXED_PRICE",
        duration: formData.duration,
        category: formData.category,
        skillIds: skillsToSend,
      }

      const response = await jobApi.updateJob(jobId!, updateData)

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/employer/jobs/${jobId}`)
        }, 2000)
      } else {
        setError(response.message || "Cập nhật công việc thất bại")
      }
    } catch (err: any) {
      setError(err.message || "Cập nhật công việc thất bại")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã cập nhật công việc!</h2>
          <p className="text-gray-500">Đang chuyển hướng về trang chi tiết...</p>
        </motion.div>
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#007fed] rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/employer/jobs/${jobId}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại chi tiết
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-[#007fed]" />
              </div>
              Chỉnh sửa dự án
            </h1>
            <p className="text-gray-500 text-sm mt-2 ml-12">Cập nhật thông tin chi tiết cho dự án của bạn.</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                  Tiêu đề dự án <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] font-semibold transition-all"
                  placeholder="Ví dụ: Tìm lập trình viên React cho dự án E-commerce"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] transition-all"
                  placeholder="Mô tả các yêu cầu dự án, trách nhiệm và quyền lợi..."
                  required
                />
              </div>

              {/* Budget & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                    Ngân sách tối thiểu (PTS)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetMin: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] font-semibold transition-all"
                      placeholder="100"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                    Ngân sách tối đa (PTS)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetMax: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] font-semibold transition-all"
                      placeholder="1000"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                    Loại hình
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold text-sm flex items-center justify-center">
                    Cố định (Fixed Price)
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                  Thời gian thực hiện
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] font-medium appearance-none transition-all"
                  >
                    <option value="">Chọn thời gian</option>
                    <option value="LESS_THAN_1_WEEK">Dưới 1 tuần</option>
                    <option value="1_TO_2_WEEKS">1-2 tuần</option>
                    <option value="2_TO_4_WEEKS">2-4 tuần</option>
                    <option value="1_TO_3_MONTHS">1-3 tháng</option>
                    <option value="3_TO_6_MONTHS">3-6 tháng</option>
                    <option value="MORE_THAN_6_MONTHS">Trên 6 tháng</option>
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                  Kỹ năng yêu cầu
                </label>
                <div className="relative mb-3">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={skillText}
                    onChange={(e) => setSkillText(e.target.value)}
                    placeholder="Ví dụ: React, Node.js, TypeScript..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] font-medium transition-all"
                  />
                </div>

                {parsedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parsedSkills.map((skill, idx) => (
                      <span
                        key={`${skill}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#007fed] border border-blue-100 rounded-full text-sm font-bold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = parsedSkills.filter((_, i) => i !== idx);
                            setSkillText(updated.join(", "));
                          }}
                          className="hover:text-blue-800 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2 ml-1">Phân cách các kỹ năng bằng dấu phẩy.</p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
