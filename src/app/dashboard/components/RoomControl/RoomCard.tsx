import React from 'react';
import { Thermometer, Lightbulb, DoorClosed, User } from 'lucide-react';
interface RoomCardProps {
  room: any;
  isSelected: boolean;
  onClick: () => void;
}
export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isSelected,
  onClick
}) => {
  return <div className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-blue-gradient-start bg-gradient-to-r from-blue-gradient-start/10 to-blue-gradient-end/10' : 'border-dark-100 bg-dark-200 hover:bg-dark-100'}`} onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-light-100">Room {room.roomNumber}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${room.status === 'occupied' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-dark-100 text-light-300 border border-light-300/20'}`}>
          {room.status === 'occupied' ? 'Occupied' : 'Vacant'}
        </span>
      </div>
      {room.status === 'occupied' && <div className="flex items-center mb-3 text-sm text-light-300">
          <User className="w-4 h-4 mr-1" />
          <span>{room.guestName}</span>
        </div>}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center text-light-300">
          <Thermometer className="w-3 h-3 mr-1" />
          <span>{room.temperature}°C</span>
        </div>
        <div className="flex items-center text-light-300">
          <Lightbulb className={`w-3 h-3 mr-1 ${room.lights ? 'text-yellow-400' : 'text-light-300/50'}`} />
          <span>{room.lights ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center text-light-300">
          <DoorClosed className="w-3 h-3 mr-1" />
          <span>{room.doNotDisturb ? 'DND On' : 'DND Off'}</span>
        </div>
      </div>
    </div>;
};