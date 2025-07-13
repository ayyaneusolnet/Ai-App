import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Payment Received',
      message: 'Payment of $99.99 for Pro plan has been confirmed.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Usage Limit Warning',
      message: 'You have used 90% of your monthly content generation limit.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New Team Member',
      message: 'Sarah Johnson has joined your team.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Payment Failed',
      message: 'Your payment method was declined. Please update your billing information.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      action: {
        label: 'Update Payment',
        onClick: () => console.log('Update payment clicked')
      }
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications for demo
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'New Activity',
          message: 'Something happened in your account.',
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-white text-sm">
                                {notification.title}
                              </p>
                              <p className="text-slate-600 dark:text-gray-400 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-slate-500 dark:text-gray-500 text-xs mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-gray-600 rounded"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-slate-500" />
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-gray-600 rounded"
                                title="Remove"
                              >
                                <X className="w-3 h-3 text-slate-500" />
                              </button>
                            </div>
                          </div>
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-gray-700">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;