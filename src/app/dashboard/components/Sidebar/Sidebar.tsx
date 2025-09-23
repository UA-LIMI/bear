import React from 'react';
import { Home, MessageSquare, Hotel, Coffee, BookOpen, Users, UserCog, Settings } from 'lucide-react';
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const menuItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />
  }, {
    id: 'requests',
    label: 'Requests',
    icon: <MessageSquare className="w-5 h-5" />
  }, {
    id: 'rooms',
    label: 'Room Control',
    icon: <Hotel className="w-5 h-5" />
  }, {
    id: 'menu',
    label: 'Menu Management',
    icon: <Coffee className="w-5 h-5" />
  }, {
    id: 'knowledge',
    label: 'Knowledge Base',
    icon: <BookOpen className="w-5 h-5" />
  }, {
    id: 'guests',
    label: 'Guest Profiles',
    icon: <Users className="w-5 h-5" />
  }, {
    id: 'staff',
    label: 'Staff',
    icon: <UserCog className="w-5 h-5" />
  }, {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }];
  return <div className="py-4">
      <ul className="space-y-2 px-3">
        {menuItems.map(item => <li key={item.id}>
            <button onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg backdrop-blur-sm' : 'text-gray-300 hover:bg-gray-800/60 hover:backdrop-blur-sm hover:text-white'}`}>
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          </li>)}
      </ul>
    </div>;
};