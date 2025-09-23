import React, { useEffect, useState, useRef } from 'react';
import { Bell, Menu, Moon, Sun, Search, User } from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
interface HeaderProps {
  toggleSidebar: () => void;
  notificationsCount: number;
  onNotificationClick?: (notification: any) => void;
  notifications?: any[];
}
export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  notificationsCount,
  onNotificationClick,
  notifications = []
}) => {
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleNotificationClick = (notification: any) => {
    // Call the parent handler if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    // Close the notifications panel
    setShowNotifications(false);
  };
  const handleClearAllNotifications = () => {
    // This would be handled by the parent component
  };
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  return <header className="z-10 py-4 bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 border-b border-white/10">
      <div className="container flex items-center justify-between h-full px-6 mx-auto">
        {/* Mobile hamburger */}
        <button className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none" onClick={toggleSidebar} aria-label="Menu">
          <Menu className="w-6 h-6 text-light-300" />
        </button>
        {/* Search */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6">
            <div className="absolute inset-y-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-light-300/50" />
            </div>
            <input className="w-full pl-10 pr-3 py-2 text-sm text-light-100 placeholder-light-300/50 bg-dark-100/60 backdrop-blur-md border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-gradient-start" type="text" placeholder="Search for requests, rooms, or guests" aria-label="Search" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsPanelRef}>
            <button className="p-1 relative rounded-md focus:outline-none" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="w-5 h-5 text-light-300" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs text-white bg-gradient-orange rounded-full flex items-center justify-center transform -translate-y-1/2 translate-x-1/2">
                  {unreadCount}
                </span>}
            </button>
            {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onNotificationClick={handleNotificationClick} onClearAll={handleClearAllNotifications} />}
          </div>
          {/* Profile */}
          <div className="relative flex items-center">
            <button className="p-1 rounded-full focus:outline-none">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-blue text-white">
                <User className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>;
};