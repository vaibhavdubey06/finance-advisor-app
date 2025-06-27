import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ProfileForm = ({ onProfileSaved }) => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savings, setSavings] = useState('');
  const [goal, setGoal] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('Not logged in.');
        setLoading(false);
        return;
      }
      await setDoc(doc(db, 'users', user.uid), {
        income: Number(income),
        expenses: Number(expenses),
        savings: Number(savings),
        goal,
        goalAmount: Number(goalAmount),
        goalDeadline,
      });
      if (onProfileSaved) onProfileSaved();
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Create Your Financial Profile</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="number" placeholder="Monthly Income (₹)" value={income} onChange={e => setIncome(e.target.value)} required disabled={loading} />
        <input type="number" placeholder="Monthly Expenses (₹)" value={expenses} onChange={e => setExpenses(e.target.value)} required disabled={loading} />
        <input type="number" placeholder="Current Savings (₹)" value={savings} onChange={e => setSavings(e.target.value)} required disabled={loading} />
        <input type="text" placeholder="Financial Goal (e.g. Buy a car)" value={goal} onChange={e => setGoal(e.target.value)} required disabled={loading} />
        <input type="number" placeholder="Goal Amount (₹)" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} required disabled={loading} />
        <input type="date" placeholder="Goal Deadline" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} required disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  );
};

export default ProfileForm; 