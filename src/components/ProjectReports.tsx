import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { database } from '../lib/database';

const ProjectReports: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    
    // Simulate project data - in real app, this would come from database
    const mockProjects = [
      {
        id: '1',
        name: 'Website Redesign',
        status: 'in-progress',
        startDate: '2024-01-01',
        endDate: '2024-03-01',
        budget: 15000,
        spent: 8500,
        tasks: 25,
        completedTasks: 18,
        teamMembers: 4,
        progress: 72
      },
      {
        id: '2',
        name: 'Mobile App Development',
        status: 'completed',
        startDate: '2023-10-01',
        endDate: '2024-01-15',
        budget: 50000,
        spent: 48000,
        tasks: 45,
        completedTasks: 45,
        teamMembers: 6,
        progress: 100
      },
      {
        id: '3',
        name: 'Marketing Campaign Q1',
        status: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        budget: 25000,
        spent: 2000,
        tasks: 15,
        completedTasks: 3,
        teamMembers: 3,
        progress: 20
      }
    ];
    
    setProjects(mockProjects);
    setSelectedProject(mockProjects[0]);
    setLoading(false);
  };

  const generateReport = () => {
    if (!selectedProject) return;

    const reportData = {
      project: selectedProject,
      reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalBudget: selectedProject.budget,
        totalSpent: selectedProject.spent,
        budgetUtilization: (selectedProject.spent / selectedProject.budget) * 100,
        tasksCompleted: selectedProject.completedTasks,
        totalTasks: selectedProject.tasks,
        completionRate: (selectedProject.completedTasks / selectedProject.tasks) * 100,
        teamSize: selectedProject.teamMembers,
        projectDuration: calculateProjectDuration(selectedProject),
        status: selectedProject.status
      },
      recommendations: generateRecommendations(selectedProject)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-report-${selectedProject.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateProjectDuration = (project: any) => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateRecommendations = (project: any) => {
    const recommendations = [];
    
    const budgetUtilization = (project.spent / project.budget) * 100;
    const completionRate = (project.completedTasks / project.tasks) * 100;
    
    if (budgetUtilization > 90 && completionRate < 90) {
      recommendations.push('Budget is nearly exhausted while project is incomplete. Consider budget reallocation or scope adjustment.');
    }
    
    if (completionRate > 80 && project.status === 'in-progress') {
      recommendations.push('Project is nearing completion. Begin planning for project closure and handover activities.');
    }
    
    if (budgetUtilization < 50 && completionRate > 70) {
      recommendations.push('Project is ahead of budget. Consider investing in quality improvements or additional features.');
    }
    
    if (project.teamMembers > 5) {
      recommendations.push('Large team size detected. Ensure proper communication channels and coordination mechanisms are in place.');
    }
    
    return recommendations;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'on-hold': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderSummaryReport = () => {
    if (!selectedProject) return null;

    const budgetUtilization = (selectedProject.spent / selectedProject.budget) * 100;
    const completionRate = (selectedProject.completedTasks / selectedProject.tasks) * 100;
    const recommendations = generateRecommendations(selectedProject);

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedProject.progress}%</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{budgetUtilization.toFixed(1)}%</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">Budget Used</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  {selectedProject.completedTasks}/{selectedProject.tasks}
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-400">Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedProject.teamMembers}</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">Team Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-6 border dark:border-gray-600">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Project Progress</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-gray-400">Overall Progress</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{selectedProject.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${selectedProject.progress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-gray-400">Budget Utilization</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{budgetUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    budgetUtilization > 90 ? 'bg-red-500' : budgetUtilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-gray-400">Task Completion</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-6 border dark:border-gray-600">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Financial Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                ${selectedProject.budget.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Total Budget</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ${selectedProject.spent.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Amount Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${(selectedProject.budget - selectedProject.spent).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Remaining Budget</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-yellow-700 dark:text-yellow-400 text-sm">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Project Reports</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Generate comprehensive project reports and insights</p>
        </div>
        <button
          onClick={generateReport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="summary">Project Summary</option>
              <option value="financial">Financial Report</option>
              <option value="progress">Progress Report</option>
              <option value="team">Team Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      {selectedProject && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{selectedProject.name}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status.replace('-', ' ')}
                </span>
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  {selectedProject.startDate} - {selectedProject.endDate}
                </span>
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  {calculateProjectDuration(selectedProject)} days
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedProject.progress}%</p>
              <p className="text-sm text-slate-600 dark:text-gray-400">Complete</p>
            </div>
          </div>

          {renderSummaryReport()}
        </div>
      )}
    </div>
  );
};

export default ProjectReports;