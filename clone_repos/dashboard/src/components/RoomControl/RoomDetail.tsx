import React, { useEffect, useState } from 'react';
import { Thermometer, Lightbulb, DoorClosed, Wind, User, Sunset, BedDouble, Clock, Activity } from 'lucide-react';
import { controlRoomLights, controlRoomTemperature, controlRoomAC, controlRoomCurtains, controlRoomDND } from '../../services/mqttService';
interface RoomDetailProps {
  room: any;
  onUpdateRoom: (roomNumber: string, update: any) => void;
  mqttConnected: boolean;
}
export const RoomDetail: React.FC<RoomDetailProps> = ({
  room,
  onUpdateRoom,
  mqttConnected = false
}) => {
  const [temperatureValue, setTemperatureValue] = useState(room.temperature);
  const [isUpdating, setIsUpdating] = useState({
    lights: false,
    temperature: false,
    ac: false,
    curtains: false,
    dnd: false
  });
  useEffect(() => {
    setTemperatureValue(room.temperature);
  }, [room.temperature]);
  const handleTemperatureChange = value => {
    setTemperatureValue(value);
  };
  const handleTemperatureApply = () => {
    if (temperatureValue === room.temperature) return;
    setIsUpdating({
      ...isUpdating,
      temperature: true
    });
    // Update local state
    onUpdateRoom(room.roomNumber, {
      temperature: temperatureValue
    });
    // If MQTT is connected, send command to device
    if (mqttConnected) {
      controlRoomTemperature(room.roomNumber, temperatureValue);
    }
    setTimeout(() => {
      setIsUpdating({
        ...isUpdating,
        temperature: false
      });
    }, 1000);
  };
  const handleLightsToggle = () => {
    setIsUpdating({
      ...isUpdating,
      lights: true
    });
    // Update local state
    onUpdateRoom(room.roomNumber, {
      lights: !room.lights
    });
    // If MQTT is connected, send command to device
    if (mqttConnected) {
      controlRoomLights(room.roomNumber, !room.lights);
    }
    setTimeout(() => {
      setIsUpdating({
        ...isUpdating,
        lights: false
      });
    }, 1000);
  };
  const handleDNDToggle = () => {
    setIsUpdating({
      ...isUpdating,
      dnd: true
    });
    // Update local state
    onUpdateRoom(room.roomNumber, {
      doNotDisturb: !room.doNotDisturb
    });
    // If MQTT is connected, send command to device
    if (mqttConnected) {
      controlRoomDND(room.roomNumber, !room.doNotDisturb);
    }
    setTimeout(() => {
      setIsUpdating({
        ...isUpdating,
        dnd: false
      });
    }, 1000);
  };
  const handleACToggle = () => {
    setIsUpdating({
      ...isUpdating,
      ac: true
    });
    // Update local state
    onUpdateRoom(room.roomNumber, {
      acOn: !room.acOn
    });
    // If MQTT is connected, send command to device
    if (mqttConnected) {
      controlRoomAC(room.roomNumber, !room.acOn);
    }
    setTimeout(() => {
      setIsUpdating({
        ...isUpdating,
        ac: false
      });
    }, 1000);
  };
  const handleCurtainsToggle = () => {
    setIsUpdating({
      ...isUpdating,
      curtains: true
    });
    // Update local state
    onUpdateRoom(room.roomNumber, {
      curtainsOpen: !room.curtainsOpen
    });
    // If MQTT is connected, send command to device
    if (mqttConnected) {
      controlRoomCurtains(room.roomNumber, !room.curtainsOpen);
    }
    setTimeout(() => {
      setIsUpdating({
        ...isUpdating,
        curtains: false
      });
    }, 1000);
  };
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Room {room.roomNumber}
          </h2>
          {room.status === 'occupied' && <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4 mr-1" />
              <span>{room.guestName}</span>
            </div>}
        </div>
        <div className="flex items-center space-x-3">
          <span className={`flex items-center text-xs px-2 py-1 rounded-full ${mqttConnected ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
            <Activity className="w-3 h-3 mr-1" />
            {mqttConnected ? 'Connected' : 'Offline Mode'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${room.status === 'occupied' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'}`}>
            {room.status === 'occupied' ? 'Occupied' : 'Vacant'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Control */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Thermometer className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-gray-800 dark:text-white">
                Temperature
              </h3>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-semibold text-gray-800 dark:text-white">
                {temperatureValue}°C
              </span>
              {isUpdating.temperature && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  Updating...
                </span>}
            </div>
          </div>
          <input type="range" min="16" max="30" value={temperatureValue} onChange={e => handleTemperatureChange(parseInt(e.target.value))} onMouseUp={handleTemperatureApply} onTouchEnd={handleTemperatureApply} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
          <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>16°C</span>
            <span>30°C</span>
          </div>
          <div className="mt-4">
            <button onClick={handleACToggle} disabled={isUpdating.ac} className={`w-full py-2 rounded-md flex items-center justify-center ${room.acOn ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'} ${isUpdating.ac ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <Wind className="w-4 h-4 mr-2" />
              {isUpdating.ac ? 'Updating...' : room.acOn ? 'AC On' : 'AC Off'}
            </button>
          </div>
        </div>
        {/* Lighting Control */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <Lightbulb className={`w-5 h-5 mr-2 ${room.lights ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
            <h3 className="font-medium text-gray-800 dark:text-white">
              Lighting
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleLightsToggle} disabled={isUpdating.lights} className={`py-3 rounded-md flex items-center justify-center ${room.lights ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'} ${isUpdating.lights ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <Lightbulb className="w-4 h-4 mr-2" />
              {isUpdating.lights ? 'Updating...' : room.lights ? 'Lights On' : 'Lights Off'}
            </button>
            <button onClick={handleCurtainsToggle} disabled={isUpdating.curtains} className={`py-3 rounded-md flex items-center justify-center ${room.curtainsOpen ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'} ${isUpdating.curtains ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <Sunset className="w-4 h-4 mr-2" />
              {isUpdating.curtains ? 'Updating...' : room.curtainsOpen ? 'Curtains Open' : 'Curtains Closed'}
            </button>
          </div>
          <div className="mt-4">
            <button onClick={handleDNDToggle} disabled={isUpdating.dnd} className={`w-full py-2 rounded-md flex items-center justify-center ${room.doNotDisturb ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'} ${isUpdating.dnd ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-80'}`}>
              <DoorClosed className="w-4 h-4 mr-2" />
              {isUpdating.dnd ? 'Updating...' : room.doNotDisturb ? 'Do Not Disturb On' : 'Do Not Disturb Off'}
            </button>
          </div>
        </div>
        {/* Room Status */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <BedDouble className="w-5 h-5 text-indigo-500 mr-2" />
            <h3 className="font-medium text-gray-800 dark:text-white">
              Room Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Housekeeping
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${room.housekeepingStatus === 'cleaned' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                {room.housekeepingStatus === 'cleaned' ? 'Cleaned' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Minibar</span>
              <span className={`px-2 py-1 rounded-full text-xs ${room.minibarRestocked ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                {room.minibarRestocked ? 'Stocked' : 'Needs Restock'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Maintenance
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${room.maintenanceNeeded ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                {room.maintenanceNeeded ? 'Needed' : 'No Issues'}
              </span>
            </div>
          </div>
        </div>
        {/* Guest Schedule */}
        {room.status === 'occupied' && <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-800 dark:text-white">
                Guest Schedule
              </h3>
            </div>
            {room.guestSchedule && room.guestSchedule.length > 0 ? <div className="space-y-3">
                {room.guestSchedule.map((item, index) => <div key={index} className="flex items-start">
                    <div className="min-w-[60px] text-sm text-gray-500 dark:text-gray-400">
                      {item.time}
                    </div>
                    <div>
                      <div className="text-gray-800 dark:text-white">
                        {item.activity}
                      </div>
                      {item.notes && <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.notes}
                        </div>}
                    </div>
                  </div>)}
              </div> : <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No scheduled activities
              </div>}
          </div>}
      </div>
    </div>;
};