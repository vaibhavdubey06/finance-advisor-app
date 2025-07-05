import React, { useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onClose, mode = 'login' }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setLoading(false);
      if (onClose) onClose();
      navigate("/app");
    } catch (err) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Create profile with basic info
        await setDoc(userDocRef, {
          name: user.displayName || '',
          email: user.email || '',
          createdAt: new Date().toISOString(),
        });
      }
      setGoogleLoading(false);
      if (onClose) onClose();
      navigate("/app");
    } catch (err) {
      setError(err.message || "Google authentication failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 relative w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {onClose && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        )}
        <h2 className="text-2xl font-bold mb-6 text-center">{mode === 'signup' ? 'Sign Up' : 'Login'}</h2>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading || googleLoading}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || googleLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading || googleLoading}
          >
            {loading ? (mode === 'signup' ? 'Signing Up...' : 'Signing In...') : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <div className="my-4 flex items-center justify-center">
          <span className="text-gray-400 mx-2">or</span>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold text-lg"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (mode === 'signup' ? 'Signing up...' : 'Signing in...') : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.82 2.36 30.28 0 24 0 14.82 0 6.88 5.48 2.69 13.44l7.98 6.2C12.33 13.13 17.68 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.04l7.18 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.09c-1.01-2.98-1.01-6.2 0-9.18l-7.98-6.2C.64 17.1 0 20.47 0 24c0 3.53.64 6.9 1.77 10.29l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.28 0 11.56-2.08 15.41-5.66l-7.18-5.59c-2.01 1.35-4.59 2.15-8.23 2.15-6.32 0-11.67-3.63-14.33-8.93l-7.98 6.2C6.88 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </>
          )}
        </button>
      </div>
    </div>
  );
} 