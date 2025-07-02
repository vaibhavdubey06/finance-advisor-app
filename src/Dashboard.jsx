import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import Charts from './Charts';
import StatementUpload from './StatementUpload';

function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Example mock monthly data for chart (replace with real data if available)
const mockMonthlyData = [
  { month: 'Jan 2024', income: 50000, expenses: 30000, savings: 20000 },
  { month: 'Feb 2024', income: 52000, expenses: 32000, savings: 20000 },
  { month: 'Mar 2024', income: 51000, expenses: 31000, savings: 20000 },
  { month: 'Apr 2024', income: 53000, expenses: 34000, savings: 19000 },
  { month: 'May 2024', income: 54000, expenses: 35000, savings: 19000 },
  { month: 'Jun 2024', income: 55000, expenses: 36000, savings: 19000 },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalAmount, setEditGoalAmount] = useState('');
  const [editGoalDeadline, setEditGoalDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [monthInput, setMonthInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [expensesInput, setExpensesInput] = useState('');
  const [savingsInput, setSavingsInput] = useState('');
  const [monthlyFormMsg, setMonthlyFormMsg] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        } finally {
          setLoading(false);
        }
        // Fetch monthly data
        fetchMonthlyData(firebaseUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
        setMonthlyData(mockMonthlyData);
        setMonthlyLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const fetchMonthlyData = async (uid) => {
    setMonthlyLoading(true);
    try {
      const monthlyCol = collection(db, 'users', uid, 'monthlyData');
      const monthlySnap = await getDocs(monthlyCol);
      const data = monthlySnap.docs.map(doc => doc.data());
      setMonthlyData(data.length > 0 ? data : mockMonthlyData);
    } catch {
      setMonthlyData(mockMonthlyData);
    } finally {
      setMonthlyLoading(false);
    }
  };

  // Prefill edit form when entering edit mode
  useEffect(() => {
    if (editing && profile) {
      setEditGoalName(profile.goal || '');
      setEditGoalAmount(profile.goalAmount || '');
      setEditGoalDeadline(profile.goalDeadline || '');
    }
  }, [editing, profile]);

  // Prefill monthly form if editing an existing month
  const handleEditMonthly = (monthObj) => {
    setMonthInput(monthObj.month);
    setIncomeInput(monthObj.income);
    setExpensesInput(monthObj.expenses);
    setSavingsInput(monthObj.savings);
    setShowMonthlyForm(true);
    setMonthlyFormMsg('');
  };

  const handleAddMonthly = () => {
    setMonthInput('');
    setIncomeInput('');
    setExpensesInput('');
    setSavingsInput('');
    setShowMonthlyForm(true);
    setMonthlyFormMsg('');
  };

  const handleSaveMonthly = async (e) => {
    e.preventDefault();
    if (!user) return;
    // Validation and logging
    console.log({
      monthInput,
      incomeInput,
      expensesInput,
      savingsInput,
      parsedIncome: Number(incomeInput),
      parsedExpenses: Number(expensesInput),
      parsedSavings: Number(savingsInput)
    });
    if (
      !monthInput ||
      monthInput.includes('/') ||
      isNaN(Number(incomeInput)) ||
      isNaN(Number(expensesInput)) ||
      isNaN(Number(savingsInput))
    ) {
      setMonthlyFormMsg('Please fill all fields with valid values. Month cannot contain "/".');
      return;
    }
    setSaving(true);
    setMonthlyFormMsg('');
    try {
      const docRef = doc(db, 'users', user.uid, 'monthlyData', monthInput);
      await setDoc(docRef, {
        month: monthInput,
        income: Number(incomeInput),
        expenses: Number(expensesInput),
        savings: Number(savingsInput),
      });
      setMonthlyFormMsg('Saved!');
      setShowMonthlyForm(false);
      setMonthInput(''); setIncomeInput(''); setExpensesInput(''); setSavingsInput('');
      fetchMonthlyData(user.uid);
    } catch {
      setMonthlyFormMsg('Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setMonthlyFormMsg(''), 2000);
    }
  };

  const handleEditGoal = () => {
    setEditing(true);
    setSuccess('');
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess('');
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        goal: editGoalName,
        goalAmount: Number(editGoalAmount),
        goalDeadline: editGoalDeadline,
      });
      setSuccess('Goal updated successfully!');
      setEditing(false);
      // Refresh profile
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch {
      setSuccess('Failed to update goal.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 2500);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      alert('Failed to log out.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>Please log in to view your dashboard.</div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>No financial profile found.</div>;
  }

  const { income = 0, expenses = 0, savings = 0, goal = '', goalAmount = 0, goalDeadline = '' } = profile;
  const monthlySavings = income - expenses;
  const progress = clamp((savings / goalAmount) * 100, 0, 100);

  return (
    <div style={{ position: 'relative', padding: '1rem' }}>
      <button
        onClick={handleLogout}
        style={{ position: 'absolute', top: 16, right: 16, background: '#f44336', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 16px', cursor: 'pointer', fontWeight: 600 }}
      >
        Logout
      </button>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 8, color: '#222' }}>Your Financial Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#444' }}>Monthly Income</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#222' }}>{formatAmount(income)}</div>
            </div>
            <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#444' }}>Monthly Expenses</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#222' }}>{formatAmount(expenses)}</div>
            </div>
            <div style={{ background: '#e3fcec', borderRadius: 8, padding: 16, textAlign: 'center', gridColumn: 'span 2' }}>
              <div style={{ fontSize: 13, color: '#388e3c' }}>Calculated Monthly Savings</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#388e3c' }}>{formatAmount(monthlySavings)}</div>
            </div>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#222' }}>Goal: {goal || '—'}</div>
            <div style={{ fontSize: 14, color: '#333' }}>Target: <b>{formatAmount(goalAmount)}</b></div>
            <div style={{ fontSize: 14, color: '#333' }}>Deadline: <b>{goalDeadline || '—'}</b></div>
            {!editing && (
              <button onClick={handleEditGoal} style={{ marginTop: 12, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer' }}>Edit Goal</button>
            )}
            {editing && (
              <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <input
                  type="text"
                  value={editGoalName}
                  onChange={e => setEditGoalName(e.target.value)}
                  placeholder="Goal name"
                  required
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <input
                  type="number"
                  value={editGoalAmount}
                  onChange={e => setEditGoalAmount(e.target.value)}
                  placeholder="Goal amount"
                  required
                  min={0}
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <input
                  type="date"
                  value={editGoalDeadline}
                  onChange={e => setEditGoalDeadline(e.target.value)}
                  required
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <button type="submit" disabled={saving} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>{saving ? 'Saving...' : 'Save'}</button>
              </form>
            )}
            {success && <div style={{ color: success === 'Goal updated successfully!' ? '#388e3c' : 'red', marginTop: 8, fontWeight: 500 }}>{success}</div>}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Progress toward your goal:</div>
            <div style={{ background: '#e0e0e0', borderRadius: 8, height: 18, width: '100%', overflow: 'hidden' }}>
              <div style={{ background: '#007bff', height: '100%', width: `${progress}%`, borderRadius: 8, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 15, marginTop: 8, textAlign: 'center' }}>
              You're <b>{progress.toFixed(1)}%</b> of the way toward your goal.
            </div>
          </div>
          {/* Add/Edit Monthly Data UI */}
          <div style={{ marginTop: 24 }}>
            <button onClick={handleAddMonthly} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}>Add Monthly Data</button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {monthlyData && monthlyData.length > 0 && monthlyData.map((m) => (
                <button
                  key={m.month}
                  onClick={() => handleEditMonthly(m)}
                  style={{
                    background: '#e9f1ff',
                    border: '1.5px solid #007bff',
                    borderRadius: 5,
                    padding: '6px 14px',
                    fontSize: 14,
                    color: '#007bff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#007bff';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#e9f1ff';
                    e.currentTarget.style.color = '#007bff';
                  }}
                >
                  {m.month}
                </button>
              ))}
            </div>
            {showMonthlyForm && (
              <form onSubmit={handleSaveMonthly} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, background: '#f6f8fa', borderRadius: 8, padding: 16 }}>
                <input
                  type="text"
                  value={monthInput}
                  onChange={e => setMonthInput(e.target.value)}
                  placeholder="Month (e.g. Jan 2024)"
                  required
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <input
                  type="number"
                  value={incomeInput}
                  onChange={e => setIncomeInput(e.target.value)}
                  placeholder="Income"
                  required
                  min={0}
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <input
                  type="number"
                  value={expensesInput}
                  onChange={e => setExpensesInput(e.target.value)}
                  placeholder="Expenses"
                  required
                  min={0}
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <input
                  type="number"
                  value={savingsInput}
                  onChange={e => setSavingsInput(e.target.value)}
                  placeholder="Savings"
                  required
                  min={0}
                  style={{ padding: 8, borderRadius: 5, border: '1px solid #bbb', fontSize: 15 }}
                />
                <button type="submit" disabled={saving} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>{saving ? 'Saving...' : 'Save'}</button>
                {monthlyFormMsg && <div style={{ color: monthlyFormMsg === 'Saved!' ? '#388e3c' : 'red', marginTop: 8, fontWeight: 500 }}>{monthlyFormMsg}</div>}
              </form>
            )}
          </div>
        </div>
        <Charts monthlyData={monthlyLoading ? mockMonthlyData : monthlyData} />
      </div>
      <StatementUpload />
    </div>
  );
};

export default Dashboard; 