import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from 'lucide-react';
import { database } from '../lib/database';

const CRMDashboard: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await database.getLeads();
    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  };

  const handleAddLead = async (leadData: any) => {
    if (!leadData.name || !leadData.email) {
      alert('Please fill in name and email fields');
      return;
    }
    
    console.log('🔄 Adding lead to database:', leadData);
    const { data, error } = await database.createLead(leadData);
    console.log('📊 Lead creation result:', { data, error });
    if (!error && data) {
      setLeads(prev => [data, ...prev]);
      setShowAddModal(false);
      console.log('✅ Lead added successfully');
      alert('Lead added successfully!');
    } else {
      console.error('❌ Failed to add lead:', error);
      alert(`Failed to add lead: ${error?.message || 'Please try again.'}`);
    }
  };

  const handleUpdateLead = async (leadData: any) => {
    if (!editingLead) return;
    
    const { data, error } = await database.updateLead(editingLead.id, leadData);
    if (!error && data) {
      setLeads(prev => prev.map(lead => lead.id === editingLead.id ? data : lead));
      setEditingLead(null);
      setShowAddModal(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'converted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const LeadModal = ({ isOpen, onClose, onSave, lead }: any) => {
    const [formData, setFormData] = useState({
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      company: lead?.company || '',
      source: lead?.source || 'website',
      status: lead?.status || 'new',
      notes: lead?.notes || ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6 border-b border-slate-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              {lead ? 'Edit Lead' : 'Add New Lead'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="email">Email Campaign</option>
                  <option value="phone">Phone Call</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
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
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes about this lead..."
              />
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
                {lead ? 'Update Lead' : 'Add Lead'}
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">CRM Dashboard</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Manage your leads and customer relationships</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Lead</span>
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
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{leads.length}</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Leads</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {leads.filter(l => l.status === 'new').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">New Leads</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {leads.filter(l => l.status === 'qualified').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Qualified</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {leads.filter(l => l.status === 'converted').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Converted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social">Social Media</option>
              <option value="email">Email Campaign</option>
              <option value="phone">Phone Call</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-gray-400">Loading leads...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Company</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Contact</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Source</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{lead.name}</p>
                        {lead.notes && (
                          <p className="text-sm text-slate-600 dark:text-gray-400 truncate max-w-xs">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-gray-400">{lead.company}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-3 h-3" />
                          <span className="text-slate-600 dark:text-gray-400">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-3 h-3" />
                            <span className="text-slate-600 dark:text-gray-400">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-slate-600 dark:text-gray-400">{lead.source}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setShowAddModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeadModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingLead(null);
        }}
        onSave={editingLead ? handleUpdateLead : handleAddLead}
        lead={editingLead}
      />
    </div>
  );
};

export default CRMDashboard;