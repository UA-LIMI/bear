import React, { useState } from 'react';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemDetail } from './MenuItemDetail';
import { Search, Filter, PlusCircle } from 'lucide-react';
interface MenuManagementPanelProps {
  menuItems: any[];
  onUpdateMenuItem: (id: string, update: any) => void;
}
export const MenuManagementPanel: React.FC<MenuManagementPanelProps> = ({
  menuItems,
  onUpdateMenuItem
}) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'all' || availabilityFilter === 'available' && item.available || availabilityFilter === 'unavailable' && !item.available;
    return matchesSearch && matchesCategory && matchesAvailability;
  });
  return <div className="h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Menu Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Search menu items" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map((category: string) => <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>)}
            </select>
            <select className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          <button className="w-full p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Menu Item
          </button>
          {filteredItems.length > 0 ? filteredItems.map((item: any) => <MenuItemCard key={item.id} item={item} isSelected={selectedMenuItem && selectedMenuItem.id === item.id} onClick={() => setSelectedMenuItem(item)} onToggleAvailability={() => onUpdateMenuItem(item.id, {
          available: !item.available
        })} />) : <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No menu items found matching your filters
            </div>}
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          {selectedMenuItem ? <MenuItemDetail item={selectedMenuItem} onUpdateMenuItem={onUpdateMenuItem} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>Select a menu item to view details</p>
            </div>}
        </div>
      </div>
    </div>;
};