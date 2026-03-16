/**
 * Avatar Component
 * Displays user avatar with fallback to initials
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

// Generate initials from name
const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate consistent color from name
const getColorFromName = (name?: string): string => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-pink-500',
    'from-violet-500 to-purple-500',
    'from-cyan-500 to-blue-500',
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  const showFallback = !src || imageError;
  const initials = getInitials(name);
  const gradientColor = getColorFromName(name);
  
  const baseClasses = cn(
    'relative rounded-full overflow-hidden flex items-center justify-center font-semibold',
    sizeClasses[size],
    onClick && 'cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all',
    className
  );

  if (showFallback) {
    return (
      <div
        className={cn(baseClasses, 'bg-gradient-to-br text-white', gradientColor)}
        onClick={onClick}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} title={name}>
      <img
        src={src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${src}`}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default Avatar;
