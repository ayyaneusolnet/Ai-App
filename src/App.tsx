import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import MarketingTools from './components/MarketingTools';
import FinanceTools from './components/FinanceTools';
import StrategyTools from './components/StrategyTools';
import OperationsTools from './components/OperationsTools';
import ConversationalInterface from './components/ConversationalInterface';
import SettingsModal from './components/SettingsModal';
import PortfolioBuilder from './components/PortfolioBuilder';
import CRMDashboard from './components/CRMDashboard';
import PostMaker from './components/PostMaker';
import AccountingTools from './components/AccountingTools';
import { database } from './lib/database';
import { emailService, auth, isDemoMode } from './lib/supabase';
import { Menu } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
    
    // Listen for settings modal
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('openSettings', handleOpenSettings);
    
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    
    try {
      // Check for existing user session
      const { data: sessionData } = await auth.getCurrentSession();
      
      if (sessionData?.session?.user) {
        const userData = sessionData.session.user;
        
        // Get user profile from database
        const { data: profile } = await database.getCurrentUser();
        
        if (profile) {
          setUser(profile);
          setCurrentPage('dashboard');
        } else {
          // Create user profile if it doesn't exist
          const newUser = {
            id: userData.id,
            name: userData.user_metadata?.name || userData.email?.split('@')[0] || 'User',
            email: userData.email || '',
            tier: 'free'
          };
          
          setUser(newUser);
          setCurrentPage('dashboard');
        }
      } else {
        // Check localStorage for demo user
        const savedUser = localStorage.getItem('aiBusinessUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setCurrentPage('dashboard');
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
    }
    
    setLoading(false);
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('aiBusinessUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
    
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(userData.email, userData.name);
    } catch (error) {
      console.error('Welcome email error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('aiBusinessUser');
    localStorage.removeItem('userTier');
    localStorage.removeItem('userTierUsage');
    setCurrentPage('landing');
    setActiveSection('dashboard');
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard setActiveSection={setActiveSection} user={user} />;
      case 'marketing':
        return <MarketingTools />;
      case 'finance':
        return <FinanceTools />;
      case 'strategy':
        return <StrategyTools />;
      case 'operations':
        return <OperationsTools />;
      case 'portfolio':
        return <PortfolioBuilder user={user} />;
      case 'crm':
        return <CRMDashboard />;
      case 'posts':
        return <PostMaker />;
      case 'accounting':
        return <AccountingTools />;
      default:
        return <Dashboard setActiveSection={setActiveSection} user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading your AI Business Assistant...</p>
          {isDemoMode && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              Running in demo mode - Connect Supabase for full functionality
            </p>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'landing') {
    return (
      <ThemeProvider>
        <LandingPage onGetStarted={() => setCurrentPage('auth')} />
      </ThemeProvider>
    );
  }

  if (currentPage === 'auth') {
    return (
      <ThemeProvider>
        <AuthPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700"
        >
          <Menu className="w-6 h-6 text-slate-600 dark:text-gray-300" />
        </button>
        
        <div className="flex min-h-screen">
          <Sidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            setShowChat={setShowChat}
            user={user}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <main className="flex-1 lg:ml-64 min-h-screen">
            <div className="p-4 md:p-8 pt-20 lg:pt-8">
              {renderContent()}
            </div>
          </main>
        </div>
        
        {showChat && (
          <ConversationalInterface 
            onClose={() => setShowChat(false)}
            user={user}
          />
        )}
        
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            user={user}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;