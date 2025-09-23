import React from 'react';
import { BookOpen, Clock, Info, MapPin, Calendar, Utensils, Plane, HelpCircle } from 'lucide-react';
interface KnowledgeCardProps {
  item: any;
  isSelected: boolean;
  onClick: () => void;
}
export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  item,
  isSelected,
  onClick
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hotel Facilities':
        return <Info className="w-5 h-5" />;
      case 'Local Attractions':
        return <MapPin className="w-5 h-5" />;
      case 'Operating Hours':
        return <Clock className="w-5 h-5" />;
      case 'Events':
        return <Calendar className="w-5 h-5" />;
      case 'Dining':
        return <Utensils className="w-5 h-5" />;
      case 'Transportation':
        return <Plane className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hotel Facilities':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'Local Attractions':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'Operating Hours':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'Events':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'Dining':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'Transportation':
        return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  return <div className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={onClick}>
      <div className="flex items-start mb-3">
        <div className={`p-2 rounded-full mr-3 ${getCategoryColor(item.category)}`}>
          {getCategoryIcon(item.category)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.category}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
        {item.content}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>Updated {formatDate(item.lastUpdated)}</span>
        </div>
      </div>
    </div>;
};