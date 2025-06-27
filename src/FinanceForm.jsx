import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const FinanceForm = () => {
  const [form, setForm] = useState({
    income: '',
    expenses: '',
    goal: '',
    goalAmount: '',
    goalDeadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setFetching(true);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setForm({
              income: data.income?.toString() || '',
              expenses: data.expenses?.toString() || '',
              goal: data.goal || '',
              goalAmount: data.goalAmount?.toString() || '',
              goalDeadline: data.goalDeadline || '',
            });
          } else {
            setForm({ income: '', expenses: '', goal: '', goalAmount: '', goalDeadline: '' });
          }
        } catch (err) {
          setError('Failed to fetch data.');
        } finally {
          setFetching(false);
        }
      } else {
        setFetching(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please log in to save your data.');
      setLoading(false);
      return;
    }
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        income: Number(form.income),
        expenses: Number(form.expenses),
        goal: form.goal,
        goalAmount: Number(form.goalAmount),
        goalDeadline: form.goalDeadline ? form.goalDeadline : '',
        createdAt: new Date(),
      });
      setSuccess(true);
    } catch (err) {
      setError('Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2>Monthly Finance Form</h2>
      <label>
        Monthly Income:
        <input type="number" name="income" value={form.income} onChange={handleChange} required min="0" />
      </label>
      <label>
        Monthly Expenses:
        <input type="number" name="expenses" value={form.expenses} onChange={handleChange} required min="0" />
      </label>
      <label>
        Financial Goal:
        <input type="text" name="goal" value={form.goal} onChange={handleChange} required />
      </label>
      <label>
        Goal Amount:
        <input type="number" name="goalAmount" value={form.goalAmount} onChange={handleChange} required min="0" />
      </label>
      <label>
        Goal Deadline:
        <input type="date" name="goalDeadline" value={form.goalDeadline} onChange={handleChange} required />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
      {success && <p style={{ color: 'green' }}>Data saved successfully!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default FinanceForm; 