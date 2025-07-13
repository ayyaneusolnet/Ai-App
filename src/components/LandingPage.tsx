import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Zap,
  Shield,
  Clock,
  Globe,
  Sparkles,
  Rocket,
  Award,
  Play,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Marketing',
      description: 'Generate compelling ad copy, social media content, and email campaigns that convert. Our AI analyzes your brand voice and creates content that resonates with your audience.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      delay: 'delay-100'
    },
    {
      icon: DollarSign,
      title: 'Smart Finance Management',
      description: 'Create professional invoices, track expenses, and get financial insights. Automate your billing process and never miss a payment again.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      delay: 'delay-200'
    },
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Develop growth strategies, analyze competitors, and make data-driven decisions. Get personalized recommendations for scaling your business.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      delay: 'delay-300'
    },
    {
      icon: BarChart3,
      title: 'Operations Optimization',
      description: 'Streamline workflows, manage tasks, and boost productivity. Our AI identifies bottlenecks and suggests improvements for maximum efficiency.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      delay: 'delay-400'
    }
  ];

  const benefits = [
    { icon: Zap, text: 'Save 10+ hours per week on routine tasks', delay: 'delay-100' },
    { icon: TrendingUp, text: 'Increase revenue by up to 40% with AI insights', delay: 'delay-200' },
    { icon: Users, text: 'Scale your team\'s productivity effortlessly', delay: 'delay-300' },
    { icon: Shield, text: 'Enterprise-grade security and data protection', delay: 'delay-400' },
    { icon: Clock, text: '24/7 AI assistant ready to help', delay: 'delay-500' },
    { icon: Globe, text: 'Works with businesses of all sizes globally', delay: 'delay-600' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      content: 'This AI assistant transformed our marketing efforts. We\'ve seen a 300% increase in lead generation since implementing their tools.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'Founder, GrowthLab',
      content: 'The financial tools alone saved us thousands in accounting fees. The invoice automation is a game-changer for our cash flow.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director, ScaleUp',
      content: 'I can create a month\'s worth of social media content in just 30 minutes. The AI understands our brand voice perfectly.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '5 Content Generations',
        '2 Invoices',
        '1 Campaign',
        '10 Tasks',
        'Email Support'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Starter',
      price: '$2',
      period: '/month',
      description: 'Ideal for small businesses',
      features: [
        '50 Content Generations',
        '25 Invoices',
        '10 Campaigns',
        '100 Tasks',
        'Priority Support',
        'Basic Team Features'
      ],
      popular: true,
      color: 'border-blue-500'
    },
    {
      name: 'Professional',
      price: '$5',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited Everything',
        'Advanced Analytics',
        'Team Collaboration',
        'Custom Branding',
        'Portfolio Builder',
        'CRM & Lead Management',
        '24/7 Support'
      ],
      popular: false,
      color: 'border-purple-500'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Users', delay: 'delay-100' },
    { number: '1M+', label: 'Content Generated', delay: 'delay-200' },
    { number: '99.9%', label: 'Uptime', delay: 'delay-300' },
    { number: '24/7', label: 'Support', delay: 'delay-400' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Business Assistant
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-in">
              <Sparkles className="w-4 h-4" />
              <span>🎉 Now with Advanced AI Integration</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Your Complete
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                AI Business
              </span>
              Command Center
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your business operations with our comprehensive AI-powered platform. 
              Generate marketing content, manage finances, plan strategies, and optimize operations 
              - all from one intelligent dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <Rocket className="w-6 h-6 group-hover:animate-pulse" />
                <span className="text-lg font-semibold">Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="flex items-center space-x-2 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200">
                <Play className="w-5 h-5" />
                <span className="font-medium">Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center animate-fade-in ${stat.delay}`}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose Our AI Assistant?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Join thousands of businesses already transforming their operations with intelligent automation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className={`group flex items-center space-x-4 p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 animate-slide-up ${benefit.delay}`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-700 font-medium flex-1">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Powerful Features for Every Business Need</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools covers every aspect of your business operations
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className={`group flex items-start space-x-6 p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-500 animate-fade-in ${feature.delay}`}>
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Trusted by Industry Leaders</h2>
            <p className="text-xl text-slate-600">See what our customers are saying about their success</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
              <div className="flex items-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-2xl md:text-3xl text-slate-700 font-medium mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonials[currentTestimonial].avatar} 
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-slate-800 text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-slate-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Simple, Affordable Pricing</h2>
            <p className="text-xl text-slate-600">Choose the plan that fits your business needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative p-8 rounded-2xl border-2 ${plan.color} ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-105' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              } transition-all duration-300 hover:scale-105`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-slate-800">{plan.price}</span>
                    <span className="text-slate-600 ml-2 text-lg">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of successful businesses using our AI-powered platform to scale and grow.
          </p>
          <button
            onClick={onGetStarted}
            className="group px-12 py-6 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            <span className="flex items-center space-x-3">
              <span>Start Your Free Trial Today</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          <p className="text-blue-200 mt-6 text-lg">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AI Business Assistant</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering businesses with intelligent automation and AI-driven insights for unprecedented growth.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 AI Business Assistant. All rights reserved. Built with ❤️ for entrepreneurs worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;