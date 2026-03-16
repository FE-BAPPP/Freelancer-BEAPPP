import React from 'react';
import { NotificationToast } from './NotificationToast';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationContainerProps {
  onBalanceUpdate?: (balance: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ onBalanceUpdate }) => {
  const { notifications, clearNotification } = useNotifications(onBalanceUpdate);

  return (
    <>
      {/* Connection indicator */}


      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {notifications.map((notification, index) => (
          <NotificationToast
            key={`${notification.timestamp}-${index}`}
            notification={notification}
            onClose={() => clearNotification(index)}
          />
        ))}
      </div>
    </>
  );
};