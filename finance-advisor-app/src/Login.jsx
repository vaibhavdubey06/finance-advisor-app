import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaChartLine, FaDollarSign, FaPiggyBank, FaArrowUp } from 'react-icons/fa';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const Login = ({ initialSignup = false, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(initialSignup);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Auto-create minimal profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          income: 0,
          expenses: 0,
          savings: 0,
          goal: '',
          goalAmount: 0,
          goalDeadline: '',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onClose) onClose();
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      if (onClose) onClose();
      navigate('/app');
    } catch (err) {
      setError('Sign in failed: ' + err.message);
    }
  };

  const handleClose = () => { if (onClose) onClose(); };

  // Floating financial icons component
  const FloatingIcons = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FaChartLine className="absolute top-20 left-10 text-emerald-400/20 text-4xl animate-float" style={{ animationDelay: '0s' }} />
      <FaDollarSign className="absolute top-32 right-16 text-blue-400/20 text-3xl animate-float" style={{ animationDelay: '1s' }} />
      <FaPiggyBank className="absolute bottom-32 left-20 text-yellow-400/20 text-5xl animate-float" style={{ animationDelay: '2s' }} />
      <FaArrowUp className="absolute bottom-20 right-12 text-green-400/20 text-4xl animate-float" style={{ animationDelay: '0.5s' }} />
      <FaChartLine className="absolute top-1/2 left-8 text-purple-400/20 text-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      <FaDollarSign className="absolute top-1/3 right-8 text-indigo-400/20 text-4xl animate-float" style={{ animationDelay: '2.5s' }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-financial-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <FloatingIcons />
      {/* Animated background circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse-custom"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-emerald-400/10 rounded-full animate-float"></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-blue-400/10 rounded-full animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      {/* Main login container */}
      <div className={`w-full max-w-2xl px-2 sm:px-8 mx-auto relative z-10 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}>
        {/* Glassmorphism card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-10 sm:p-14 relative overflow-hidden">
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 animate-shimmer opacity-30"></div>
          {/* Logo and branding */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl mb-4 animate-glow">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">FinWise</h1>
            <p className="text-white/80 text-sm">Your Smart Financial Advisor</p>
          </div>
          {/* Welcome message */}
          <div className="text-center mb-6 animate-slide-up delay-100">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignup ? 'Start Your Financial Journey' : 'Welcome Back!'}
            </h2>
            <p className="text-white/70 text-sm">
              {isSignup ? 'Create your account to begin managing your finances' : 'Sign in to access your financial dashboard'}
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="animate-slide-left delay-200">
              <label htmlFor="email" className="block text-white/90 font-medium mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            {/* Password field */}
            <div className="animate-slide-right delay-300">
              <label htmlFor="password" className="block text-white/90 font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            {/* Submit button */}
            <div className="animate-slide-up delay-400">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl py-3 font-semibold hover:from-emerald-400 hover:to-blue-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isSignup ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    isSignup ? 'Create Account' : 'Sign In'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 animate-slide-up">
                <p className="text-red-200 text-sm text-center font-medium">{error}</p>
              </div>
            )}
          </form>
          {/* Divider */}
          <div className="flex items-center my-6 animate-fade-in delay-500">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-white/60 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
          {/* Google Sign In */}
          <div className="animate-slide-up delay-600">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 text-white font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm hover:scale-105 active:scale-95 group"
            >
              <FaGoogle className="text-lg group-hover:text-red-400 transition-colors duration-300" />
              <span>Continue with Google</span>
            </button>
          </div>
          {/* Sign up/Sign in toggle */}
          <div className="text-center mt-6 animate-fade-in delay-700">
            <p className="text-white/70 text-sm">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200 hover:underline"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          {/* Financial benefits */}
          <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in delay-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="group">
                <FaChartLine className="text-emerald-400 text-xl mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-white/70 text-xs">Track Expenses</p>
              </div>
              <div className="group">
                <FaPiggyBank className="text-blue-400 text-xl mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-white/70 text-xs">Save Money</p>
              </div>
              <div className="group">
                <FaArrowUp className="text-yellow-400 text-xl mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-white/70 text-xs">Grow Wealth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;