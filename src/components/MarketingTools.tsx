import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Mail, 
  PenTool, 
  Share2, 
  Target,
  Zap,
  Copy,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react';
import { database } from '../lib/database';
import { deepseekAI } from '../lib/deepseek';
import { TierManager } from '../lib/tiers';
import TierUpgradeModal from './TierUpgradeModal';

const MarketingTools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('ad-copy');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    targetAudience: '',
    product: '',
    benefits: '',
    tone: 'professional',
    platform: 'general'
  });
  const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Reset form when tool changes
  useEffect(() => {
    console.log('🔄 Tool changed to:', selectedTool);
    setFormData({
      targetAudience: '',
      product: '',
      benefits: '',
      tone: 'professional',
      platform: 'general'
    });
    setGeneratedContent('');
  }, [selectedTool]);

  const loadCampaigns = async () => {
    setLoading(true);
    const { data, error } = await database.getCampaigns();
    if (!error && data) {
      setSavedCampaigns(data);
    }
    setLoading(false);
  };

  const tools = [
    { id: 'ad-copy', name: 'Ad Copy Generator', icon: PenTool, description: 'Create compelling advertisements' },
    { id: 'email', name: 'Email Campaigns', icon: Mail, description: 'Design effective email marketing' },
    { id: 'social', name: 'Social Media', icon: Share2, description: 'Generate social media content' },
    { id: 'landing', name: 'Landing Pages', icon: FileText, description: 'Create high-converting pages' },
  ];

  const handleGenerate = async () => {
    if (!formData.targetAudience || !formData.product) {
      alert('Please fill in target audience and product/service fields');
      return;
    }

    // Check tier limits
    if (!TierManager.canUseFeature('contentGenerations')) {
      setShowUpgradeModal(true);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const enhancedPrompt = `Create high-converting ${selectedTool} content for:
Target Audience: ${formData.targetAudience}
Product/Service: ${formData.product}
Key Benefits: ${formData.benefits}
Tone: ${formData.tone}
Platform: ${formData.platform}

Requirements:
- Include compelling headlines and CTAs
- Focus on benefits over features
- Use persuasive language appropriate for ${formData.tone} tone
- Optimize for ${formData.platform} platform
- Include relevant hashtags if social media
- Make it conversion-focused and actionable`;

      console.log('Generating content with prompt:', enhancedPrompt);
      const content = await deepseekAI.generateContent(enhancedPrompt, selectedTool);
      setGeneratedContent(content);
      
      // Update usage
      TierManager.updateUsage('contentGenerations');
    } catch (error) {
      console.error('Content generation error:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCampaign = async () => {
    if (!generatedContent) {
      alert('Please generate content first');
      return;
    }
    
    // Check tier limits
    if (!TierManager.canUseFeature('campaigns')) {
      setShowUpgradeModal(true);
      return;
    }
    
    const campaignData = {
      title: `${tools.find(t => t.id === selectedTool)?.name} - ${formData.product}`,
      type: selectedTool,
      content: generatedContent,
      target_audience: formData.targetAudience,
      product: formData.product,
      benefits: formData.benefits,
      tone: formData.tone,
      platform: formData.platform
    };
    
    console.log('Saving campaign:', campaignData);
    const { data, error } = await database.createCampaign(campaignData);
    if (!error && data) {
      setSavedCampaigns(prev => [data, ...prev]);
      alert('Campaign saved successfully!');
      TierManager.updateUsage('campaigns');
    } else {
      console.error('Save campaign error:', error);
      alert('Error saving campaign. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  const exportContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTool}-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    console.log('🔄 Resetting form');
    setFormData({
      targetAudience: '',
      product: '',
      benefits: '',
      tone: 'professional',
      platform: 'general'
    });
    setGeneratedContent('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Marketing Tools</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-1">Create compelling marketing content with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tool Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Marketing Tools</h2>
          <div className="space-y-3">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedTool === tool.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium">{tool.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{tool.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Generation */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Content Generator</h2>
            <div className="flex space-x-2">
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                placeholder="e.g., Small business owners, tech professionals..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Product/Service *
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                placeholder="e.g., AI Business Assistant, Marketing Software..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Key Benefits
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                placeholder="e.g., Saves time, increases productivity, reduces costs..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="google">Google Ads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Generated Content</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button 
                    onClick={saveCampaign}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={exportContent}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
                <pre className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 font-medium">{generatedContent}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Saved Campaigns */}
      {savedCampaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Saved Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCampaigns.slice(0, 6).map((campaign) => (
              <div key={campaign.id} className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-800 dark:text-white truncate">{campaign.title}</h3>
                  <span className="text-xs text-slate-500 dark:text-gray-400 capitalize">{campaign.type}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {campaign.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-gray-500">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setGeneratedContent(campaign.content)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentFeature="content generation"
      />
    </div>
  );
};

export default MarketingTools;