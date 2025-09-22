import React from 'react';
interface StatusCardProps {
  title: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'amber' | 'green' | 'red';
  onClick?: () => void;
}
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  total,
  icon,
  color,
  onClick
}) => {
  const getGradientClasses = () => {
    switch (color) {
      case 'purple':
        return 'bg-gradient-blue';
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
        return 'shadow-glow-blue';
      case 'amber':
      case 'red':
        return 'shadow-glow-orange';
      case 'green':
        return 'shadow-glow-blue';
      default:
        return '';
    }
  };
  return <div className="bg-dark-200/60 backdrop-blur-md backdrop-saturate-150 rounded-xl shadow-glass border border-white/10 p-6 cursor-pointer hover:shadow-lg transition-all" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-light-300/90 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-light-100">
            {value}
            {total ? <span className="text-sm text-light-300/80"> / {total}</span> : ''}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${getGradientClasses()} ${getGlowClasses()}`}>
          {icon}
        </div>
      </div>
    </div>;
};