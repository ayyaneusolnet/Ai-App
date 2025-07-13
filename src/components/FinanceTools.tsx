import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  PieChart, 
  TrendingUp,
  DollarSign,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { database } from '../lib/database';
import InvoiceGenerator from './InvoiceGenerator';

const FinanceTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('invoice');
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taxSettings, setTaxSettings] = useState({
    defaultRate: 10,
    customRates: [
      { name: 'GST', rate: 17 },
      { name: 'Sales Tax', rate: 16 },
      { name: 'Service Tax', rate: 5 }
    ]
  });
  const [budgetData, setBudgetData] = useState({
    totalBudget: 10000,
    categories: [
      { name: 'Marketing', allocated: 3000, spent: 2100 },
      { name: 'Operations', allocated: 4000, spent: 3200 },
      { name: 'Technology', allocated: 2000, spent: 1800 },
      { name: 'Miscellaneous', allocated: 1000, spent: 400 }
    ]
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const { data, error } = await database.getInvoices();
    if (!error && data) {
      setSavedInvoices(data);
    }
    setLoading(false);
  };

  const handleSaveInvoice = async (invoice: any) => {
    console.log('💾 Saving invoice to database:', invoice);
    const { data, error } = await database.createInvoice(invoice);
    console.log('📊 Invoice save result:', { data, error });
    if (!error && data) {
      setSavedInvoices(prev => [data, ...prev]);
      console.log('✅ Invoice saved successfully');
      alert('Invoice saved successfully!');
      console.error('❌ Failed to save invoice:', error);
      alert(`Failed to save invoice: ${error?.message || 'Please try again.'}`);
    }
  };

  const exportAllInvoices = () => {
    const csvContent = [
      ['Invoice Number', 'Client Name', 'Amount', 'Status', 'Created Date', 'Due Date'],
      ...savedInvoices.map(inv => [
        inv.invoice_number,
        inv.client_name,
        inv.amount,
        inv.status,
        new Date(inv.created_at).toLocaleDateString(),
        inv.due_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const tools = [
    { id: 'invoice', name: 'Invoice Generator', icon: FileText, description: 'Create professional invoices' },
    { id: 'budget', name: 'Budget Planner', icon: Calculator, description: 'Plan and track budgets' },
    { id: 'forecast', name: 'Financial Forecast', icon: TrendingUp, description: 'Predict financial trends' },
    { id: 'analysis', name: 'Expense Analysis', icon: PieChart, description: 'Analyze spending patterns' },
  ];

  const renderBudgetPlanner = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6 border">
          <h3 className="font-semibold text-slate-800 mb-4">Budget Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Budget:</span>
              <span className="font-bold text-slate-800">${budgetData.totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Spent:</span>
              <span className="font-bold text-red-600">
                ${budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Remaining:</span>
              <span className="font-bold text-green-600">
                ${(budgetData.totalBudget - budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-6 border">
          <h3 className="font-semibold text-slate-800 mb-4">Budget Utilization</h3>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ 
                width: `${(budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0) / budgetData.totalBudget) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {((budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0) / budgetData.totalBudget) * 100).toFixed(1)}% of budget used
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-slate-800 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {budgetData.categories.map((category, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-800">{category.name}</span>
                <span className="text-sm text-slate-600">
                  ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (category.spent / category.allocated) > 0.9 ? 'bg-red-500' :
                    (category.spent / category.allocated) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((category.spent / category.allocated) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-500">
                  {((category.spent / category.allocated) * 100).toFixed(1)}% used
                </span>
                <span className="text-xs text-slate-500">
                  ${(category.allocated - category.spent).toLocaleString()} remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Finance Tools</h1>
        <p className="text-slate-600 mt-1">Manage your finances with AI-powered tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tool Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Finance Tools</h2>
          <div className="space-y-3">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedTool === tool.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium">{tool.name}</h3>
                      <p className="text-sm text-slate-600">{tool.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Content */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {tools.find(t => t.id === selectedTool)?.name}
          </h2>
          
          {selectedTool === 'invoice' && <InvoiceGenerator onSave={handleSaveInvoice} />}
          {selectedTool === 'budget' && renderBudgetPlanner()}
          
          {selectedTool === 'forecast' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Financial forecasting tool coming soon...</p>
            </div>
          )}
          
          {selectedTool === 'analysis' && (
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Expense analysis tool coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">All Invoices</h2>
          <button 
            onClick={() => exportAllInvoices()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 mt-2">Loading invoices...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Invoice ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{invoice.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-600">{invoice.client_name}</td>
                    <td className="py-3 px-4 text-slate-600">${invoice.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{invoice.due_date}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert('Invoice view feature coming soon!')}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => alert('Invoice edit feature coming soon!')}
                          className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this invoice?')) {
                              setSavedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
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
    </div>
  );
};

export default FinanceTools;