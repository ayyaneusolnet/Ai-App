import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Check, 
  X, 
  Eye, 
  Crown,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { database, dbFunctions } from '../lib/database';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    console.log('👑 Loading admin data...');
    
    try {
      const [usersResult, paymentsResult] = await Promise.all([
        database.getAllUsers(),
        database.getAllPayments()
      ]);
      
      console.log('👥 Users loaded:', usersResult.data?.length || 0);
      console.log('💳 Payments loaded:', paymentsResult.data?.length || 0);
      
      if (usersResult.data) {
        setUsers(usersResult.data);
      }
      
      if (paymentsResult.data) {
        setPayments(paymentsResult.data);
      }
    } catch (error) {
      console.error('❌ Admin data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string, userId: string, tier: string) => {
    try {
      console.log('✅ Approving payment:', { paymentId, userId, tier });
      
      // Update payment status
      await database.updatePaymentStatus(paymentId, 'completed');
      
      // Update user tier
      await dbFunctions.updateUserTier(userId, tier);
      
      // Refresh data
      loadAdminData();
      
      alert('Payment approved and user tier updated successfully!');
    } catch (error) {
      console.error('❌ Payment approval error:', error);
      alert('Error approving payment. Please try again.');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      console.log('❌ Rejecting payment:', paymentId);
      await database.updatePaymentStatus(paymentId, 'failed');
      loadAdminData();
      alert('Payment rejected successfully!');
    } catch (error) {
      console.error('❌ Payment rejection error:', error);
      alert('Error rejecting payment. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'starter': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'professional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-gray-400">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Panel</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-1">Manage users, payments, and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{users.length}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{payments.length}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Payments</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {payments.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {users.filter(u => u.tier === 'professional').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Pro Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="border-b border-slate-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              Payment Verification
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users or payments..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {activeTab === 'payments' && (
              <div className="flex space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-slate-800 dark:text-white">{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTierColor(user.tier || 'free')}`}>
                          {user.tier || 'free'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Tier</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {payment.users?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-gray-400">
                            {payment.users?.email || 'No email'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">
                        ${payment.amount}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTierColor(payment.tier)}`}>
                          {payment.tier}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {payment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovePayment(payment.id, payment.user_id, payment.tier)}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Approve Payment"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Reject Payment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded ml-2">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;