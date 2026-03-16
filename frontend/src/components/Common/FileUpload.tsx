import { useState, useRef } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { filesApi } from '../../services/filesApi';
import { FileResponse } from '../../services/api'; // ✅ FIX: Import from main api file

interface FileUploadProps {
    entityType: 'JOB' | 'PROPOSAL' | 'PROJECT' | 'MILESTONE' | 'CONVERSATION';
    entityId: string;
    onUploadSuccess: (file: FileResponse) => void;
    onUploadError?: (error: string) => void;
    acceptedTypes?: string; // e.g., "image/*,application/pdf"
    maxSizeMB?: number;
    className?: string;
    label?: string;
    compact?: boolean;
}

export function FileUpload({
    entityType,
    entityId,
    onUploadSuccess,
    onUploadError,
    acceptedTypes = '*',
    maxSizeMB = 10,
    className = '',
    label = 'Upload File',
    compact = false
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);

        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
            const err = `File size exceeds ${maxSizeMB}MB limit`;
            setError(err);
            if (onUploadError) onUploadError(err);
            return;
        }

        try {
            setIsUploading(true);
            const response = await filesApi.uploadFile(file, entityType, entityId);

            if (response.success && response.data) {
                onUploadSuccess(response.data);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (err: any) {
            const errMsg = err.message || 'Failed to upload file';
            setError(errMsg);
            if (onUploadError) onUploadError(errMsg);
        } finally {
            setIsUploading(false);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    if (compact) {
        return (
            <div className={`relative ${className}`}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={acceptedTypes}
                    className="hidden"
                    disabled={isUploading}
                />
                <button
                    type="button"
                    onClick={triggerUpload}
                    disabled={isUploading}
                    className="p-2 text-gray-400 hover:text-[#007fed] hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                    title={label === 'Upload File' ? 'Tải tệp lên' : label}
                >
                    {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#007fed]" />
                    ) : (
                        <Upload className="w-5 h-5" />
                    )}
                </button>
                {error && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded shadow-sm border border-red-100 whitespace-nowrap z-50 font-bold">
                        {error === `File size exceeds ${maxSizeMB}MB limit` ? `Kích thước tệp vượt quá ${maxSizeMB}MB` : error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={acceptedTypes}
                className="hidden"
                disabled={isUploading}
            />

            <div
                onClick={!isUploading ? triggerUpload : undefined}
                className={`
                    border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                    ${isUploading ? 'bg-gray-50 border-[#007fed]/20' : 'border-gray-200 hover:border-[#007fed] hover:bg-blue-50'}
                    ${error ? 'border-red-300 bg-red-50' : ''}
                `}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-10 h-10 text-[#007fed] animate-spin mb-3" />
                        <p className="text-sm font-bold text-gray-500">Đang tải lên...</p>
                    </>
                ) : (
                    <>
                        <Upload className={`w-10 h-10 mb-3 ${error ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="text-sm font-black text-gray-900">{label === 'Upload File' ? 'Tải tệp lên' : label}</p>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-tighter">
                            Dung lượng tối đa: {maxSizeMB}MB
                        </p>
                    </>
                )}
            </div>

            {error && (
                <p className="mt-3 text-xs font-bold text-red-600 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100 italic">
                    <AlertCircle className="w-4 h-4" />
                    {error === `File size exceeds ${maxSizeMB}MB limit` ? `Kích thước tệp vượt quá ${maxSizeMB}MB` : error}
                </p>
            )}
        </div>
    );
}
