import React, { useEffect, useState } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { Bell, Menu, X } from 'lucide-react';
interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNotificationClick?: (notification: any) => void;
  notifications?: any[];
}
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onNotificationClick,
  notifications
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(5);
  // Force dark mode on
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className="flex h-screen bg-gradient-to-br from-gray-600 to-gray-800 text-white relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl opacity-20"></div>
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-20 transition-opacity bg-black/70 backdrop-blur-sm lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gray-800 backdrop-blur-md border-r border-white/10 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center">
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
              W
            </span>
            <span className="ml-2 text-xl font-medium text-white">
              Concierge
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} notificationsCount={notifications?.filter(n => !n.read).length || 0} onNotificationClick={onNotificationClick} notifications={notifications} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>;
};