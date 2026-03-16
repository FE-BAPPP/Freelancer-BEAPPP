import { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../services';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  count?: number; // Optional prop for external control
}

export function NotificationBell({ onClick, className = '', count }: NotificationBellProps) {
  const { user } = useAuth();
  const [internalCount, setInternalCount] = useState(0);

  // Use external count if provided, otherwise internal
  const displayCount = count !== undefined ? count : internalCount;

  const handleNotification = useCallback(() => {
    // If we rely on external count (polling in header), we might not need this here,
    // but keeping it for standalone usage or optimistic updates if needed.
    // For now, if count is provided, we rely on parent to update it.
    if (count === undefined) {
      setInternalCount(prev => prev + 1);
    }
  }, [count]);

  // Listen for real-time notifications to update badge (only if using internal state)
  useWebSocket({
    topic: '/user/queue/notifications',
    onMessageReceived: handleNotification,
    enabled: !!user?.id && count === undefined
  });

  // Initial load only if controlled from outside
  useEffect(() => {
    if (count === undefined) {
      loadUnreadCount();
    }
  }, [count]);

  async function loadUnreadCount() {
    try {
      const response = await notificationApi.getUnreadCount();
      // Handle both { count: number } and { unreadCount: number } response shapes
      const val = typeof response.data === 'number'
        ? response.data
        : (response.data as any)?.count || (response.data as any)?.unreadCount || 0;
      setInternalCount(val);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-white/5 transition-colors ${className}`}
    >
      <Bell className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
      {displayCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {displayCount > 9 ? '9+' : displayCount}
        </span>
      )}
    </button>
  );
}
