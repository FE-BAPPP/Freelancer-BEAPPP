"use client"

import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { userApi, projectApi } from "../../services/api"
import {
    DollarSign, FileText, Tag,
    AlertCircle, CheckCircle2, X, Upload,
    ChevronDown, Zap, Clock,
    ShieldCheck
} from "lucide-react"
import { JOB_CATEGORIES } from "../../components/Jobs/types"

// JOB_CATEGORIES moved to components/Jobs/types.ts

export function PostJobPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [skillText, setSkillText] = useState<string>("")
    const [files, setFiles] = useState<File[]>([])

    // Collapsible sections state
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budgetMin: "",
        budgetMax: "",
        paymentType: "FIXED_PRICE" as "FIXED_PRICE" | "HOURLY",
        duration: "",
        category: JOB_CATEGORIES[0].vi,
    })

    const parsedSkills = skillText.split(",").map(s => s.trim()).filter(Boolean)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.description) return
        setError("")
        setLoading(true)

        try {
            const skillsToSend = parsedSkills
            const response = await userApi.request<any>("/api/jobs", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
                    budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
                    type: formData.paymentType,
                    skills: skillsToSend,
                }),
            })

            if (response.success) {
                const jobId = response.data?.id;
                if (jobId && files.length > 0) {
                    setUploadingFiles(true);
                    try {
                        await Promise.all(files.map(file => projectApi.uploadFile(file, 'JOB', jobId)));
                    } catch (uploadErr) {
                        console.error("Error uploading files:", uploadErr);
                    }
                }
                setSuccess(true)
                setTimeout(() => navigate("/employer/my-jobs"), 2500)
            } else {
                setError(response.message || "Không thể đăng dự án")
            }
        } catch (err: any) {
            setError(err.message || "Không thể đăng dự án")
        } finally {
            setLoading(false)
            setUploadingFiles(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-sm w-full shadow-lg">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng tin thành công!</h2>
                    <p className="text-gray-500 text-sm mb-6">Dự án của bạn đã sẵn sàng nhận đề xuất.</p>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f7f7f7] pb-20">
            {/* Header Section */}
            <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800 mb-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Đăng dự án mới</h1>
                        <p className="text-gray-400 text-sm mt-1">Kết nối với các chuyên gia hàng đầu</p>
                    </div>
                    <button
                        onClick={() => navigate('/employer/my-jobs')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-gray-600"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
                        {/* Top Row: Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Tên Dự án</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-base font-medium text-gray-900 placeholder-gray-400 transition-all"
                                    placeholder="Ví dụ: Thiết kế Website NFT..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Danh mục</label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 font-medium appearance-none cursor-pointer"
                                    >
                                        {JOB_CATEGORIES.map((cat) => (
                                            <option key={cat.id} value={cat.vi}>{cat.vi}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Description (Collapsible) */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Mô tả công việc</label>
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="text-xs font-bold text-[#007fed] hover:text-[#006bb3] uppercase tracking-wide transition-colors"
                                >
                                    {isDescriptionExpanded ? "Thu gọn" : "Mở rộng"}
                                </button>
                            </div>

                            {isDescriptionExpanded && (
                                <div className="space-y-4">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] min-h-[200px] text-gray-900 text-sm font-medium leading-relaxed placeholder-gray-400 transition-all resize-y"
                                        placeholder="Mô tả chi tiết yêu cầu của bạn..."
                                        required
                                    />
                                    <FileUploadArea files={files} onFilesChange={setFiles} />
                                </div>
                            )}
                            {!isDescriptionExpanded && (
                                <div
                                    onClick={() => setIsDescriptionExpanded(true)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm italic cursor-pointer hover:bg-gray-100 transition-all"
                                >
                                    {formData.description ? formData.description.substring(0, 100) + "..." : "Nhấn để nhập mô tả..."}
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="space-y-2 mb-6">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Kỹ năng yêu cầu</label>
                            <div className="relative group">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#007fed] transition-colors" />
                                <input
                                    type="text"
                                    value={skillText}
                                    onChange={(e) => setSkillText(e.target.value)}
                                    placeholder="Nhập kỹ năng và phẩy (Ví dụ: React, Solidity...)"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-gray-900 text-sm font-medium transition-all"
                                />
                            </div>
                            {parsedSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {parsedSkills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-blue-50 border border-blue-100 text-[#007fed] rounded-full text-xs font-bold flex items-center gap-2"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => setSkillText(parsedSkills.filter((_, i) => i !== idx).join(", "))}>
                                                <X className="w-3 h-3 hover:text-red-500 transition-colors" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Budget & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Ngân sách Min</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                    <input
                                        type="number"
                                        value={formData.budgetMin}
                                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-sm font-bold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Ngân sách Max</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                    <input
                                        type="number"
                                        value={formData.budgetMax}
                                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-sm font-bold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Thời gian thực hiện</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900 text-sm font-bold appearance-none"
                                    >
                                        <option value="">Chọn thời gian</option>
                                        <option value="LESS_THAN_1_WEEK">Dưới 1 tuần</option>
                                        <option value="1_TO_2_WEEKS">1-2 tuần</option>
                                        <option value="2_TO_4_WEEKS">2-4 tuần</option>
                                        <option value="1_TO_3_MONTHS">1-3 tháng</option>
                                        <option value="3_TO_6_MONTHS">3-6 tháng</option>
                                        <option value="MORE_THAN_6_MONTHS">Trên 6 tháng</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="hidden md:flex items-center gap-2 text-gray-500">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs uppercase font-bold tracking-wide">Secured by TRON</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || uploadingFiles || !formData.title || !formData.description}
                            className="w-full md:w-auto px-8 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-lg font-bold uppercase tracking-wide text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(loading || uploadingFiles) ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            <span>Đăng dự án</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const FileUploadArea = ({ files, onFilesChange }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    onFilesChange([...files, ...droppedFiles]);
                }}
                onClick={() => inputRef.current?.click()}
                className={`relative border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all overflow-hidden group ${isDragging ? "border-[#007fed] bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}
            >
                <input ref={inputRef} type="file" multiple onChange={(e) => e.target.files && onFilesChange([...files, ...Array.from(e.target.files)])} className="hidden" />
                <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-6 h-6 ${isDragging ? "text-[#007fed]" : "text-gray-400 group-hover:text-[#007fed] transition-colors"}`} />
                    <p className="text-xs font-medium text-gray-500">Kéo thả hoặc <span className="text-[#007fed] font-bold">chọn tệp</span> đính kèm</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                    {files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group/file hover:shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#007fed]">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onFilesChange(files.filter((_: any, i: any) => i !== index)); }}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
