import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaBullseye, FaRobot, FaPalette } from 'react-icons/fa';
import { Button } from "./components/Button";
import { Card, CardContent } from "./components/Card";
import heroImage from "./assets/hero.jpg";
import dashboardImage from "./assets/dashboard.jpg";

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Manager',
    content: 'This AI chartered accountant has completely transformed how I manage my business finances. The professional insights are incredibly accurate and comprehensive.',
    rating: 5
  },
  {
    name: 'David Rodriguez',
    role: 'Small Business Owner',
    content: 'Finally, an accounting solution that understands my business needs. The AI recommendations have helped optimize my cash flow by 30%.',
    rating: 5
  }
];

const features = [
  {
    icon: (
      <span className="flex items-center justify-center h-12 w-12 mx-auto mb-4">
        <svg className="h-12 w-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /></svg>
      </span>
    ),
    title: 'Accounting Dashboard',
    description: 'Get a complete overview of your finances with professional-grade charts and real-time business insights.'
  },
  {
    icon: (
      <span className="flex items-center justify-center h-12 w-12 mx-auto mb-4">
        <svg className="h-12 w-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
      </span>
    ),
    title: 'AI Chartered Accountant',
    description: 'Ask questions and get professional accounting advice from our intelligent AI chartered accountant.'
  },
  {
    icon: (
      <span className="flex items-center justify-center h-12 w-12 mx-auto mb-4">
        <svg className="h-12 w-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
      </span>
    ),
    title: 'Business Goal Tracking',
    description: 'Set financial goals and track your business progress with expert recommendations.'
  },
  {
    icon: (
      <span className="flex items-center justify-center h-12 w-12 mx-auto mb-4">
        <svg className="h-12 w-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" /></svg>
      </span>
    ),
    title: 'Secure Document Upload',
    description: 'Safely upload financial documents for automatic categorization and professional analysis.'
  }
];

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handler to open login/signup modal
  const handleOpenLogin = (mode = 'login') => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  // Handler to close modal
  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  // Smooth scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100">
      {/* Login/Signup Modal */}
      {showLogin && <LoginForm mode={loginMode} onClose={handleCloseLogin} />}
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <span className="text-2xl font-bold text-teal-700">FinanceAI</span>
          <div className="hidden md:flex gap-8">
            <a href="#" className="text-gray-700 hover:text-teal-600">Home</a>
            <a href="#features" className="text-gray-700 hover:text-teal-600">Features</a>
            <a href="#contact" className="text-gray-700 hover:text-teal-600">Contact</a>
            <a href="#" className="text-gray-700 hover:text-teal-600" onClick={e => { e.preventDefault(); handleOpenLogin('login'); }}>Login</a>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-icons">menu</span>
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <a href="#" className="block px-4 py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#features" className="block px-4 py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#contact" className="block px-4 py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <a href="#" className="block px-4 py-2 text-gray-700" onClick={e => { e.preventDefault(); setIsMenuOpen(false); handleOpenLogin('login'); }}>Login</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-teal-400 to-blue-500 text-white text-center">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your AI-Powered <span className="block text-teal-200">Personal Chartered Accountant</span>
            </h1>
            <p className="text-xl mb-8 max-w-lg mx-auto lg:mx-0">
              Get professional accounting expertise with intelligent insights, automated bookkeeping, and personalized financial advice powered by advanced AI.
            </p>
            <Button size="lg" className="bg-white text-teal-700 font-bold shadow-lg" onClick={() => handleOpenLogin('signup')}>Get Started</Button>
          </div>
          <div className="flex-1 animate-slide-up flex justify-center items-center py-8">
            <img src={heroImage} alt="AI-Powered Personal Chartered Accountant" className="max-w-[600px] w-full rounded-xl shadow-xl object-cover my-8 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Accounting Features Powered by AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines professional accounting expertise with cutting-edge technology to give you complete control over your financial management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-teal-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See Your Finances Like Never Before
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intuitive dashboard gives you a complete picture of your financial health with real-time insights and AI-powered recommendations.
            </p>
          </div>
          <div className="flex justify-center animate-slide-up py-8">
            <img src={dashboardImage} alt="Finance Dashboard Screenshot" className="max-w-[500px] w-full rounded-xl shadow-xl border object-cover my-8 mx-auto" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands of Users
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about their financial transformation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-teal-50 to-blue-100 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-400 to-blue-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their finances with our AI-powered advisor.
          </p>
          <Button size="lg" className="bg-white text-teal-700 font-bold shadow-lg text-lg px-8 py-6" onClick={() => handleOpenLogin('signup')}>
            Sign Up Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-teal-200 mb-4">FinanceAI</div>
            <p className="text-white/80">
              Your intelligent personal chartered accountant powered by AI.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#features" className="hover:text-teal-300 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-teal-300 transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-teal-300 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-teal-300 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-teal-300 transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} FinanceAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 