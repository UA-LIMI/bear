import React from 'react';
import { Coffee, CheckCircle, XCircle } from 'lucide-react';
interface MenuItemCardProps {
  item: any;
  isSelected: boolean;
  onClick: () => void;
  onToggleAvailability: () => void;
}
export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  onClick,
  onToggleAvailability
}) => {
  const handleToggleClick = e => {
    e.stopPropagation();
    onToggleAvailability();
  };
  return <div className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={onClick}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${item.category === 'Breakfast' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : item.category === 'Lunch' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : item.category === 'Dinner' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : item.category === 'Drinks' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.category}
            </p>
          </div>
        </div>
        <button onClick={handleToggleClick} className={`p-1 rounded-full ${item.available ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20'}`}>
          {item.available ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
        {item.description}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          ${item.price.toFixed(2)}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {item.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </div>;
};