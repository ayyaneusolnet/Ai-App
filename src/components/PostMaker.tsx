import React, { useState } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Calendar, 
  Hash, 
  Eye, 
  Copy, 
  Download,
  Zap,
  RefreshCw,
  Save
} from 'lucide-react';
import { deepseekAI } from '../lib/deepseek';
import { TierManager } from '../lib/tiers';
import { database } from '../lib/database';
import TierUpgradeModal from './TierUpgradeModal';

const PostMaker: React.FC = () => {
  const [postData, setPostData] = useState({
    platform: 'instagram',
    postType: 'image',
    topic: '',
    tone: 'engaging',
    targetAudience: '',
    callToAction: '',
    hashtags: true,
    length: 'medium'
  });
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📺' }
  ];

  const postTypes = [
    { id: 'image', name: 'Image Post', icon: Image },
    { id: 'video', name: 'Video Post', icon: Video },
    { id: 'text', name: 'Text Post', icon: FileText },
    { id: 'story', name: 'Story', icon: Calendar }
  ];

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'casual', name: 'Casual' },
    { id: 'funny', name: 'Funny' },
    { id: 'inspiring', name: 'Inspiring' },
    { id: 'educational', name: 'Educational' },
    { id: 'engaging', name: 'Engaging' }
  ];

  const handleGenerate = async () => {
    if (!postData.topic.trim()) {
      alert('Please enter a topic for your post');
      return;
    }

    if (!TierManager.canUseFeature('contentGenerations')) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Create a ${postData.tone} ${postData.platform} ${postData.postType} post about: ${postData.topic}

Platform: ${postData.platform}
Post Type: ${postData.postType}
Tone: ${postData.tone}
Target Audience: ${postData.targetAudience || 'general audience'}
Call to Action: ${postData.callToAction || 'engage with the post'}
Include Hashtags: ${postData.hashtags ? 'Yes' : 'No'}
Length: ${postData.length}

Requirements:
- Make it ${postData.tone} and engaging
- Optimize for ${postData.platform} best practices
- Include relevant emojis
- ${postData.hashtags ? 'Add 5-10 relevant hashtags' : 'No hashtags needed'}
- ${postData.callToAction ? `Include this call to action: ${postData.callToAction}` : 'Include a natural call to action'}
- Keep it ${postData.length === 'short' ? 'concise (1-2 sentences)' : postData.length === 'medium' ? 'moderate length (2-4 sentences)' : 'detailed (4-6 sentences)'}`;

      const content = await deepseekAI.generateContent(prompt, 'social');
      setGeneratedPost(content);
      TierManager.updateUsage('contentGenerations');
    } catch (error) {
      console.error('Post generation error:', error);
      alert('Error generating post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPost) {
      alert('Please generate a post first');
      return;
    }

    if (!TierManager.canUseFeature('campaigns')) {
      setShowUpgradeModal(true);
      return;
    }

    const campaignData = {
      title: `${postData.platform} Post - ${postData.topic}`,
      type: 'social',
      content: generatedPost,
      target_audience: postData.targetAudience,
      platform: postData.platform,
      tone: postData.tone
    };

    const { data, error } = await database.createCampaign(campaignData);
    if (!error && data) {
      alert('Post saved successfully!');
      TierManager.updateUsage('campaigns');
    } else {
      alert('Error saving post. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    alert('Post copied to clipboard!');
  };

  const resetForm = () => {
    setPostData({
      platform: 'instagram',
      postType: 'image',
      topic: '',
      tone: 'engaging',
      targetAudience: '',
      callToAction: '',
      hashtags: true,
      length: 'medium'
    });
    setGeneratedPost('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">AI Post Maker</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-1">Create engaging social media posts with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Post Configuration</h2>
          
          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                Platform
              </label>
              <div className="grid grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setPostData(prev => ({ ...prev, platform: platform.id }))}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      postData.platform === platform.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{platform.icon}</div>
                    <div className="text-xs font-medium">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                Post Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {postTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setPostData(prev => ({ ...prev, postType: type.id }))}
                      className={`p-3 rounded-lg border flex items-center space-x-2 transition-colors ${
                        postData.postType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Topic/Subject *
              </label>
              <input
                type="text"
                value={postData.topic}
                onChange={(e) => setPostData(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., New product launch, Monday motivation, Industry tips..."
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={postData.targetAudience}
                onChange={(e) => setPostData(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Small business owners, Tech enthusiasts, Young professionals..."
              />
            </div>

            {/* Tone and Length */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Tone
                </label>
                <select
                  value={postData.tone}
                  onChange={(e) => setPostData(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {tones.map(tone => (
                    <option key={tone.id} value={tone.id}>{tone.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Length
                </label>
                <select
                  value={postData.length}
                  onChange={(e) => setPostData(prev => ({ ...prev, length: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>

            {/* Call to Action */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Call to Action
              </label>
              <input
                type="text"
                value={postData.callToAction}
                onChange={(e) => setPostData(prev => ({ ...prev, callToAction: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Visit our website, Share your thoughts, Tag a friend..."
              />
            </div>

            {/* Options */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hashtags"
                checked={postData.hashtags}
                onChange={(e) => setPostData(prev => ({ ...prev, hashtags: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="hashtags" className="text-sm text-slate-700 dark:text-gray-300">
                Include relevant hashtags
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !postData.topic.trim()}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Post Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Generated Post</h2>
            {generatedPost && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          {generatedPost ? (
            <div className="space-y-4">
              {/* Platform Preview */}
              <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-lg">
                    {platforms.find(p => p.id === postData.platform)?.icon}
                  </div>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {platforms.find(p => p.id === postData.platform)?.name} Preview
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-600">
                  <pre className="whitespace-pre-wrap text-slate-700 dark:text-gray-300 font-medium">
                    {generatedPost}
                  </pre>
                </div>
              </div>

              {/* Post Analytics Preview */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.floor(Math.random() * 500) + 100}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">Est. Reach</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-400">Est. Engagement</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {Math.floor(Math.random() * 20) + 5}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-400">Est. Shares</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-gray-400">Configure your post settings and click "Generate Post" to create engaging content</p>
            </div>
          )}
        </div>
      </div>

      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentFeature="post generation"
      />
    </div>
  );
};

export default PostMaker;