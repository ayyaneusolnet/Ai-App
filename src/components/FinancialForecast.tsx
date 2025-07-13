import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign,
  Plus,
  Download,
  Target,
  AlertCircle
} from 'lucide-react';

interface HistoricalData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ForecastData {
  month: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  confidence: number;
}

const FinancialForecast: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([
    { month: '2024-01', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: '2024-02', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: '2024-03', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: '2024-04', revenue: 49000, expenses: 34000, profit: 15000 },
    { month: '2024-05', revenue: 55000, expenses: 36000, profit: 19000 },
    { month: '2024-06', revenue: 58000, expenses: 37000, profit: 21000 }
  ]);

  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [newDataEntry, setNewDataEntry] = useState({
    month: '',
    revenue: 0,
    expenses: 0
  });
  const [forecastPeriod, setForecastPeriod] = useState(6);

  const generateForecast = () => {
    if (historicalData.length < 3) {
      alert('Need at least 3 months of historical data to generate forecast');
      return;
    }

    const forecast: ForecastData[] = [];
    const recentData = historicalData.slice(-3);
    
    // Calculate growth rates
    const revenueGrowth = calculateGrowthRate(recentData.map(d => d.revenue));
    const expenseGrowth = calculateGrowthRate(recentData.map(d => d.expenses));
    
    const lastMonth = new Date(historicalData[historicalData.length - 1].month + '-01');
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const forecastMonth = new Date(lastMonth);
      forecastMonth.setMonth(forecastMonth.getMonth() + i);
      
      const lastRevenue = historicalData[historicalData.length - 1].revenue;
      const lastExpenses = historicalData[historicalData.length - 1].expenses;
      
      const projectedRevenue = Math.round(lastRevenue * Math.pow(1 + revenueGrowth, i));
      const projectedExpenses = Math.round(lastExpenses * Math.pow(1 + expenseGrowth, i));
      const projectedProfit = projectedRevenue - projectedExpenses;
      
      // Calculate confidence based on data consistency
      const confidence = Math.max(60, 95 - (i * 5));
      
      forecast.push({
        month: forecastMonth.toISOString().slice(0, 7),
        projectedRevenue,
        projectedExpenses,
        projectedProfit,
        confidence
      });
    }
    
    setForecastData(forecast);
  };

  const calculateGrowthRate = (values: number[]) => {
    if (values.length < 2) return 0;
    
    let totalGrowth = 0;
    for (let i = 1; i < values.length; i++) {
      const growth = (values[i] - values[i-1]) / values[i-1];
      totalGrowth += growth;
    }
    
    return totalGrowth / (values.length - 1);
  };

  const addHistoricalData = () => {
    if (!newDataEntry.month || !newDataEntry.revenue || !newDataEntry.expenses) {
      alert('Please fill in all fields');
      return;
    }

    const profit = newDataEntry.revenue - newDataEntry.expenses;
    const newEntry: HistoricalData = {
      ...newDataEntry,
      profit
    };

    setHistoricalData(prev => [...prev, newEntry].sort((a, b) => a.month.localeCompare(b.month)));
    setNewDataEntry({ month: '', revenue: 0, expenses: 0 });
  };

  const exportForecast = () => {
    const exportData = {
      historicalData,
      forecastData,
      generatedAt: new Date().toISOString(),
      forecastPeriod
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-forecast-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Financial Forecast</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Predict future financial performance based on historical data</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateForecast}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Generate Forecast</span>
          </button>
          {forecastData.length > 0 && (
            <button
              onClick={exportForecast}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Historical Data */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Add Historical Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Month
            </label>
            <input
              type="month"
              value={newDataEntry.month}
              onChange={(e) => setNewDataEntry(prev => ({ ...prev, month: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Revenue
            </label>
            <input
              type="number"
              value={newDataEntry.revenue}
              onChange={(e) => setNewDataEntry(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Expenses
            </label>
            <input
              type="number"
              value={newDataEntry.expenses}
              onChange={(e) => setNewDataEntry(prev => ({ ...prev, expenses: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addHistoricalData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Forecast Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Forecast Period (months)
            </label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-slate-600 dark:text-gray-400">
              <p>Historical data points: {historicalData.length}</p>
              <p>Minimum required: 3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Historical Data</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Month</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Expenses</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Profit</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((data, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-slate-800 dark:text-white">{data.month}</td>
                  <td className="py-3 px-4 text-right text-green-600">${data.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">${data.expenses.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-right font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${data.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Results */}
      {forecastData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Forecast Results</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Projected Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Projected Expenses</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Projected Profit</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-gray-300">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((data, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-slate-800 dark:text-white">{data.month}</td>
                    <td className="py-3 px-4 text-right text-green-600">${data.projectedRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">${data.projectedExpenses.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-medium ${data.projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${data.projectedProfit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(data.confidence)} bg-opacity-10`}>
                        {data.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Forecast Summary */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Forecast Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 dark:text-blue-400">Total Projected Revenue:</p>
                <p className="font-bold text-blue-800 dark:text-blue-300">
                  ${forecastData.reduce((sum, d) => sum + d.projectedRevenue, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-400">Total Projected Expenses:</p>
                <p className="font-bold text-blue-800 dark:text-blue-300">
                  ${forecastData.reduce((sum, d) => sum + d.projectedExpenses, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-400">Total Projected Profit:</p>
                <p className="font-bold text-blue-800 dark:text-blue-300">
                  ${forecastData.reduce((sum, d) => sum + d.projectedProfit, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">AI Recommendations</h3>
                <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                  <li>• Monitor actual vs projected performance monthly</li>
                  <li>• Consider seasonal variations in your business</li>
                  <li>• Update forecast as new data becomes available</li>
                  <li>• Plan for contingencies if confidence levels are low</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialForecast;