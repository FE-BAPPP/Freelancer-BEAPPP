import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';

export interface NotificationMessage {
  type:
  | 'SYSTEM'
  | 'DEPOSIT_DETECTED' | 'DEPOSIT_CONFIRMED' | 'DEPOSIT_SUCCESS'
  | 'WITHDRAWAL_CREATED' | 'WITHDRAWAL_PROCESSING' | 'WITHDRAWAL_COMPLETED' | 'WITHDRAWAL_FAILED' | 'WITHDRAWAL_SUCCESS' | 'WITHDRAWAL_PENDING'
  | 'POINTS_TRANSFER' | 'BALANCE_UPDATE'
  | 'JOB_POSTED'
  | 'PROPOSAL_RECEIVED' | 'PROPOSAL_ACCEPTED' | 'PROPOSAL_REJECTED'
  | 'PROJECT_STARTED' | 'PROJECT_COMPLETED'
  | 'MILESTONE_CREATED' | 'MILESTONE_SUBMITTED' | 'MILESTONE_APPROVED' | 'MILESTONE_REJECTED'
  | 'PAYMENT_RECEIVED' | 'PAYMENT_SENT'
  | 'DISPUTE_OPENED' | 'DISPUTE_RESOLVED'
  | 'MESSAGE_RECEIVED' | 'NEW_REVIEW' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  txHash?: string;
  withdrawalId?: string;
  amount?: number;
  pointsAmount?: number;
  pointsBalance?: number;
  timestamp: string;
  autoHide?: boolean;
  hideAfterMs?: number;
  id?: string; // Added for auto-hide tracking and duplicate prevention
  entityType?: string;
  entityId?: string;
}

export interface UseNotificationsReturn {
  notifications: NotificationMessage[];
  isConnected: boolean;
  connectionError: string | null;
  clearNotification: (index: number) => void;
  clearAllNotifications: () => void;
  refreshBalance?: () => void;
}

export const useNotifications = (onBalanceUpdate?: (balance: number) => void): UseNotificationsReturn => {
  const { isLoggedIn, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Memoize the balance update callback
  const stableOnBalanceUpdate = useRef(onBalanceUpdate);
  stableOnBalanceUpdate.current = onBalanceUpdate;

  const handleMessageReceived = useCallback((notification: NotificationMessage) => {
    console.log('🔔 Received WS notification:', notification);

    // Add unique ID for auto-hide tracking
    const notificationWithId = {
      ...notification,
      id: notification.id || `${notification.type}_${notification.timestamp}_${Math.random().toString(36).substr(2, 9)}`
    };

    setNotifications(prev => {
      // Check for duplicates
      const isDuplicate = prev.some(existing =>
        existing.type === notification.type &&
        existing.timestamp === notification.timestamp &&
        existing.message === notification.message
      );

      if (isDuplicate) {
        // console.log('🔔 Duplicate notification ignored:', notification.type);
        return prev;
      }

      // For withdrawal flow: replace PROCESSING with COMPLETED/FAILED for same tx
      if (notification.type === 'WITHDRAWAL_COMPLETED' || notification.type === 'WITHDRAWAL_FAILED') {
        const filteredPrev = prev.filter(existing =>
          !(existing.type === 'WITHDRAWAL_PROCESSING' && existing.txHash === notification.txHash)
        );
        return [notificationWithId, ...filteredPrev.slice(0, 8)];
      }

      // For deposit flow: replace DETECTED with CONFIRMED for same tx
      if (notification.type === 'DEPOSIT_CONFIRMED') {
        const filteredPrev = prev.filter(existing =>
          !(existing.type === 'DEPOSIT_DETECTED' && existing.txHash === notification.txHash)
        );
        return [notificationWithId, ...filteredPrev.slice(0, 8)];
      }

      return [notificationWithId, ...prev.slice(0, 9)]; // Keep last 10
    });

    // Handle balance updates
    if (notification.type === 'BALANCE_UPDATE' && notification.pointsBalance && stableOnBalanceUpdate.current) {
      stableOnBalanceUpdate.current(notification.pointsBalance);
    }

    // Auto-hide logic
    if (notification.autoHide && notification.hideAfterMs) {
      const notificationId = notificationWithId.id;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, notification.hideAfterMs);
    }
  }, []);

  // Use WebSocket hook
  const { isConnected, error } = useWebSocket({
    topic: '/user/queue/notifications',
    onMessageReceived: handleMessageReceived,
    enabled: !!(isLoggedIn && user?.id)
  });

  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    connectionError: error,
    clearNotification,
    clearAllNotifications,
  };
};