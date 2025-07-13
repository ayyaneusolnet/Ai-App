import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  AlertTriangle
} from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const [budgets, setBudgets] = useState([
    {
      id: '1',
      name: 'Marketing Budget 2024',
      totalAmount: 50000,
      categories: [
        { name: 'Digital Advertising', allocated: 20000, spent: 15000 },
        { name: 'Content Creation', allocated: 15000, spent: 8000 },
        { name: 'Events & Conferences', allocated: 10000, spent: 12000 },
        { name: 'Tools & Software', allocated: 5000, spent: 3500 }
      ],
      period: 'yearly',
      status: 'active'
    },
    {
      id: '2',
      name: 'Operations Budget Q1',
      totalAmount: 25000,
      categories: [
        { name: 'Office Rent', allocated: 12000, spent: 12000 },
        { name: 'Utilities', allocated: 3000, spent: 2800 },
        { name: 'Supplies', allocated: 5000, spent: 3200 },
        { name: 'Maintenance', allocated: 5000, spent: 1500 }
      ],
      period: 'quarterly',
      status: 'active'
    }
  ]);

  const [selectedBudget, setSelectedBudget] = useState(budgets[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const calculateTotalSpent = (budget: any) => {
    return budget.categories.reduce((sum: number, cat: any) => sum + cat.spent, 0);
  };

  const calculateVariance = (budget: any) => {
    const totalSpent = calculateTotalSpent(budget);
    return budget.totalAmount - totalSpent;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getCategoryStatus = (category: any) => {
    const percentage = (category.spent / category.allocated) * 100;
    if (percentage > 100) return { status: 'over', color: 'bg-red-500' };
    if (percentage > 80) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'good', color: 'bg-green-500' };
  };

  const exportBudgetReport = () => {
    const reportData = {
      budget: selectedBudget,
      totalSpent: calculateTotalSpent(selectedBudget),
      variance: calculateVariance(selectedBudget),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${selectedBudget.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const BudgetCreateModal = ({ isOpen, onClose }: any) => {
    const [formData, setFormData] = useState({
      name: '',
      totalAmount: 0,
      period: 'monthly',
      categories: [{ name: '', allocated: 0 }]
    });

    if (!isOpen) return null;

    const addCategory = () => {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, { name: '', allocated: 0 }]
      }));
    };

    const updateCategory = (index: number, field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newBudget = {
        id: Date.now().toString(),
        ...formData,
        categories: formData.categories.map(cat => ({ ...cat, spent: 0 })),
        status: 'active'
      };
      setBudgets(prev => [...prev, newBudget]);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Create New Budget</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Budget Name
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
                  Total Amount
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Budget Period
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Budget Categories
                </label>
                <button
                  type="button"
                  onClick={addCategory}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Allocated amount"
                      value={category.allocated}
                      onChange={(e) => updateCategory(index, 'allocated', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Budget
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Budget Planner</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Plan, track, and optimize your business budgets</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Budget</span>
          </button>
          <button
            onClick={exportBudgetReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Budget Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Select Budget</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <button
              key={budget.id}
              onClick={() => setSelectedBudget(budget)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedBudget.id === budget.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-gray-600 hover:border-slate-300'
              }`}
            >
              <h3 className="font-medium text-slate-800 dark:text-white">{budget.name}</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 capitalize">{budget.period}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-2">
                ${budget.totalAmount.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                ${selectedBudget.totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Budget</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                ${calculateTotalSpent(selectedBudget).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              calculateVariance(selectedBudget) >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {calculateVariance(selectedBudget) >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold ${getVarianceColor(calculateVariance(selectedBudget))}`}>
                ${Math.abs(calculateVariance(selectedBudget)).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                {calculateVariance(selectedBudget) >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedBudget.categories.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Category Breakdown</h2>
        
        <div className="space-y-4">
          {selectedBudget.categories.map((category, index) => {
            const status = getCategoryStatus(category);
            const percentage = Math.min((category.spent / category.allocated) * 100, 100);
            
            return (
              <div key={index} className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-slate-800 dark:text-white">{category.name}</h3>
                    {status.status === 'over' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${status.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500 dark:text-gray-500">
                    ${(category.allocated - category.spent).toLocaleString()} remaining
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BudgetCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default BudgetPlanner;