import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { database } from '../lib/database';

interface TeamManagementProps {
  user: any;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ user }) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await database.getTeamMembers(user?.id);
    if (!error && data) {
      setTeamMembers(data);
    }
    setLoading(false);
  };

  const handleAddMember = async (memberData: any) => {
    if (!memberData.name || !memberData.email) {
      alert('Please fill in name and email fields');
      return;
    }
    
    console.log('🔄 Adding team member to database:', memberData);
    const { data, error } = await database.addTeamMember(memberData);
    console.log('📊 Team member creation result:', { data, error });
    if (!error && data) {
      setTeamMembers(prev => [...prev, data]);
      setShowAddModal(false);
      console.log('✅ Team member added successfully');
      alert('Team member added successfully!');
    } else {
      console.error('❌ Failed to add team member:', error);
      alert(`Failed to add team member: ${error?.message || 'Please try again.'}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const TeamMemberModal = ({ isOpen, onClose, onSave, member }: any) => {
    const [formData, setFormData] = useState({
      name: member?.name || '',
      email: member?.email || '',
      role: member?.role || 'member',
      permissions: member?.permissions || ['tasks'],
      status: member?.status || 'active'
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const togglePermission = (permission: string) => {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    };

    const availablePermissions = [
      { id: 'tasks', label: 'Task Management' },
      { id: 'campaigns', label: 'Marketing Campaigns' },
      { id: 'invoices', label: 'Invoice Management' },
      { id: 'leads', label: 'CRM & Leads' },
      { id: 'analytics', label: 'Analytics & Reports' },
      { id: 'settings', label: 'Team Settings' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6 border-b border-slate-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              {member ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-gray-300">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {member ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Team Management</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Manage your team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{teamMembers.length}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {teamMembers.filter(m => m.status === 'active').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {teamMembers.filter(m => m.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {teamMembers.filter(m => m.role === 'admin' || m.role === 'manager').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Managers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Team Members</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-gray-400">Loading team members...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{member.name}</h3>
                      <p className="text-slate-600 dark:text-gray-400">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-gray-400">Permissions</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">
                        {member.permissions?.length || 0} assigned
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {member.permissions && member.permissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {member.permissions.map((permission: string) => (
                        <span
                          key={permission}
                          className="px-2 py-1 text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 rounded capitalize"
                        >
                          {permission.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {teamMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-gray-400">No team members yet</p>
                <p className="text-sm text-slate-500 dark:text-gray-500">Add your first team member to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      <TeamMemberModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingMember(null);
        }}
        onSave={handleAddMember}
        member={editingMember}
      />
    </div>
  );
};

export default TeamManagement;