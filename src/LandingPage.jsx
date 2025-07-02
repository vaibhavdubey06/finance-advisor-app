import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

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
    icon: '📈',
    title: 'Personalized AI Advice',
    desc: 'Get tailored financial guidance powered by advanced AI, just for you.'
  },
  {
    icon: '🎯',
    title: 'Goal Tracking',
    desc: 'Set, track, and achieve your financial goals with smart reminders.'
  },
  {
    icon: '💹',
    title: 'Financial Insights & Trends',
    desc: 'Visualize your progress and discover trends to optimize your finances.'
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Handler to open login/signup modal
  const handleOpenLogin = (signup = false) => {
    setIsSignup(signup);
    setShowLogin(true);
  };

  // Handler to close modal
  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <div className="font-sans bg-gradient-to-br from-blue-900 via-teal-700 to-teal-400 min-h-screen flex flex-col justify-between text-white relative">
      {/* Top-right Login/Sign Up buttons */}
      <div className="absolute top-6 right-8 z-50 flex gap-4">
        <button
          onClick={() => handleOpenLogin(false)}
          className="bg-white text-teal-700 font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 text-base border border-teal-400 hover:bg-teal-50"
        >
          Login
        </button>
        <button
          onClick={() => handleOpenLogin(true)}
          className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 text-base border border-teal-900"
        >
          Sign Up
        </button>
      </div>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 pt-24 pb-16 text-center overflow-hidden">
        {/* Background Wave/Shape */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0f172a" fillOpacity="0.5" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
        <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Your AI-Powered Personal Finance Advisor</h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl">Track your finances, set goals, and get smart, personalized advice — all in one place.</p>
          <button
            onClick={() => handleOpenLogin(false)}
            className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 text-lg"
          >
            Get Started
          </button>
        </div>
        {/* Modal for Login/Signup */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative text-gray-900 flex flex-col items-center">
              <button
                onClick={handleCloseLogin}
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700 font-bold z-10"
                aria-label="Close"
              >
                ×
              </button>
              <div className="w-full mt-6">
                <Login initialSignup={isSignup} hideBackground onClose={handleCloseLogin} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-blue-900 to-teal-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center bg-blue-800 bg-opacity-60 rounded-xl p-8 shadow-md hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-base opacity-90">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-teal-700 to-blue-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-blue-800 bg-opacity-70 rounded-xl p-6 flex flex-col items-center shadow-md">
                <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-teal-400" />
                <p className="italic mb-2">"{t.text}"</p>
                <span className="font-semibold mt-2">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 py-8 text-center text-sm mt-8">
        <div className="mb-2 font-bold text-lg">Finance Advisor App</div>
        <div className="mb-2">© {new Date().getFullYear()} Finance Advisor. All rights reserved.</div>
        <div className="flex justify-center gap-6 mt-2">
          <a href="#" className="hover:underline text-teal-300">Privacy Policy</a>
          <a href="#" className="hover:underline text-teal-300">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 