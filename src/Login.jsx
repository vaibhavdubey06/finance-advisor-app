import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const Login = ({ initialSignup = false, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(initialSignup);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col gap-6 relative border border-gray-200">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 hover:bg-gray-200 transition z-20"
        aria-label="Close"
        type="button"
      >
        ×
      </button>
      {/* App Name or Logo */}
      <div className="text-2xl font-extrabold text-center text-teal-700 mb-2 tracking-tight select-none">FinWise</div>
      <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2 tracking-tight">{isSignup ? 'Create your account' : 'Welcome back!'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-2">
        <label htmlFor="email" className="text-gray-700 font-semibold mb-1">Email</label>
        <input
          type="email"
          id="email"
          className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 text-gray-900 px-4 py-3 text-base transition"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label htmlFor="password" className="text-gray-700 font-semibold mb-1 mt-2">Password</label>
        <input
          type="password"
          id="password"
          className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 text-gray-900 px-4 py-3 text-base transition"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg py-3 font-semibold hover:from-teal-400 hover:to-blue-400 transition disabled:opacity-60 disabled:cursor-not-allowed mt-4 text-lg shadow-lg"
        >
          {loading ? (isSignup ? 'Signing up...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
        </button>
        {error && <div className="text-red-600 mt-1 text-sm text-center font-medium animate-fade-in-up">{error}</div>}
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
        className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-3 bg-black hover:bg-gray-900 transition gap-2"
      >
        <FaGoogle className="h-5 w-5 mr-2 text-white" />
        <span className="text-white font-semibold text-base">Sign in with Google</span>
      </button>
      {/* Sign Up link at bottom of card */}
      <div className="pt-2">
        <p className="text-center text-gray-700 text-base">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-500 hover:underline font-semibold ml-1 transition-colors"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login; 