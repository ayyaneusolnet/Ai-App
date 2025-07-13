import React, { useState } from 'react';
import { Brain, ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { auth, isDemoMode } from '../lib/supabase';

interface AuthPageProps {
  onLogin: (user: { id: string; name: string; email: string; avatar?: string }) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await auth.signIn(formData.email, formData.password);
        
        if (error) {
          setErrors({ general: error.message || 'Login failed' });
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          const user = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || formData.email,
            avatar: data.user.user_metadata?.avatar_url
          };
          onLogin(user);
        }
      } else {
        // Sign up
        const { data, error } = await auth.signUp(formData.email, formData.password, {
          name: formData.name
        });
        
        if (error) {
          setErrors({ general: error.message || 'Signup failed' });
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          const user = {
            id: data.user.id,
            name: formData.name,
            email: data.user.email || formData.email,
            avatar: data.user.user_metadata?.avatar_url
          };
          onLogin(user);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrors({ general: error.message || 'Authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    };
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </button>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-600 dark:text-gray-400">
              {isLogin 
                ? 'Sign in to access your AI Business Assistant' 
                : 'Join thousands of businesses transforming with AI'
              }
            </p>
            {isDemoMode && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Demo Mode: Connect Supabase for full functionality
                </p>
              </div>
            )}
          </div>

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Try Demo Account
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400">or continue with email</span>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      errors.name ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <p className="text-slate-600 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-gray-400 mb-4">What you'll get access to:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>AI Marketing Tools</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Smart Finance Management</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span>Strategic Planning</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span>Operations Optimization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;