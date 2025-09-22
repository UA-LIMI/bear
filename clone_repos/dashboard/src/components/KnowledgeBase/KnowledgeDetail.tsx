import React, { useState } from 'react';
import { Save, Clock, Info } from 'lucide-react';
interface KnowledgeDetailProps {
  item: any;
  onUpdateKnowledgeBase: (id: string, update: any) => void;
}
export const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({
  item,
  onUpdateKnowledgeBase
}) => {
  const [formData, setFormData] = useState({
    title: item.title,
    category: item.category,
    content: item.content
  });
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    onUpdateKnowledgeBase(item.id, {
      ...formData,
      lastUpdated: new Date().toISOString()
    });
  };
  const formatDate = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit Knowledge Base Item
          </h2>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Last updated: {formatDate(item.lastUpdated)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option value="Hotel Facilities">Hotel Facilities</option>
              <option value="Local Attractions">Local Attractions</option>
              <option value="Operating Hours">Operating Hours</option>
              <option value="Events">Events</option>
              <option value="Dining">Dining</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={12} className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 flex items-start mb-4">
            <Info className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                AI Assistant Information
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This information will be used by the AI assistant to answer
                guest questions. Be clear and accurate, as the AI will use this
                exact text to provide information to guests.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>;
};