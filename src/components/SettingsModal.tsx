import React, { useState, useEffect } from 'react';
import { X, User, Bell, Shield, CreditCard, Database, Globe } from 'lucide-react';
import { TierManager, TIERS } from '../lib/tiers';
import { database } from '../lib/database';
import { useTheme } from '../contexts/ThemeContext';
import PaymentModal from './PaymentModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoSave: true,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  });
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(false);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const currentTier = TierManager.getCurrentTier();
  const tierInfo = TIERS[currentTier];

  useEffect(() => {
    if (isOpen) {
      loadUserSettings();
      loadPaymentHistory();
    }
  }, [isOpen]);

  const loadUserSettings = async () => {
    // Load user settings from localStorage or database
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const loadPaymentHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await database.getPayments(user.id);
    if (!error && data) {
      setPaymentHistory(data);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ];

  const handleSave = async () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Update user profile in database
    if (user) {
      await database.updateUserProfile(user.id, {
        name: user.name,
        email: user.email,
        settings: settings
      });
    }
    
    alert('Settings saved successfully!');
    onClose();
  };

  const exportData = async () => {
    const userData = {
      profile: user,
      settings: settings,
      tier: currentTier,
      usage: TierManager.getUsage(),
      paymentHistory: paymentHistory,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-business-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpgrade = (tierKey: string) => {
    setSelectedTier(tierKey);
    setShowPaymentModal(true);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Company</label>
              <input
                type="text"
                placeholder="Your Company Name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Receive updates about your account</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Marketing Updates</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Get tips and product updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) => setSettings(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Payment Notifications</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Alerts for payments and billing</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Usage Alerts</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Notify when approaching limits</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-4">Change Password</h4>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-300">Current Plan: {tierInfo.name}</h4>
              <p className="text-blue-700 dark:text-blue-400">${tierInfo.price}/month</p>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-4">Available Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(TIERS).map(([key, tier]) => (
                  <div
                    key={key}
                    className={`p-4 border rounded-lg ${
                      currentTier === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-gray-600'
                    }`}
                  >
                    <h5 className="font-semibold text-slate-800 dark:text-white">{tier.name}</h5>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">${tier.price}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">/month</p>
                    {currentTier === key ? (
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Current Plan</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(key)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        {tier.price > TIERS[currentTier].price ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-4">Payment History</h4>
              {loading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {payment.tier.charAt(0).toUpperCase() + payment.tier.slice(1)} Plan
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800 dark:text-white">${payment.amount}</p>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                  No payment history available
                </div>
              )}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-4">Data Export</h4>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Download all your data in JSON format</p>
              <button 
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Data
              </button>
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-white mb-4">Data Deletion</h4>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Permanently delete your account and all data</p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Dark Mode</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Toggle dark/light theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Auto-save</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400">Automatically save your work</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-slate-50 dark:bg-gray-700 border-r border-slate-200 dark:border-gray-600 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                {renderTabContent()}
                
                <div className="flex space-x-4 mt-8 pt-6 border-t border-slate-200 dark:border-gray-600">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
        user={user}
      />
    </>
  );
};

export default SettingsModal;