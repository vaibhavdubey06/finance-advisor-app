import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import { FaChartLine, FaBullseye, FaRobot, FaPalette } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const testimonials = [
  {
    name: 'Priya S.',
    text: 'This app changed how I manage money!',
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Rahul D.',
    text: "Best finance tool I've ever used.",
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Aisha K.',
    text: 'Personalized advice helped me reach my goals.',
    img: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

const features = [
  {
    icon: <FaChartLine className="text-4xl text-teal-400 mb-2" />,
    title: 'Track Finances',
    desc: 'See all your accounts, transactions, and balances in one place.'
  },
  {
    icon: <FaBullseye className="text-4xl text-teal-400 mb-2" />,
    title: 'Smart Goals',
    desc: 'Set, track, and achieve your financial goals with smart reminders.'
  },
  {
    icon: <FaRobot className="text-4xl text-teal-400 mb-2" />,
    title: 'AI Chat Advisor',
    desc: 'Get tailored financial guidance powered by advanced AI.'
  },
  {
    icon: <FaPalette className="text-4xl text-teal-400 mb-2" />,
    title: 'Beautiful Visuals',
    desc: 'Visualize your progress and discover trends to optimize your finances.'
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPortalTest, setShowPortalTest] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handler to open login/signup modal
  const handleOpenLogin = (signup = false) => {
    setIsSignup(signup);
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
    <div className="font-sans min-h-screen flex flex-col text-white bg-gradient-to-br from-[#0f172a] via-[#134e4a] to-[#0ea5e9] relative overflow-x-hidden">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-opacity-60 backdrop-blur-md bg-[#0f172a]/80 shadow-sm flex flex-col items-center px-8 py-4 gap-2">
        <div className="font-extrabold text-3xl tracking-tight cursor-pointer pl-2 mb-2" style={{letterSpacing: '0.04em'}} onClick={() => scrollToSection('hero')}>
          FinWise
        </div>
        <div className="flex flex-row gap-4 items-center justify-center w-full">
          <button onClick={() => scrollToSection('features')} className="hover:text-teal-300 transition-colors px-2 py-1 whitespace-nowrap">Features</button>
          <button onClick={() => scrollToSection('testimonials')} className="hover:text-teal-300 transition-colors px-2 py-1 whitespace-nowrap">Testimonials</button>
          <button onClick={() => scrollToSection('whyus')} className="hover:text-teal-300 transition-colors px-2 py-1 whitespace-nowrap">Why Us</button>
          <button
            onClick={() => handleOpenLogin(false)}
            className="ml-2 bg-white text-teal-700 font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 text-base border border-teal-400 hover:bg-teal-50 whitespace-nowrap"
          >
            Login
          </button>
          <button
            onClick={() => handleOpenLogin(true)}
            className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 text-base border border-teal-900 whitespace-nowrap"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Animated floating shapes background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-80 opacity-30 animate-float-slow" viewBox="0 0 1440 320"><path fill="#0ea5e9" fillOpacity="0.3" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>
        <div className="absolute right-10 top-40 w-40 h-40 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full blur-2xl opacity-40 animate-float" />
        <div className="absolute left-10 bottom-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-600 rounded-full blur-2xl opacity-30 animate-float-reverse" />
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative flex flex-col items-center justify-center min-h-screen pt-40 pb-16 text-center overflow-hidden px-4 sm:px-8 md:px-16">
        <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Your Personal AI Chartered Accountant</h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl">Track, plan, and grow your finances with AI-powered insights and expert guidance.</p>
          <button
            onClick={() => handleOpenLogin(true)}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold py-3 px-10 rounded-full shadow-xl transition-all duration-200 text-lg backdrop-blur-lg"
          >
            Get Started
          </button>
        </div>
        {/* Modal for Login/Signup */}
        {showLogin && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black bg-opacity-60">
            <Login initialSignup={isSignup} onClose={handleCloseLogin} />
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-transparent overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform border border-teal-100">
                {f.icon}
                <h3 className="text-xl font-bold mb-2 mt-2">{f.title}</h3>
                <p className="text-base opacity-90">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-transparent overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center shadow-lg border border-teal-100">
                <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-teal-400" />
                <p className="italic mb-2">"{t.text}"</p>
                <span className="font-semibold mt-2">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="whyus" className="py-20 bg-transparent">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose FinWise?</h2>
          <p className="text-lg opacity-90 mb-4">We combine the power of AI with beautiful design and practical tools to help you take control of your financial future. Our mission is to make smart money management accessible, motivating, and fun for everyone.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow">Secure & Private</span>
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow">AI-Powered Insights</span>
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow">Personalized Goals</span>
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow">Stunning Visuals</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] py-8 text-center text-sm mt-8">
        <div className="mb-2 font-bold text-lg">FinWise</div>
        <div className="mb-2">© {new Date().getFullYear()} FinWise. All rights reserved.</div>
        <div className="flex justify-center gap-6 mt-2">
          <a href="#" className="hover:underline text-teal-300">Privacy Policy</a>
          <a href="#" className="hover:underline text-teal-300">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 