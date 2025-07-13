import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Edit, 
  Eye, 
  Share2, 
  Save, 
  Plus, 
  Trash2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { database } from '../lib/database';

interface PortfolioBuilderProps {
  user: any;
}

const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({ user }) => {
  const [portfolio, setPortfolio] = useState({
    business_name: '',
    tagline: '',
    description: '',
    services: [''],
    contact_info: {
      email: '',
      phone: '',
      address: ''
    },
    social_links: {
      website: '',
      linkedin: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    is_public: false,
    slug: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await database.getPortfolio(user.id);
    
    if (data) {
      setPortfolio(data);
    } else {
      // Initialize with user data
      setPortfolio(prev => ({
        ...prev,
        business_name: user.company || `${user.name}'s Business`,
        contact_info: {
          ...prev.contact_info,
          email: user.email
        },
        slug: user.name.toLowerCase().replace(/\s+/g, '-')
      }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    if (!user) {
      alert('Please log in to save your portfolio');
      setSaving(false);
      return;
    }
    
    const portfolioData = {
      ...portfolio,
      slug: portfolio.slug || portfolio.business_name.toLowerCase().replace(/\s+/g, '-')
    };
    
    console.log('💾 Saving portfolio:', portfolioData);
    const { data, error } = await database.createOrUpdatePortfolio(portfolioData);
    
    if (!error && data) {
      setPortfolio(data);
      console.log('✅ Portfolio saved successfully:', data);
      alert('Portfolio saved successfully!');
    } else {
      console.error('❌ Portfolio save error:', error);
      alert(`Error saving portfolio: ${error?.message || 'Please try again.'}`);
    }
    
    setSaving(false);
  };

  const addService = () => {
    setPortfolio(prev => ({
      ...prev,
      services: [...prev.services, '']
    }));
  };

  const removeService = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, value: string) => {
    setPortfolio(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }));
  };

  const copyPortfolioLink = () => {
    const link = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PortfolioPreview = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-3xl font-bold mb-2">{portfolio.business_name}</h1>
        <p className="text-blue-100 text-lg">{portfolio.tagline}</p>
      </div>
      
      {/* Content */}
      <div className="p-8">
        {/* About */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">About Us</h2>
          <p className="text-slate-600 dark:text-gray-300 leading-relaxed">{portfolio.description}</p>
        </section>
        
        {/* Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.services.filter(service => service.trim()).map((service, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border">
                <p className="font-medium text-slate-800 dark:text-white">{service}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Get in Touch</h3>
              <div className="space-y-2 text-slate-600 dark:text-gray-300">
                {portfolio.contact_info.email && (
                  <p>Email: {portfolio.contact_info.email}</p>
                )}
                {portfolio.contact_info.phone && (
                  <p>Phone: {portfolio.contact_info.phone}</p>
                )}
                {portfolio.contact_info.address && (
                  <p>Address: {portfolio.contact_info.address}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Follow Us</h3>
              <div className="space-y-2">
                {Object.entries(portfolio.social_links).map(([platform, url]) => (
                  url && (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="capitalize">{platform}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Portfolio Preview</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            {portfolio.is_public && (
              <button
                onClick={copyPortfolioLink}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Share Link'}</span>
              </button>
            )}
          </div>
        </div>
        <PortfolioPreview />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Business Portfolio</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">Create your professional business showcase</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={portfolio.business_name}
                onChange={(e) => setPortfolio(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your Business Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={portfolio.tagline}
                onChange={(e) => setPortfolio(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="A brief, catchy description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={portfolio.description}
                onChange={(e) => setPortfolio(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none dark:bg-gray-700 dark:text-white"
                placeholder="Tell visitors about your business..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Portfolio URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-600 text-slate-500 dark:text-gray-400 text-sm">
                  {window.location.origin}/portfolio/
                </span>
                <input
                  type="text"
                  value={portfolio.slug}
                  onChange={(e) => setPortfolio(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="your-business-name"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={portfolio.is_public}
                onChange={(e) => setPortfolio(prev => ({ ...prev, is_public: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_public" className="text-sm text-slate-700 dark:text-gray-300">
                Make portfolio public (visible to everyone)
              </label>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Services</h2>
            <button
              onClick={addService}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {portfolio.services.map((service, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => updateService(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Service name"
                />
                {portfolio.services.length > 1 && (
                  <button
                    onClick={() => removeService(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={portfolio.contact_info.email}
                onChange={(e) => setPortfolio(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="contact@yourbusiness.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={portfolio.contact_info.phone}
                onChange={(e) => setPortfolio(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="+92 300 1234567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                value={portfolio.contact_info.address}
                onChange={(e) => setPortfolio(prev => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, address: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none dark:bg-gray-700 dark:text-white"
                placeholder="Your business address"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Social Links</h2>
          
          <div className="space-y-4">
            {Object.entries(portfolio.social_links).map(([platform, url]) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setPortfolio(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, [platform]: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={`https://${platform}.com/yourprofile`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Link */}
      {portfolio.is_public && portfolio.slug && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Portfolio is Live!</h3>
              <p className="text-green-700 dark:text-green-400 text-sm">
                Your portfolio is publicly accessible at:
              </p>
              <code className="text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded text-sm">
                {window.location.origin}/portfolio/{portfolio.slug}
              </code>
            </div>
            <button
              onClick={copyPortfolioLink}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;