import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  Settings,
  Plus,
  MoreVertical,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { database } from '../lib/database';
import TaskModal from './TaskModal';

const OperationsTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const { data, error } = await database.getTasks();
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const handleCreateTask = async (taskData: any) => {
    const { data, error } = await database.createTask(taskData);
    if (!error && data) {
      setTasks(prev => [data, ...prev]);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    const { data, error } = await database.updateTask(editingTask.id, taskData);
    if (!error && data) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? data : task));
      setEditingTask(null);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      // In a real app, you'd call database.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };
  const tools = [
    { id: 'tasks', name: 'Task Management', icon: CheckSquare, description: 'Organize and track tasks' },
    { id: 'workflow', name: 'Workflow Optimization', icon: BarChart3, description: 'Streamline processes' },
    { id: 'schedule', name: 'Schedule Management', icon: Clock, description: 'Manage time effectively' },
    { id: 'automation', name: 'Process Automation', icon: Settings, description: 'Automate workflows' },
  ];

  const workflows = [
    { 
      name: 'Client Onboarding', 
      steps: 5, 
      completedSteps: 3, 
      efficiency: 85,
      description: 'Process for onboarding new clients'
    },
    { 
      name: 'Invoice Processing', 
      steps: 4, 
      completedSteps: 4, 
      efficiency: 92,
      description: 'Automated invoice generation and processing'
    },
    { 
      name: 'Content Creation', 
      steps: 6, 
      completedSteps: 2, 
      efficiency: 78,
      description: 'Content planning and creation workflow'
    },
  ];

  const renderTaskManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Task Overview</h3>
        <button 
          onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800">Total Tasks</h4>
          <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-green-800">Completed</h4>
          <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-medium text-yellow-800">In Progress</h4>
          <p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-medium text-red-800">Pending</h4>
          <p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 mt-2">Loading tasks...</p>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-6 border">
          <h4 className="font-medium text-slate-800 mb-4">Recent Tasks</h4>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-slate-300'
                  }`}></div>
                  <div>
                    <h5 className="font-medium text-slate-800">{task.title}</h5>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </span>
                      <span>Due: {task.due_date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditTask(task)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  );

  const renderWorkflowOptimization = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">Workflow Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflows.map((workflow, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-6 border">
            <h4 className="font-medium text-slate-800 mb-2">{workflow.name}</h4>
            <p className="text-sm text-slate-600 mb-4">{workflow.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Progress</span>
                <span className="text-sm font-medium text-slate-800">
                  {workflow.completedSteps}/{workflow.steps}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(workflow.completedSteps / workflow.steps) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Efficiency</span>
                <span className="text-sm font-medium text-slate-800">{workflow.efficiency}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${workflow.efficiency}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Operations Tools</h1>
        <p className="text-slate-600 mt-1">Streamline your operations with AI-powered optimization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tool Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Operations Tools</h2>
          <div className="space-y-3">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedTool === tool.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium text-sm">{tool.name}</h3>
                      <p className="text-xs text-slate-600">{tool.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Content */}
        <div className="lg:col-span-3 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {tools.find(t => t.id === selectedTool)?.name}
          </h2>
          
          {selectedTool === 'tasks' && renderTaskManagement()}
          {selectedTool === 'workflow' && renderWorkflowOptimization()}
          
          {selectedTool === 'schedule' && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Schedule management tool coming soon...</p>
            </div>
          )}
          
          {selectedTool === 'automation' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Process automation tool coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsTools;