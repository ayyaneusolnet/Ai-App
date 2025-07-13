import React from 'react';
import { 
  BarChart3, 
  Brain, 
  DollarSign, 
  Home, 
  MessageCircle, 
  Settings, 
  Target, 
  TrendingUp,
  LogOut,
  User,
  Crown,
  Globe,
  Users,
  UserCheck,
  FileText,
  Calculator,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { TierManager, TIERS } from '../lib/tiers';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  setShowChat: (show: boolean) => void;
  user: { id: string; name: string; email: string; avatar?: string } | null;
  onLogout: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  setShowChat, 
  user, 
  onLogout,
  sidebarOpen = true,
  setSidebarOpen
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const currentTier = TierManager.getCurrentTier();
  const tierInfo = TIERS[currentTier];
  const usage = TierManager.getUsage();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'posts', label: 'Post Maker', icon: FileText },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'strategy', label: 'Strategy', icon: Target },
    { id: 'operations', label: 'Operations', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: Globe },
    { id: 'crm', label: 'CRM & Leads', icon: Users },
  ];

  const handleMenuClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleSettingsClick = () => {
    const event = new CustomEvent('openSettings');
    window.dispatchEvent(event);
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && setSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-slate-200 dark:border-gray-700 z-40 overflow-y-auto transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Mobile Close Button */}
        {setSidebarOpen && (
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-gray-400" />
            </button>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">AI Business</h1>
              <p className="text-sm text-slate-500 dark:text-gray-400">Assistant</p>
            </div>
          </div>
          
          {/* User Profile */}
          {user && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Tier Information */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">{tierInfo.name} Plan</span>
              {tierInfo.price > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">${tierInfo.price}/mo</span>
              )}
            </div>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
              <div className="flex justify-between">
                <span>Content:</span>
                <span>{usage.contentGenerations || 0}/{tierInfo.limits.contentGenerations === -1 ? '∞' : tierInfo.limits.contentGenerations}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoices:</span>
                <span>{usage.invoices || 0}/{tierInfo.limits.invoices === -1 ? '∞' : tierInfo.limits.invoices}</span>
              </div>
              <div className="flex justify-between">
                <span>AI Queries:</span>
                <span>{usage.aiQueries || 0}/{tierInfo.limits.aiQueries === -1 ? '∞' : tierInfo.limits.aiQueries}</span>
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setShowChat(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
          </button>
          
          <div className="flex space-x-2 mb-2">
            <button 
              onClick={handleSettingsClick}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="flex items-center justify-center px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;