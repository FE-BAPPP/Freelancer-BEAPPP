import { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Briefcase, Clock } from 'lucide-react';
import { notificationApi } from '../../services';
import { Notification } from '../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  async function loadNotifications() {
    try {
      setLoading(true);
      // FIX: Pass page and size as separate number parameters, not an object
      const response = await notificationApi.getNotifications(0, 20);
      const data = response.data?.content || response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_CREATED':
      case 'PROJECT_STARTED':
      case 'PROJECT_COMPLETED':
        return <Briefcase className="w-5 h-5" />;
      case 'MILESTONE_APPROVED':
      case 'MILESTONE_REJECTED':
      case 'MILESTONE_SUBMITTED':
        return <CheckCircle className="w-5 h-5" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_RELEASED':
        return <CheckCircle className="w-5 h-5" />;
      case 'DISPUTE_CREATED':
      case 'DISPUTE_RESOLVED':
        return <AlertCircle className="w-5 h-5" />;
      case 'REVIEW_RECEIVED':
        return <Info className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    if (type.includes('APPROVED') || type.includes('RECEIVED') || type.includes('COMPLETED')) {
      return 'text-green-400 bg-green-500/20';
    }
    if (type.includes('REJECTED') || type.includes('DISPUTE')) {
      return 'text-red-400 bg-red-500/20';
    }
    if (type.includes('SUBMITTED') || type.includes('CREATED')) {
      return 'text-yellow-400 bg-yellow-500/20';
    }
    return 'text-blue-400 bg-blue-500/20';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed right-4 top-16 w-96 max-h-[600px] bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Thông báo
            </h3>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-500/5' : ''
                      }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(notification.type)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium mb-1">{notification.title}</p>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          {!notification.isRead && (
                            <span className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
