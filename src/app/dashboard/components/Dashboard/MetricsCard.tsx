import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'amber' | 'green' | 'red';
}
export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color
}) => {
  const getGradientClasses = () => {
    switch (color) {
      case 'purple':
        return 'bg-gradient-to-r from-blue-500 to-blue-700';
      case 'blue':
        return 'from-blue-600/90 to-cyan-400/90';
      case 'amber':
        return 'bg-gradient-orange';
      case 'green':
        return 'from-emerald-500/90 to-teal-400/90';
      case 'red':
        return 'from-red-500/90 to-pink-500/90';
      default:
        return 'from-gray-600/90 to-gray-500/90';
    }
  };
  const getGlowClasses = () => {
    switch (color) {
      case 'purple':
      case 'blue':
        return 'shadow-lg';
      case 'amber':
      case 'red':
        return 'shadow-glow-orange';
      case 'green':
        return 'shadow-lg';
      default:
        return '';
    }
  };
  return <div className="bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 rounded-xl shadow-glass-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-light-300/90">{title}</p>
        <div className={`p-2 rounded-full bg-gradient-to-r ${getGradientClasses()} ${getGlowClasses()}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-semibold text-light-100">{value}</p>
      <div className="flex items-center mt-2">
        {changeType === 'increase' ? <>
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs font-medium text-green-500">{change}</span>
          </> : <>
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-xs font-medium text-red-500">{change}</span>
          </>}
        <span className="text-xs text-light-300/80 ml-1">since yesterday</span>
      </div>
    </div>;
};