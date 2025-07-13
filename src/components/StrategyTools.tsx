import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const StrategyTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('growth');

  const tools = [
    { id: 'growth', name: 'Growth Strategy', icon: TrendingUp, description: 'Develop growth plans' },
    { id: 'competitive', name: 'Competitive Analysis', icon: Target, description: 'Analyze competitors' },
    { id: 'market', name: 'Market Research', icon: Users, description: 'Research market trends' },
    { id: 'innovation', name: 'Innovation Hub', icon: Lightbulb, description: 'Generate business ideas' },
  ];

  const growthPlan = [
    { 
      phase: 'Phase 1: Foundation', 
      duration: '0-3 months',
      tasks: ['Market research', 'Product refinement', 'Team building'],
      status: 'completed'
    },
    { 
      phase: 'Phase 2: Launch', 
      duration: '3-6 months',
      tasks: ['Marketing campaign', 'Customer acquisition', 'Feedback collection'],
      status: 'current'
    },
    { 
      phase: 'Phase 3: Scale', 
      duration: '6-12 months',
      tasks: ['Expand market reach', 'Optimize operations', 'Strategic partnerships'],
      status: 'upcoming'
    },
  ];

  const competitiveAnalysis = [
    { 
      competitor: 'Competitor A', 
      strength: 'Strong brand recognition',
      weakness: 'Limited product range',
      opportunity: 'Expand into new markets',
      threat: 'Price competition'
    },
    { 
      competitor: 'Competitor B', 
      strength: 'Low pricing',
      weakness: 'Poor customer service',
      opportunity: 'Premium positioning',
      threat: 'Technology disruption'
    },
  ];

  const renderGrowthStrategy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {growthPlan.map((phase, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">{phase.phase}</h3>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                phase.status === 'completed' ? 'bg-green-500' :
                phase.status === 'current' ? 'bg-blue-500' :
                'bg-slate-300'
              }`}>
                {phase.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                {phase.status === 'current' && <AlertCircle className="w-4 h-4 text-white" />}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">{phase.duration}</p>
            <ul className="space-y-2">
              {phase.tasks.map((task, taskIndex) => (
                <li key={taskIndex} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-sm text-slate-700">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">AI Recommendation</h3>
        <p className="text-blue-700">
          Based on your current progress, consider focusing on customer retention strategies 
          and exploring partnerships with complementary businesses to accelerate growth.
        </p>
      </div>
    </div>
  );

  const renderCompetitiveAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitiveAnalysis.map((competitor, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-6 border">
            <h3 className="font-semibold text-slate-800 mb-4">{competitor.competitor}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm text-slate-700">Strength</p>
                  <p className="text-sm text-slate-600">{competitor.strength}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm text-slate-700">Weakness</p>
                  <p className="text-sm text-slate-600">{competitor.weakness}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm text-slate-700">Opportunity</p>
                  <p className="text-sm text-slate-600">{competitor.opportunity}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm text-slate-700">Threat</p>
                  <p className="text-sm text-slate-600">{competitor.threat}</p>
                </div>
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
        <h1 className="text-3xl font-bold text-slate-800">Strategy Tools</h1>
        <p className="text-slate-600 mt-1">Plan and execute your business strategy with AI insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tool Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Strategy Tools</h2>
          <div className="space-y-3">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedTool === tool.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
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
          
          {selectedTool === 'growth' && renderGrowthStrategy()}
          {selectedTool === 'competitive' && renderCompetitiveAnalysis()}
          
          {selectedTool === 'market' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Market research tool coming soon...</p>
            </div>
          )}
          
          {selectedTool === 'innovation' && (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Innovation hub coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyTools;