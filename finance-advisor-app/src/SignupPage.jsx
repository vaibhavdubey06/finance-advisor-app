import React from 'react';
import LoginForm from './components/LoginForm';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181b1f]">
      <div className="w-full max-w-lg mx-auto bg-[#23272f] rounded-2xl shadow-2xl px-8 py-10 flex flex-col gap-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Create your FinanceAI Account</h2>
        <p className="text-center text-gray-400 mb-6 text-lg">Sign up to unlock smart budgeting, investment tracking, and more!</p>
        <LoginForm mode="signup" customStyle />
        <div className="text-center mt-4">
          <Link to="/login" className="text-gray-300 hover:underline font-semibold">Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
} 