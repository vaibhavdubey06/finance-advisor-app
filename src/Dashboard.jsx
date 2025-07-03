import React, { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import Charts from './Charts';
import StatementUpload from './StatementUpload';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ChatAdvisor from './ChatAdvisor';
import { FaBars } from 'react-icons/fa';

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

const GoalProgressCard = ({ goal }) => {
  const { name, amount, deadline, savings } = goal;
  const progress = Math.min((Number(savings) / Number(amount)) * 100, 100);
  const daysRemaining = deadline ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <div className="w-24 h-24">
        <CircularProgressbar
          value={progress}
          text={`${Math.round(progress)}%`}
          styles={buildStyles({
            pathColor: progress >= 75 ? '#22c55e' : '#14b8a6',
            textColor: '#0f172a',
            trailColor: '#e5e7eb',
            backgroundColor: '#fff',
          })}
        />
      </div>
      <div className="text-lg font-bold text-teal-700 text-center">{name}</div>
      <div className="text-gray-700 text-center">₹{Number(savings).toLocaleString()} of ₹{Number(amount).toLocaleString()} saved ({Math.round(progress)}%)</div>
      {deadline && <div className="text-sm text-gray-500">Target: {new Date(deadline).toLocaleDateString()} {daysRemaining !== null && daysRemaining > 0 && `(${daysRemaining} days left)`}</div>}
    </div>
  );
};

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'goals', label: 'Goals' },
  { key: 'charts', label: 'Income/Expense Charts' },
  { key: 'upload', label: 'Upload Statements' },
  { key: 'chat', label: 'Chat Advisor' },
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
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const tabRefs = useRef([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      // --- New: Update goal savings after monthly data change ---
      const monthlyCol = collection(db, 'users', user.uid, 'monthlyData');
      const monthlySnap = await getDocs(monthlyCol);
      const totalSavings = monthlySnap.docs.reduce((sum, doc) => sum + Number(doc.data().savings), 0);
      const goalsCol = collection(db, 'users', user.uid, 'goals');
      const goalsSnap = await getDocs(goalsCol);
      if (!goalsSnap.empty) {
        const goalDoc = doc(goalsCol, goalsSnap.docs[0].id);
        await updateDoc(goalDoc, { savings: totalSavings });
      }
      // --- End new ---
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

  // Migrate legacy goal to subcollection if needed
  useEffect(() => {
    if (!user || !profile) return;
    const migrateGoal = async () => {
      const goalsCol = collection(db, 'users', user.uid, 'goals');
      const goalsSnap = await getDocs(goalsCol);
      if (goalsSnap.empty && profile.goal && profile.goalAmount) {
        // Migrate legacy goal
        const goalDoc = doc(goalsCol);
        await setDoc(goalDoc, {
          name: profile.goal,
          amount: profile.goalAmount,
          deadline: profile.goalDeadline || '',
          savings: profile.savings || 0,
        });
      }
    };
    migrateGoal();
  }, [user, profile]);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess('');
    try {
      // Save to subcollection (always)
      const goalsCol = collection(db, 'users', user.uid, 'goals');
      // For now, just use a single goal doc (replace or create)
      const goalsSnap = await getDocs(goalsCol);
      let goalDoc;
      if (!goalsSnap.empty) {
        goalDoc = doc(goalsCol, goalsSnap.docs[0].id);
      } else {
        goalDoc = doc(goalsCol);
      }
      await setDoc(goalDoc, {
        name: editGoalName,
        amount: Number(editGoalAmount),
        deadline: editGoalDeadline,
        savings: profile.savings || 0,
      });
      // Also update user doc for backward compatibility
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        goal: editGoalName,
        goalAmount: Number(editGoalAmount),
        goalDeadline: editGoalDeadline,
      });
      setSuccess('Goal updated successfully!');
      setEditing(false);
      // Refresh profile
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      // Refresh goals
      const newGoalsSnap = await getDocs(goalsCol);
      setGoals(newGoalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  useEffect(() => {
    if (!user) return;
    // Fetch transactions
    const fetchTransactions = async () => {
      setTxLoading(true);
      try {
        const txCol = collection(db, 'transactions', user.uid, 'items');
        const txSnap = await getDocs(txCol);
        setTransactions(txSnap.docs.map(doc => doc.data()));
      } catch {
        setTransactions([]);
      } finally {
        setTxLoading(false);
      }
    };
    // Fetch holdings
    const fetchHoldings = async () => {
      setHoldingsLoading(true);
      try {
        const hCol = collection(db, 'holdings', user.uid, 'items');
        const hSnap = await getDocs(hCol);
        setHoldings(hSnap.docs.map(doc => doc.data()));
      } catch {
        setHoldings([]);
      } finally {
        setHoldingsLoading(false);
      }
    };
    fetchTransactions();
    fetchHoldings();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch goals from Firestore
    const fetchGoals = async () => {
      setGoalsLoading(true);
      try {
        const goalsCol = collection(db, 'users', user.uid, 'goals');
        const goalsSnap = await getDocs(goalsCol);
        setGoals(goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (idx + 1) % TABS.length;
      setActiveTab(TABS[nextIdx].key);
      tabRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (idx - 1 + TABS.length) % TABS.length;
      setActiveTab(TABS[prevIdx].key);
      tabRefs.current[prevIdx]?.focus();
    }
  };

  // Sidebar keyboard accessibility
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

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

  // Calculate averages from monthlyData
  const avgIncome = monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + Number(m.income), 0) / monthlyData.length) : income;
  const avgExpenses = monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + Number(m.expenses), 0) / monthlyData.length) : expenses;
  const avgSavings = monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, m) => sum + Number(m.savings), 0) / monthlyData.length) : savings;

  // Sort monthlyData by 'YYYY-MM' string for charts
  const sortedMonthlyData = [...(monthlyLoading ? mockMonthlyData : monthlyData)].sort(
    (a, b) => (a.month || '').localeCompare(b.month || '')
  );
  // Format 'YYYY-MM' to 'Mon YYYY' for display
  const formatMonth = (ym) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Hamburger Icon */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <FaBars className="w-6 h-6 text-white" />
      </button>
      {/* Overlay Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          />
          <nav
            className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg z-50 flex flex-col pt-8 transition-transform duration-300 animate-slide-in"
            role="navigation"
            tabIndex={-1}
          >
            <div className="flex flex-col gap-2 px-6">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`w-full text-left px-4 py-3 rounded-md font-semibold text-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400
                    ${activeTab === tab.key ? 'bg-teal-600 text-white' : 'text-gray-200 hover:bg-gray-700 hover:text-teal-200'}`}
                  onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                  aria-current={activeTab === tab.key ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
      <div className="max-w-4xl mx-auto pt-8">
        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              {/* Main dashboard card (overview) */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 24, margin: '0 auto 32px auto', color: '#222' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 8, color: '#222' }}>Your Financial Dashboard</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#444' }}>Monthly Income (avg)</div>
                    <div style={{ fontWeight: 600, fontSize: 20, color: '#222' }}>{formatAmount(avgIncome)}</div>
                  </div>
                  <div style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#444' }}>Monthly Expenses (avg)</div>
                    <div style={{ fontWeight: 600, fontSize: 20, color: '#222' }}>{formatAmount(avgExpenses)}</div>
                  </div>
                  <div style={{ background: '#e3fcec', borderRadius: 8, padding: 16, textAlign: 'center', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 13, color: '#388e3c' }}>Calculated Monthly Savings (avg)</div>
                    <div style={{ fontWeight: 600, fontSize: 20, color: '#388e3c' }}>{formatAmount(avgSavings)}</div>
                  </div>
                </div>
                <div className="mt-8 flex flex-col items-center">
                  {goalsLoading ? (
                    <div className="text-center text-gray-500">Loading goal progress...</div>
                  ) : goals.length === 0 ? (
                    <div className="text-center text-gray-500">No goals yet. Set a goal to start tracking your progress!</div>
                  ) : (
                    <GoalProgressCard goal={goals[0]} />
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="animate-fade-in flex flex-col items-center">
              {/* Show all goals as cards (support for multiple goals) */}
              <div className="flex flex-wrap gap-6 justify-center mb-8">
                {goalsLoading ? (
                  <div className="text-center text-gray-500">Loading goals...</div>
                ) : goals.length === 0 ? (
                  <div className="text-center text-gray-500">No goals yet. Set a goal to start tracking your progress!</div>
                ) : (
                  goals.map(goal => <GoalProgressCard key={goal.id} goal={goal} />)
                )}
              </div>
              {/* Edit Goal and Add/Edit Monthly Data UI */}
              <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, width: '100%', color: '#222' }}>
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
              {/* Add/Edit Monthly Data UI */}
              <div style={{ marginTop: 24, maxWidth: 420, width: '100%' }}>
                <button onClick={handleAddMonthly} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}>Add Monthly Data</button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {monthlyData && monthlyData.length > 0 && sortedMonthlyData
                    .filter(m => formatMonth(m.month) !== 'Invalid Date')
                    .map((m) => (
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
                        {formatMonth(m.month)}
                      </button>
                    ))}
                </div>
                {showMonthlyForm && (
                  <form onSubmit={handleSaveMonthly} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, background: '#f6f8fa', borderRadius: 8, padding: 16 }}>
                    <input
                      type="month"
                      value={monthInput}
                      onChange={e => setMonthInput(e.target.value)}
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
          )}
          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="animate-fade-in">
              <Charts monthlyData={sortedMonthlyData.map(m => ({ ...m, month: formatMonth(m.month) }))} />
            </div>
          )}
          {/* Upload Statements Tab */}
          {activeTab === 'upload' && (
            <div className="animate-fade-in">
              <StatementUpload />
              {/* Uploaded Transactions Table */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-8 max-w-3xl mx-auto text-gray-900">
                <h3 className="text-xl font-bold mb-4 text-teal-700">Uploaded Transactions</h3>
                {txLoading ? (
                  <div>Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-gray-500">No transactions uploaded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1 bg-gray-100">Date</th>
                          <th className="border px-2 py-1 bg-gray-100">Description</th>
                          <th className="border px-2 py-1 bg-gray-100">Amount</th>
                          <th className="border px-2 py-1 bg-gray-100">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 20).map((tx, i) => (
                          <tr key={i}>
                            <td className="border px-2 py-1">{tx.date}</td>
                            <td className="border px-2 py-1">{tx.description}</td>
                            <td className="border px-2 py-1">{formatAmount(tx.amount)}</td>
                            <td className="border px-2 py-1">{formatAmount(tx.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {transactions.length > 20 && <div className="text-xs text-gray-400 mt-2">Showing first 20 transactions.</div>}
                  </div>
                )}
                {/* Transaction Summaries */}
                {transactions.length > 0 && (
                  <div className="mt-4 flex gap-8">
                    <div>Total Income: <b className="text-green-700">{formatAmount(transactions.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0))}</b></div>
                    <div>Total Expenses: <b className="text-red-700">{formatAmount(transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Number(t.amount), 0))}</b></div>
                  </div>
                )}
              </div>
              {/* Uploaded Holdings Table */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-8 max-w-3xl mx-auto text-gray-900">
                <h3 className="text-xl font-bold mb-4 text-teal-700">Uploaded Holdings</h3>
                {holdingsLoading ? (
                  <div>Loading holdings...</div>
                ) : holdings.length === 0 ? (
                  <div className="text-gray-500">No holdings uploaded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1 bg-gray-100">Name</th>
                          <th className="border px-2 py-1 bg-gray-100">Quantity</th>
                          <th className="border px-2 py-1 bg-gray-100">Avg Price</th>
                          <th className="border px-2 py-1 bg-gray-100">Current Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.slice(0, 20).map((h, i) => (
                          <tr key={i}>
                            <td className="border px-2 py-1">{h.name}</td>
                            <td className="border px-2 py-1">{h.quantity}</td>
                            <td className="border px-2 py-1">{formatAmount(h.avgPrice)}</td>
                            <td className="border px-2 py-1">{formatAmount(h.currentValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {holdings.length > 20 && <div className="text-xs text-gray-400 mt-2">Showing first 20 holdings.</div>}
                  </div>
                )}
                {/* Holdings Summary */}
                {holdings.length > 0 && (
                  <div className="mt-4 flex gap-8">
                    <div>Total Investment: <b className="text-blue-700">{formatAmount(holdings.reduce((sum, h) => sum + Number(h.avgPrice) * Number(h.quantity), 0))}</b></div>
                    <div>Current Value: <b className="text-green-700">{formatAmount(holdings.reduce((sum, h) => sum + Number(h.currentValue), 0))}</b></div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Chat Advisor Tab */}
          {activeTab === 'chat' && (
            <div className="animate-fade-in">
              <ChatAdvisor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 