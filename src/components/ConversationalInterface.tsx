import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { deepseekAI } from '../lib/deepseek';
import { TierManager } from '../lib/tiers';

interface ConversationalInterfaceProps {
  onClose: () => void;
  user: { id: string; name: string; email: string; avatar?: string } | null;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({ onClose, user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${user?.name || 'there'}! I'm your AI Business Assistant. I can help you with marketing, finance, strategy, and operations. What would you like to work on today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const quickSuggestions = [
    "Create an ad campaign for my product",
    "Generate an invoice template",
    "Help me plan my growth strategy",
    "Optimize my team's workflow"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check tier limits
    if (!TierManager.canUseFeature('aiQueries')) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: '⚠️ You\'ve reached your AI query limit for this month. Please upgrade your plan to continue using the AI assistant.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    setInputMessage('');
    
    try {
      let aiResponse = '';
      
      // Smart response generation based on user input
      const input = inputMessage.toLowerCase();
      
      if (input.includes('marketing') || input.includes('ad') || input.includes('campaign')) {
        aiResponse = `Great question about marketing! Here's what I recommend:

🎯 **For effective marketing campaigns:**
• Focus on your target audience's pain points
• Use compelling headlines that grab attention
• Include clear calls-to-action
• Test different versions to see what works

📊 **Key metrics to track:**
• Click-through rates
• Conversion rates  
• Cost per acquisition
• Return on ad spend

Would you like me to help you create specific marketing content? I can generate ad copy, email campaigns, or social media posts!`;
      } else if (input.includes('invoice') || input.includes('billing') || input.includes('payment')) {
        aiResponse = `I'll help you with invoicing! Here's what you need to know:

📄 **Professional invoice essentials:**
• Clear invoice number and date
• Your business information and logo
• Client details and project description
• Itemized services with quantities and rates
• Payment terms and due date

💡 **Pro tips:**
• Send invoices immediately after work completion
• Offer multiple payment methods
• Follow up on overdue payments professionally
• Keep detailed records for tax purposes

I can help you create a professional invoice right now using our invoice generator tool!`;
      } else if (input.includes('strategy') || input.includes('plan') || input.includes('growth')) {
        aiResponse = `Excellent! Let's work on your business strategy:

🎯 **Strategic planning framework:**
1. **Assess current position** - Where are you now?
2. **Define clear goals** - Where do you want to be?
3. **Identify opportunities** - What markets can you tap?
4. **Analyze competition** - What are others doing?
5. **Create action plan** - How will you get there?

📈 **Growth strategies to consider:**
• Market penetration (sell more to existing customers)
• Market development (find new customer segments)
• Product development (create new offerings)
• Strategic partnerships (collaborate with others)

What specific area of your business strategy would you like to focus on?`;
      } else if (input.includes('task') || input.includes('productivity') || input.includes('workflow')) {
        aiResponse = `Let's optimize your productivity! Here's my advice:

⚡ **Productivity boosters:**
• Use the 80/20 rule - focus on high-impact tasks
• Batch similar activities together
• Set specific time blocks for different work types
• Eliminate or delegate low-value tasks

🔄 **Workflow optimization:**
• Map out your current processes
• Identify bottlenecks and delays
• Automate repetitive tasks
• Use project management tools

📋 **Task management tips:**
• Prioritize by urgency and importance
• Break large projects into smaller steps
• Set realistic deadlines
• Review and adjust regularly

Would you like me to help you create a task management system?`;
      } else if (input.includes('ai') || input.includes('automation')) {
        aiResponse = `AI and automation can transform your business! Here's how:

🤖 **AI applications for business:**
• Content generation (marketing copy, emails, social posts)
• Customer service chatbots
• Data analysis and insights
• Automated scheduling and reminders

⚙️ **Automation opportunities:**
• Email marketing sequences
• Invoice generation and sending
• Social media posting
• Lead qualification and follow-up

💰 **ROI benefits:**
• Save 10-20 hours per week
• Reduce human errors
• Improve customer response times
• Scale operations without hiring

This platform already includes many AI tools - have you tried our content generator or invoice automation?`;
      } else if (input.includes('accounting') || input.includes('expense') || input.includes('finance')) {
        aiResponse = `Let me help you with accounting and financial management:

💰 **Essential accounting practices:**
• Track all income and expenses daily
• Categorize transactions properly
• Keep digital receipts organized
• Reconcile accounts monthly
• Prepare for tax season year-round

📊 **Key financial metrics to monitor:**
• Cash flow (money in vs money out)
• Profit margins by product/service
• Monthly recurring revenue
• Customer acquisition cost
• Average transaction value

🔧 **Tools that can help:**
• Use our AI Accounting Tools for expense tracking
• Generate financial reports automatically
• Get AI insights on spending patterns
• Calculate tax obligations

Would you like me to help you set up a financial tracking system?`;
      } else if (input.includes('post') || input.includes('social media') || input.includes('content')) {
        aiResponse = `Perfect! Let's create engaging social media content:

📱 **Social media best practices:**
• Know your audience and platform
• Post consistently with a content calendar
• Use high-quality visuals and videos
• Engage with your community regularly
• Track performance and adjust strategy

✨ **Content ideas that work:**
• Behind-the-scenes content
• Educational tips and tutorials
• Customer success stories
• Industry news and insights
• Interactive polls and questions

🎯 **Platform-specific tips:**
• Instagram: Visual storytelling, hashtags
• LinkedIn: Professional insights, networking
• Twitter: Real-time updates, conversations
• Facebook: Community building, longer posts

Try our AI Post Maker to generate engaging content for any platform!`;
      } else {
        try {
          aiResponse = await deepseekAI.generateContent(
          `You are an AI Business Assistant. The user asked: "${inputMessage}". Provide helpful, actionable business advice.`,
          'general'
          );
        } catch (error) {
          console.error('AI API error:', error);
          aiResponse = `I understand you're asking about "${inputMessage}". Here's some general business advice:

🎯 **Key business principles:**
• Focus on solving real customer problems
• Build strong relationships with clients
• Continuously improve your products/services
• Monitor your finances closely
• Invest in marketing and growth

💡 **Quick tips:**
• Set clear, measurable goals
• Track your progress regularly
• Stay updated with industry trends
• Network with other professionals
• Always prioritize customer satisfaction

For more specific help, try using our specialized tools for marketing, finance, or operations!`;
        }
      }
      
      setIsTyping(false);
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
      TierManager.updateUsage('aiQueries');
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">AI Business Assistant</h2>
              <p className="text-sm text-slate-500">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-200'
                }`}>
                  {message.sender === 'user' ? (
                    user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )
                  ) : (
                    <Bot className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Quick suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalInterface;