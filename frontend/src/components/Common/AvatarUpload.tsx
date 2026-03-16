/**
 * AvatarUpload Component
 * Upload avatar with drag-drop support and preview
 */

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { cn } from '../../utils/cn';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  name?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  name,
  onUpload,
  onDelete,
  size = 'xl',
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be less than 5MB';
    }
    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      await onUpload(file);
      setPreviewUrl(null); // Clear preview after successful upload
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setUploading(true);
      await onDelete();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setUploading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Avatar with upload overlay */}
      <div
        className={cn(
          'relative group cursor-pointer',
          sizeClasses[size]
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Avatar display */}
        <Avatar
          src={displayAvatar}
          name={name}
          size={size}
          className={cn(
            'w-full h-full',
            dragOver && 'ring-4 ring-pink-500 ring-offset-2 ring-offset-[#0e0e10]'
          )}
        />

        {/* Upload overlay */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-black/60 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          dragOver && 'opacity-100'
        )}>
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Delete button */}
        {currentAvatar && onDelete && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Change Photo
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
