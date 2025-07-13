import React from 'react';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Users,
  ArrowUpRight,
  Calendar,
  FileText,
  Zap,
  Calculator
} from 'lucide-react';
import { database } from '../lib/database';
import UsageDashboard from './UsageDashboard';

interface DashboardProps {
  setActiveSection: (section: string) => void;
  user: { id: string; name: string; email: string; avatar?: string } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection, user }) => {
  const [stats, setStats] = useState([
    { label: 'Monthly Revenue', value: '$0', change: '+0%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Campaigns', value: '0', change: '+0', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Team Members', value: '0', change: '+0', icon: Users, color: 'text-purple-600' },
    { label: 'Tasks Completed', value: '0', change: '+0', icon: BarChart3, color: 'text-orange-600' },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    console.log('📊 Loading dashboard data for user:', user?.id);
    
    try {
      // Load real-time stats
      const statsResult = await database.getStats(user?.id);
      console.log('📈 Stats result:', statsResult);
      
      if (statsResult.data) {
        const data = statsResult.data;
        console.log('📊 Dashboard stats:', data);
        setStats([
          { 
            label: 'Monthly Revenue', 
            value: `$${data.revenue.toLocaleString()}`, 
            change: '+12%', 
            icon: DollarSign, 
            color: 'text-green-600' 
          },
          { 
            label: 'Active Campaigns', 
            value: data.campaigns.toString(), 
            change: `+${Math.max(0, data.campaigns - 2)}`, 
            icon: TrendingUp, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Team Members', 
            value: (data.team_members || 1).toString(), 
            change: '+0', 
            icon: Users, 
            color: 'text-purple-600' 
          },
          { 
            label: 'Tasks Completed', 
            value: data.tasks.toString(), 
            change: `+${Math.max(0, data.tasks - 5)}`, 
            icon: BarChart3, 
            color: 'text-orange-600' 
          },
        ]);
      }

      // Load recent activity
      const [invoicesResult, campaignsResult, tasksResult] = await Promise.all([
        database.getInvoices(),
        database.getCampaigns(),
        database.getTasks()
      ]);

      const activities = [];
      
      if (invoicesResult.data) {
        invoicesResult.data.slice(0, 2).forEach(invoice => {
          activities.push({
            type: 'Finance',
            action: `Invoice ${invoice.invoice_number} ${invoice.status === 'paid' ? 'paid' : 'created'}`,
            time: new Date(invoice.created_at).toLocaleDateString()
          });
        });
      }

      if (campaignsResult.data) {
        campaignsResult.data.slice(0, 2).forEach(campaign => {
          activities.push({
            type: 'Marketing',
            action: `${campaign.title} created`,
            time: new Date(campaign.created_at).toLocaleDateString()
          });
        });
      }

      if (tasksResult.data) {
        tasksResult.data.slice(0, 2).forEach(task => {
          activities.push({
            type: 'Operations',
            action: `Task "${task.title}" ${task.status}`,
            time: new Date(task.created_at || Date.now()).toLocaleDateString()
          });
        });
      }

      setRecentActivity(activities.slice(0, 4));
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Generate Ad Copy', 
      description: 'Create compelling marketing content',
      icon: FileText,
      action: () => setActiveSection('marketing'),
      color: 'bg-blue-500'
    },
    { 
      title: 'Create Invoice', 
      description: 'Generate professional invoices',
      icon: DollarSign,
      action: () => setActiveSection('finance'),
      color: 'bg-green-500'
    },
    { 
      title: 'Create Social Posts', 
      description: 'AI-powered social media content',
      icon: FileText,
      action: () => setActiveSection('posts'),
      color: 'bg-purple-500'
    },
    { 
      title: 'Track Expenses', 
      description: 'AI accounting insights',
      icon: Calculator,
      action: () => setActiveSection('accounting'),
      color: 'bg-orange-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Your centralized command center for AI-powered business tools</p>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 dark:text-gray-400">
          <Calendar className="w-5 h-5" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-slate-800 dark:text-white mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Dashboard */}
      <UsageDashboard />
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 dark:text-gray-400 mt-2">Loading activity...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{activity.action}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{activity.type}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-gray-400">{activity.time}</span>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-gray-400">No recent activity</p>
                <p className="text-sm text-slate-500 dark:text-gray-500">Start using the tools to see activity here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;