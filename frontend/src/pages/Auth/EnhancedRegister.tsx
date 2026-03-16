import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { userApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Briefcase,
    Code,
    Waves,
    Shield,
    AlertCircle
} from 'lucide-react';

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${index + 1 === currentStep
                        ? 'bg-[#5B8DEF] text-white scale-110 shadow-lg shadow-blue-500/30'
                        : index + 1 < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                        {index + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < totalSteps - 1 && (
                        <div className={`w-12 h-1 mx-1 rounded-full transition-all ${index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function Register() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1: Role selection
        role: '' as 'FREELANCER' | 'EMPLOYER' | '',

        // Step 2: Basic info
        fullName: '',
        email: '',
        username: '',

        // Step 3: Password
        password: '',
        confirmPassword: '',

        // Step 4: Agreement
        agreeToTerms: false,
        agreeToPrivacy: false,
        subscribeNewsletter: false
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Validation functions
    const validateStep1 = () => {
        if (!formData.role) {
            setError('Vui lòng chọn vai trò của bạn');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        const errors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Vui lòng nhập họ và tên';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Định dạng email không hợp lệ';
        }

        if (!formData.username.trim()) {
            errors.username = 'Vui lòng nhập tên đăng nhập';
        } else if (formData.username.length < 3) {
            errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Tên đăng nhập chỉ có thể chứa chữ cái, số và dấu gạch dưới';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        const errors: Record<string, string> = {};

        if (!formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 8) {
            errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và số';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep4 = () => {
        if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
            setError('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
            return false;
        }
        setError('');
        return true;
    };

    const handleNextStep = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            case 3:
                isValid = validateStep3();
                break;
            default:
                isValid = true;
        }

        if (isValid) {
            setCurrentStep(prev => prev + 1);
            setError('');
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
        setValidationErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep4()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await userApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullName: formData.fullName,
                role: formData.role,
            });

            if (!response.success) {
                throw new Error(response.message || 'Đăng ký thất bại');
            }

            // Show success message
            alert(`Đăng ký thành công với vai trò ${formData.role === 'FREELANCER' ? 'Freelancer' : 'Nhà tuyển dụng'}! Vui lòng đăng nhập.`);
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn Vai Trò Của Bạn</h2>
                            <p className="text-gray-600">Bạn dự định sử dụng Ocean Hire như thế nào?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'FREELANCER' })}
                                className={`group relative p-8 rounded-2xl border-2 transition-all ${formData.role === 'FREELANCER'
                                    ? 'border-[#5B8DEF] bg-blue-50 shadow-lg shadow-blue-500/20'
                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${formData.role === 'FREELANCER'
                                        ? 'bg-[#5B8DEF] shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 group-hover:bg-blue-100'
                                        }`}>
                                        <Code className={`w-8 h-8 ${formData.role === 'FREELANCER' ? 'text-white' : 'text-gray-600 group-hover:text-[#5B8DEF]'
                                            }`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tôi là Freelancer</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Tìm việc IT chất lượng cao và phát triển sự nghiệp của bạn
                                    </p>
                                    {formData.role === 'FREELANCER' && (
                                        <CheckCircle className="w-6 h-6 text-[#5B8DEF]" />
                                    )}
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
                                className={`group relative p-8 rounded-2xl border-2 transition-all ${formData.role === 'EMPLOYER'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20'
                                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${formData.role === 'EMPLOYER'
                                        ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 group-hover:bg-indigo-100'
                                        }`}>
                                        <Briefcase className={`w-8 h-8 ${formData.role === 'EMPLOYER' ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'
                                            }`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tôi là Nhà tuyển dụng</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Tìm kiếm và thuê nhân tài hàng đầu cho dự án của bạn
                                    </p>
                                    {formData.role === 'EMPLOYER' && (
                                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông Tin Cơ Bản</h2>
                            <p className="text-gray-600">Hãy cho chúng tôi biết một chút về bạn</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Họ và tên *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${validationErrors.fullName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]/20'
                                        }`}
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            {validationErrors.fullName && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.fullName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Địa chỉ Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${validationErrors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]/20'
                                        }`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên đăng nhập *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${validationErrors.username
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]/20'
                                        }`}
                                    placeholder="ten_dang_nhap"
                                />
                            </div>
                            {validationErrors.username && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.username}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo Mật Khẩu</h2>
                            <p className="text-gray-600">Chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${validationErrors.password
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]/20'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.password}
                                </p>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                                Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường và số
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Xác nhận mật khẩu *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${validationErrors.confirmPassword
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-[#5B8DEF] focus:ring-[#5B8DEF]/20'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sắp Hoàn Tất!</h2>
                            <p className="text-gray-600">Xem lại và chấp nhận các điều khoản của chúng tôi</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.agreeToTerms}
                                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                    className="mt-1 w-5 h-5 text-[#5B8DEF] border-gray-300 rounded focus:ring-[#5B8DEF]"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-700">
                                    Tôi đồng ý với <Link to="/terms" className="text-[#5B8DEF] hover:underline font-semibold">Điều khoản dịch vụ</Link> *
                                </label>
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="privacy"
                                    checked={formData.agreeToPrivacy}
                                    onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
                                    className="mt-1 w-5 h-5 text-[#5B8DEF] border-gray-300 rounded focus:ring-[#5B8DEF]"
                                />
                                <label htmlFor="privacy" className="text-sm text-gray-700">
                                    Tôi đồng ý với <Link to="/privacy" className="text-[#5B8DEF] hover:underline font-semibold">Chính sách bảo mật</Link> *
                                </label>
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="newsletter"
                                    checked={formData.subscribeNewsletter}
                                    onChange={(e) => setFormData({ ...formData, subscribeNewsletter: e.target.checked })}
                                    className="mt-1 w-5 h-5 text-[#5B8DEF] border-gray-300 rounded focus:ring-[#5B8DEF]"
                                />
                                <label htmlFor="newsletter" className="text-sm text-gray-700">
                                    Gửi cho tôi các mẹo, xu hướng và cập nhật về Ocean Hire
                                </label>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-900">
                                <strong>Quyền riêng tư của bạn rất quan trọng.</strong> Chúng tôi sẽ không bao giờ chia sẻ thông tin cá nhân của bạn nếu không có sự đồng ý.
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-[#5B8DEF] rounded-xl flex items-center justify-center shadow-lg">
                        <Waves className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">Ocean Hire</span>
                </Link>

                {/* Registration Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    <StepIndicator currentStep={currentStep} totalSteps={4} />

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {renderStepContent()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-4 mt-8">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Quay lại
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex-1 px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A90E2] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    Tiếp theo
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            Đang tạo tài khoản...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Tạo tài khoản
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        Bạn đã có tài khoản?{' '}
                        <Link to="/login" className="text-[#5B8DEF] hover:text-[#4A90E2] font-semibold">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
