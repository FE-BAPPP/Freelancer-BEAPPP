import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { userApi, projectApi } from "../../services/api";
import {
    DollarSign, FileText, Tag,
    AlertCircle, CheckCircle2, X, Upload,
    ChevronDown, Zap, Clock,
    ShieldCheck
} from "lucide-react";
import { JOB_CATEGORIES } from "../Jobs/types";

interface PostJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [skillText, setSkillText] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budgetMin: "",
        budgetMax: "",
        paymentType: "FIXED_PRICE" as "FIXED_PRICE" | "HOURLY",
        duration: "",
        category: JOB_CATEGORIES[0].vi,
    });

    const parsedSkills = skillText.split(",").map(s => s.trim()).filter(Boolean);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset state when opening
            setSuccess(false);
            setError("");
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;
        setError("");
        setLoading(true);

        try {
            const response = await userApi.request<any>("/api/jobs", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
                    budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
                    type: formData.paymentType,
                    skills: parsedSkills,
                }),
            });

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
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    navigate("/employer/my-jobs", { state: { refresh: Date.now() } });
                }, 2000);
            } else {
                setError(response.message || "Không thể đăng dự án");
            }
        } catch (err: any) {
            setError(err.message || "Không thể đăng dự án");
        } finally {
            setLoading(false);
            setUploadingFiles(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-[#f7f7f7] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl no-scrollbar"
                >
                    {success ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng tin thành công!</h2>
                            <p className="text-gray-500 mb-6">Dự án của bạn đã sẵn sàng nhận đề xuất.</p>
                            <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mx-auto">
                                <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="sticky top-0 z-10 bg-[#1f2125] text-white p-6 flex items-center justify-between border-b border-gray-800">
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight">Đăng dự án mới</h1>
                                    <p className="text-gray-400 text-xs mt-1">Kết nối với các chuyên gia hàng đầu</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Tên Dự án</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-sm font-bold text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                                                placeholder="Ví dụ: Thiết kế Website NFT..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Danh mục</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-sm font-bold text-gray-900 appearance-none cursor-pointer shadow-sm"
                                                >
                                                    {JOB_CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.vi}>{cat.vi}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Mô tả công việc</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="text-[10px] font-black text-[#007fed] hover:text-[#006bb3] uppercase tracking-widest transition-colors"
                                            >
                                                {isDescriptionExpanded ? "Thu gọn" : "Mở rộng"}
                                            </button>
                                        </div>

                                        {isDescriptionExpanded ? (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] min-h-[150px] text-sm font-medium leading-relaxed placeholder-gray-400 transition-all resize-y shadow-sm"
                                                    placeholder="Mô tả chi tiết yêu cầu của bạn..."
                                                    required
                                                />
                                                <FileUploadArea files={files} onFilesChange={setFiles} />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setIsDescriptionExpanded(true)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 italic cursor-pointer hover:bg-gray-100 transition-all"
                                            >
                                                {formData.description ? formData.description.substring(0, 100) + "..." : "Nhấn để nhập mô tả..."}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Kỹ năng yêu cầu</label>
                                        <div className="relative group">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#007fed] transition-colors" />
                                            <input
                                                type="text"
                                                value={skillText}
                                                onChange={(e) => setSkillText(e.target.value)}
                                                placeholder="Nhập kỹ năng và phẩy (Ví dụ: React, Solidity...)"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] text-sm font-bold text-gray-900 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Ngân sách Min</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                <input
                                                    type="number"
                                                    value={formData.budgetMin}
                                                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-bold text-gray-900 shadow-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Ngân sách Max</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                <input
                                                    type="number"
                                                    value={formData.budgetMax}
                                                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-bold text-gray-900 shadow-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Thời gian</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                                                <select
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm font-bold text-gray-900 appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">Chọn thời gian</option>
                                                    <option value="LESS_THAN_1_WEEK">Dưới 1 tuần</option>
                                                    <option value="1_TO_2_WEEKS">1-2 tuần</option>
                                                    <option value="2_TO_4_WEEKS">2-4 tuần</option>
                                                    <option value="1_TO_3_MONTHS">1-3 tháng</option>
                                                    <option value="3_TO_6_MONTHS">3-6 tháng</option>
                                                    <option value="MORE_THAN_6_MONTHS">Trên 6 tháng</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Secured by TRON</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || uploadingFiles || !formData.title || !formData.description}
                                        className="w-full md:w-auto px-8 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-[#007fed]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {(loading || uploadingFiles) ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Zap className="w-4 h-4" />
                                        )}
                                        <span>Đăng tin tuyển dụng</span>
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
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
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? "border-[#007fed] bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-[#007fed]/30 hover:bg-gray-100"}`}
            >
                <input ref={inputRef} type="file" multiple onChange={(e) => e.target.files && onFilesChange([...files, ...Array.from(e.target.files)])} className="hidden" />
                <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-6 h-6 ${isDragging ? "text-[#007fed]" : "text-gray-400"}`} />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kéo thả hoặc <span className="text-[#007fed]">chọn tệp</span></p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                    {files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
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
