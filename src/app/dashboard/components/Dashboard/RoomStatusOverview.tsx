import React from 'react';
import { Thermometer, Lightbulb, Wind, AlertTriangle } from 'lucide-react';
interface RoomStatusOverviewProps {
  rooms: any[];
}
export const RoomStatusOverview: React.FC<RoomStatusOverviewProps> = ({
  rooms
}) => {
  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.roomNumber.toString().substring(0, 1);
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(room);
    return acc;
  }, {});
  // Sort floors
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => parseInt(b) - parseInt(a));
  return <div className="space-y-6">
      {sortedFloors.map(floor => <div key={floor}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Floor {floor}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {roomsByFloor[floor].map((room: any) => <div key={room.roomNumber} className={`p-3 rounded-lg border ${room.status === 'occupied' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {room.roomNumber}
                  </p>
                  {room.maintenanceNeeded && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </div>
                {room.status === 'occupied' ? <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Thermometer className="w-3 h-3 mr-1" />
                        <span>{room.temperature}°C</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Wind className={`w-3 h-3 mr-1 ${room.acOn ? 'text-blue-500' : 'text-gray-400'}`} />
                        <Lightbulb className={`w-3 h-3 ${room.lights ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {room.guestName}
                    </p>
                  </div> : <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vacant
                  </p>}
              </div>)}
          </div>
        </div>)}
    </div>;
};