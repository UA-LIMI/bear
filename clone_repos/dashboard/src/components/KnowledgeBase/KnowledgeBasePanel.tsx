import React, { useState } from 'react';
import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeDetail } from './KnowledgeDetail';
import { Search, PlusCircle } from 'lucide-react';
interface KnowledgeBasePanelProps {
  knowledgeBase: any[];
  onUpdateKnowledgeBase: (id: string, update: any) => void;
}
export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  knowledgeBase,
  onUpdateKnowledgeBase
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const categories = ['all', ...new Set(knowledgeBase.map(item => item.category))];
  const filteredItems = knowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  return <div className="h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Knowledge Base
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Search knowledge base" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {categories.map(category => <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          <button className="w-full p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Knowledge Item
          </button>
          {filteredItems.length > 0 ? filteredItems.map(item => <KnowledgeCard key={item.id} item={item} isSelected={selectedItem && selectedItem.id === item.id} onClick={() => setSelectedItem(item)} />) : <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No knowledge items found matching your filters
            </div>}
        </div>
        <div className="lg:col-span-2 overflow-y-auto">
          {selectedItem ? <KnowledgeDetail item={selectedItem} onUpdateKnowledgeBase={onUpdateKnowledgeBase} /> : <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>Select an item to view or edit</p>
            </div>}
        </div>
      </div>
    </div>;
};