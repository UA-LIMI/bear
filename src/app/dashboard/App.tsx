import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { getGuestProfiles, DashboardGuestProfile } from './services/guestProfileService';
import { getRooms, DashboardRoom } from './services/roomService';
import { Dashboard } from './components/Dashboard/Dashboard';
import { RequestsPanel } from './components/Requests/RequestsPanel';
import { RoomControlPanel } from './components/RoomControl/RoomControlPanel';
import { MenuManagementPanel } from './components/MenuManagement/MenuManagementPanel';
import { KnowledgeBasePanel } from './components/KnowledgeBase/KnowledgeBasePanel';
import { GuestProfilesPanel } from './components/GuestProfiles/GuestProfilesPanel';
import { StaffProfilesPanel } from './components/Staff/StaffProfilesPanel';
import { SettingsPanel } from './components/Settings/SettingsPanel';

// Mock data types
interface GuestRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  type: string;
  message: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  aiSuggestion?: string;
}

// Using imported interfaces from services
type Room = DashboardRoom;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  allergens: string[];
  dietaryInfo: string;
  available: boolean;
}

interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string;
}

interface Notification {
  id: string;
  type: 'request' | 'alert' | 'info' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  details?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // OpenAI API key is handled server-side via OPENAI_API_KEY environment variable
  // No client-side initialization needed

  // Load initial data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load real guest profiles and rooms from database
        const [profilesData, roomsData] = await Promise.all([
          getGuestProfiles(),
          getRooms()
        ]);
        
        setRooms(roomsData);
        // Note: Guest profiles are loaded by GuestProfilesPanel component directly
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();

    // Mock data for components not yet connected to database
    const mockRequests: GuestRequest[] = [
      {
        id: 'req-001',
        guestName: 'John Smith',
        roomNumber: '2104',
        type: 'room-service',
        message: 'I would like to order dinner for 7 PM',
        status: 'pending',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        aiSuggestion: 'Suggest our signature dish and wine pairing'
      },
      {
        id: 'req-002',
        guestName: 'Maria Garcia',
        roomNumber: '1502',
        type: 'housekeeping',
        message: 'Extra towels needed',
        status: 'in-progress',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        priority: 'low'
      }
    ];

    // Rooms are loaded from database above

    const mockMenuItems: MenuItem[] = [
      {
        id: 'menu-001',
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with herbs and lemon',
        price: 32.99,
        category: 'Main Course',
        preparationTime: 25,
        allergens: ['fish'],
        dietaryInfo: 'gluten-free',
        available: true
      },
      {
        id: 'menu-002',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, parmesan, croutons',
        price: 14.99,
        category: 'Appetizer',
        preparationTime: 10,
        allergens: ['dairy', 'gluten'],
        dietaryInfo: 'vegetarian',
        available: true
      }
    ];

    const mockKnowledgeBase: KnowledgeBaseItem[] = [
      {
        id: 'kb-001',
        title: 'Pool Hours',
        content: 'The pool is open from 6 AM to 10 PM daily. Pool towels are available at the front desk.',
        category: 'Hotel Facilities',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'kb-002',
        title: 'Spa Services',
        content: 'Our spa offers massage, facials, and wellness treatments. Bookings can be made through the concierge.',
        category: 'Services',
        lastUpdated: new Date().toISOString()
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'notif-001',
        type: 'request',
        message: 'New room service request from Room 2104',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'notif-002',
        type: 'alert',
        message: 'Maintenance needed in Room 1502',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      }
    ];

    setRequests(mockRequests);
    // setRooms called above with real data
    setMenuItems(mockMenuItems);
    setKnowledgeBase(mockKnowledgeBase);
    setNotifications(mockNotifications);
  }, []);

  const handleRequestClick = (requestId: string): void => {
    console.log('Request clicked:', requestId);
    // Handle request click logic
  };

  const handleNotificationClick = (notification: Notification): void => {
    console.log('Notification clicked:', notification);
    // Mark notification as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notification.id 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const handleUpdateKnowledgeBase = (id: string, update: Partial<KnowledgeBaseItem>): void => {
    setKnowledgeBase(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...update } : item
      )
    );
  };

  const handleUpdateMenuItem = (menuItemId: string, update: Partial<MenuItem>): void => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === menuItemId ? { ...item, ...update } : item
      )
    );
  };

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            requests={requests}
            rooms={rooms}
            onRequestClick={handleRequestClick}
          />
        );
      case 'requests':
        return (
          <RequestsPanel
            requests={requests}
            onRequestClick={handleRequestClick}
            onUpdateRequest={(id, update) => {
              setRequests(prev => 
                prev.map(req => 
                  req.id === id ? { ...req, ...update } : req
                )
              );
            }}
            knowledgeBase={knowledgeBase}
          />
        );
      case 'rooms':
        return (
          <RoomControlPanel
            rooms={rooms}
            onUpdateRoom={(roomNumber, updates) => {
              setRooms(prev => 
                prev.map(room => 
                  room.roomNumber === roomNumber 
                    ? { ...room, ...updates }
                    : room
                )
              );
            }}
          />
        );
      case 'menu':
        return (
          <MenuManagementPanel
            menuItems={menuItems}
            onUpdateMenuItem={handleUpdateMenuItem}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeBasePanel
            knowledgeBase={knowledgeBase}
            onUpdateKnowledgeBase={handleUpdateKnowledgeBase}
          />
        );
      case 'guests':
        return <GuestProfilesPanel />;
      case 'staff':
        return <StaffProfilesPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <Dashboard
            requests={requests}
            rooms={rooms}
            onRequestClick={handleRequestClick}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onNotificationClick={handleNotificationClick}
      notifications={notifications}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export { App };
