import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const googleIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/24px-Google_%22G%22_Logo.svg.png';

const Login = ({ initialSignup = false, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(initialSignup);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
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
      alert('Sign in failed: ' + err.message);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-teal-600 font-sans p-4">
      <div className={`w-full max-w-md bg-white rounded-xl shadow-xl px-6 py-8 flex flex-col gap-6 relative transition-all duration-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(10,25,49,0.12)' }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 hover:bg-gray-200 transition"
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-800 mb-2">Sign {isSignup ? 'Up' : 'In'} to <span className="text-teal-600">Smart Finance Advisor</span></h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <label className="block">
            <span className="text-gray-700 font-medium">Email</span>
            <input
              type="email"
              className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 px-4 py-3 text-base transition"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Password</span>
            <input
              type="password"
              className="mt-2 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 px-4 py-3 text-base transition"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-lg shadow"
          >
            {loading ? (isSignup ? 'Signing up...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
          {error && <div className="text-red-600 mt-1 text-sm text-center font-medium">{error}</div>}
        </form>
        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 bg-white hover:shadow-md transition gap-2"
        >
          <img src={googleIconUrl} alt="Google" className="h-6 w-6 mr-2" style={{ width: 24, height: 24 }} />
          <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
        {/* Sign Up link at bottom of card */}
        <div className="pt-2">
          <p className="text-center text-gray-600 text-base">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-500 hover:underline font-semibold ml-1"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 