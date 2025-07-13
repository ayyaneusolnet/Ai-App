import React, { useState } from 'react';
import { TierManager, TIERS } from '../lib/tiers';
import { Crown, Zap, BarChart3 } from 'lucide-react';
import TierUpgradeModal from './TierUpgradeModal';

const UsageDashboard: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentTier = TierManager.getCurrentTier();
  const tierInfo = TIERS[currentTier];
  const usage = TierManager.getUsage();

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const usageItems = [
    { key: 'contentGenerations', label: 'Content Generations', icon: Zap },
    { key: 'invoices', label: 'Invoices', icon: BarChart3 },
    { key: 'campaigns', label: 'Campaigns', icon: Crown },
    { key: 'tasks', label: 'Tasks', icon: BarChart3 },
    { key: 'aiQueries', label: 'AI Queries', icon: Zap },
    { key: 'pdfExports', label: 'PDF Exports', icon: BarChart3 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Usage Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{tierInfo.name} Plan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usageItems.map((item) => {
          const IconComponent = item.icon;
          const used = usage[item.key as keyof typeof usage] || 0;
          const limit = tierInfo.limits[item.key as keyof typeof tierInfo.limits];
          const percentage = getUsagePercentage(used, limit);

          return (
            <div key={item.key} className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{item.label}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-slate-800 dark:text-white">{used}</span>
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  / {limit === -1 ? '∞' : limit}
                </span>
              </div>

              {limit !== -1 && (
                <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentTier === 'free' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Upgrade for More Features</h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm mb-3">
            Get unlimited access to all features with our affordable Pro plan starting at just $9.99/month.
          </p>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Upgrade Now
          </button>
        </div>
      )}
      
      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentFeature="usage limits"
      />
    </div>
  );
};

export default UsageDashboard;