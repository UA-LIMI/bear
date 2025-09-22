import React from 'react';
import { Zap, Lightbulb, TrendingUp, DollarSign, Heart, Clock } from 'lucide-react';
interface GuestAISummaryProps {
  summary: {
    overview: string;
    preferences: string[];
    spendingPatterns: string;
    loyaltyInsights: string;
    recommendations: {
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
    }[];
  };
}
export const GuestAISummary: React.FC<GuestAISummaryProps> = ({
  summary
}) => {
  const getImpactColor = impact => {
    switch (impact) {
      case 'high':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
      case 'low':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700';
    }
  };
  const getImpactIcon = impact => {
    switch (impact) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      case 'low':
        return <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };
  return <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-5">
      <div className="flex items-start mb-4">
        <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
            AI Guest Analysis
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
            Personalized insights and recommendations based on guest data and
            behavior patterns
          </p>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">
          Overview
        </h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-400">
          {summary.overview}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
            <Heart className="w-4 h-4 mr-1.5" />
            Preferences & Patterns
          </h4>
          <ul className="space-y-1">
            {summary.preferences.map((pref, index) => <li key={index} className="text-sm text-indigo-700 dark:text-indigo-400 flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                {pref}
              </li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-1.5" />
            Spending & Loyalty
          </h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-2">
            {summary.spendingPatterns}
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-400">
            {summary.loyaltyInsights}
          </p>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3">
          Personalized Recommendations
        </h4>
        <div className="space-y-3">
          {summary.recommendations.map((rec, index) => <div key={index} className={`p-3 rounded-lg border ${getImpactColor(rec.impact)}`}>
              <div className="flex items-start">
                <div className="mt-0.5 mr-2 flex-shrink-0">
                  {getImpactIcon(rec.impact)}
                </div>
                <div>
                  <h5 className={`font-medium text-sm ${getImpactColor(rec.impact).split(' ')[0]}`}>
                    {rec.title}
                  </h5>
                  <p className={`text-xs mt-1 ${getImpactColor(rec.impact).split(' ')[0]}`}>
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};