import React from 'react';
import { X, Bell, Clock, User, MessageSquare, AlertTriangle, CheckCircle, Home } from 'lucide-react';
interface NotificationsPanelProps {
  notifications: any[];
  onClose: () => void;
  onNotificationClick: (notification: any) => void;
  onClearAll: () => void;
}
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onClose,
  onNotificationClick,
  onClearAll
}) => {
  const getNotificationIcon = type => {
    switch (type) {
      case 'request':
        return <MessageSquare className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'room':
        return <Home className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  return <div className="absolute right-0 mt-2 w-80 bg-dark-200/80 backdrop-blur-md backdrop-saturate-150 rounded-lg shadow-glass border border-white/10 z-50">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-medium text-light-100">Notifications</h3>
        <div className="flex items-center space-x-2">
          <button onClick={onClearAll} className="text-xs text-light-300/80 hover:text-light-100">
            Clear all
          </button>
          <button onClick={onClose} className="text-light-300/80 hover:text-light-100">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? <div className="divide-y divide-white/10">
            {notifications.map(notification => <div key={notification.id} className="p-4 hover:bg-dark-100/40 cursor-pointer transition-colors" onClick={() => onNotificationClick(notification)}>
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-light-300/80 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-light-300/70">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTime(notification.timestamp)}</span>
                      {notification.sender && <>
                          <span className="mx-1">•</span>
                          <User className="w-3 h-3 mr-1" />
                          <span>{notification.sender}</span>
                        </>}
                    </div>
                  </div>
                  {!notification.read && <div className="ml-2 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-gradient-start"></div>
                    </div>}
                </div>
              </div>)}
          </div> : <div className="p-6 text-center text-light-300/60">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>}
      </div>
    </div>;
};