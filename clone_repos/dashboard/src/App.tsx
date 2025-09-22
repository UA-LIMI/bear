import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { RequestsPanel } from './components/Requests/RequestsPanel';
import { RoomControlPanel } from './components/RoomControl/RoomControlPanel';
import { KnowledgeBasePanel } from './components/KnowledgeBase/KnowledgeBasePanel';
import { MenuManagementPanel } from './components/MenuManagement/MenuManagementPanel';
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { GuestProfilesPanel } from './components/GuestProfiles/GuestProfilesPanel';
import { StaffProfilesPanel } from './components/Staff/StaffProfilesPanel';
import { setApiKey, updateAiContext } from './services/openaiService';
import { getGuestRequests, getRooms, getMenuItems, getKnowledgeBase, getNotifications, updateGuestRequest, updateRoom, updateMenuItem, updateKnowledgeBaseItem, markNotificationAsRead, setupRequestWebhook, setupRoomUpdates, setupNotificationUpdates } from './services/dataService';
import { GuestRequest, Room, MenuItem, KnowledgeBaseItem, Notification } from './services/supabaseClient';
export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize OpenAI API key from environment variables
  useEffect(() => {
    // Safely access environment variables with fallback
    let apiKey = '';
    try {
      apiKey = typeof process !== 'undefined' && process.env?.REACT_APP_OPENAI_API_KEY || '';
    } catch (e) {
      apiKey = '';
    }
    if (apiKey) {
      setApiKey(apiKey);
    }
    setIsInitialized(true);
  }, []);
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [requestsData, roomsData, menuItemsData, knowledgeBaseData, notificationsData] = await Promise.all([getGuestRequests(), getRooms(), getMenuItems(), getKnowledgeBase(), getNotifications()]);
        setRequests(requestsData);
        setRooms(roomsData);
        setMenuItems(menuItemsData);
        setKnowledgeBase(knowledgeBaseData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  // Set up real-time updates for new guest requests
  useEffect(() => {
    const unsubscribe = setupRequestWebhook(newRequest => {
      setRequests(prevRequests => [newRequest, ...prevRequests]);
      // Also create a notification for the new request
      const newNotification = {
        id: `notif-${Date.now()}`,
        type: 'request',
        title: 'New Guest Request',
        message: `${newRequest.guestName} in Room ${newRequest.roomNumber} has a new ${newRequest.type} request.`,
        timestamp: new Date().toISOString(),
        read: false,
        requestId: newRequest.id,
        sender: 'System'
      };
      setNotifications(prevNotifications => [newNotification as Notification, ...prevNotifications]);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  // Set up real-time updates for room changes
  useEffect(() => {
    const unsubscribe = setupRoomUpdates(updatedRoom => {
      setRooms(prevRooms => prevRooms.map(room => room.roomNumber === updatedRoom.roomNumber ? updatedRoom : room));
    });
    return () => {
      unsubscribe();
    };
  }, []);
  // Set up real-time updates for notifications
  useEffect(() => {
    const unsubscribe = setupNotificationUpdates(newNotification => {
      setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  // Update AI context when knowledge base changes
  useEffect(() => {
    if (isInitialized && knowledgeBase.length > 0) {
      updateAiContext(knowledgeBase).then(success => {
        if (success) {
          console.log('AI context updated successfully');
        }
      }).catch(error => {
        console.error('Error updating AI context:', error);
      });
    }
  }, [knowledgeBase, isInitialized]);
  // Handler for updating request status
  const handleUpdateRequest = async (id, update) => {
    try {
      const updatedRequest = await updateGuestRequest(id, update);
      setRequests(requests.map(req => req.id === id ? updatedRequest : req));
    } catch (error) {
      console.error(`Error updating request ${id}:`, error);
    }
  };
  // Handler for updating room controls
  const handleUpdateRoom = async (roomNumber, update) => {
    try {
      const updatedRoom = await updateRoom(roomNumber, update);
      setRooms(rooms.map(room => room.roomNumber === roomNumber ? updatedRoom : room));
    } catch (error) {
      console.error(`Error updating room ${roomNumber}:`, error);
    }
  };
  // Handler for updating menu item availability
  const handleUpdateMenuItem = async (id, update) => {
    try {
      const updatedMenuItem = await updateMenuItem(id, update);
      setMenuItems(menuItems.map(item => item.id === id ? updatedMenuItem : item));
    } catch (error) {
      console.error(`Error updating menu item ${id}:`, error);
    }
  };
  // Handler for updating knowledge base
  const handleUpdateKnowledgeBase = async (id, update) => {
    try {
      const updatedItem = await updateKnowledgeBaseItem(id, update);
      const updatedKnowledgeBase = knowledgeBase.map(item => item.id === id ? updatedItem : item);
      setKnowledgeBase(updatedKnowledgeBase);
    } catch (error) {
      console.error(`Error updating knowledge base item ${id}:`, error);
    }
  };
  // Handler for notification clicks
  const handleNotificationClick = async notification => {
    // Mark notification as read
    try {
      await markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n => n.id === notification.id ? {
        ...n,
        read: true
      } : n));
    } catch (error) {
      console.error(`Error marking notification ${notification.id} as read:`, error);
    }
    // Navigate based on notification type
    if (notification.type === 'request' && notification.requestId) {
      setActiveTab('requests');
      setSelectedRequestId(notification.requestId);
    } else if (notification.type === 'room' && notification.roomNumber) {
      setActiveTab('rooms');
      // You would need to implement room selection in the RoomControlPanel
    } else if (notification.type === 'guest' && notification.guestId) {
      setActiveTab('guests');
      // You would need to implement guest selection in the GuestProfilesPanel
    }
  };
  const renderActivePanel = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>;
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome requests={requests} rooms={rooms} setActiveTab={setActiveTab} onSelectRequest={setSelectedRequestId} />;
      case 'requests':
        return <RequestsPanel requests={requests} onUpdateRequest={handleUpdateRequest} knowledgeBase={knowledgeBase} selectedRequestId={selectedRequestId} />;
      case 'rooms':
        return <RoomControlPanel rooms={rooms} onUpdateRoom={handleUpdateRoom} />;
      case 'menu':
        return <MenuManagementPanel menuItems={menuItems} onUpdateMenuItem={handleUpdateMenuItem} />;
      case 'knowledge':
        return <KnowledgeBasePanel knowledgeBase={knowledgeBase} onUpdateKnowledgeBase={handleUpdateKnowledgeBase} />;
      case 'guests':
        return <GuestProfilesPanel />;
      case 'staff':
        return <StaffProfilesPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardHome requests={requests} rooms={rooms} setActiveTab={setActiveTab} />;
    }
  };
  return <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} onNotificationClick={handleNotificationClick} notifications={notifications}>
      {renderActivePanel()}
    </DashboardLayout>;
}