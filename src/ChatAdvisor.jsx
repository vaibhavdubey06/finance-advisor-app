import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileForm from './ProfileForm';

const ChatAdvisor = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // Chat history
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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
            setProfile(docSnap.data());
            setError('');
          } else {
            setProfile(null);
            setError('');
          }
        } catch (err) {
          setError('Failed to fetch financial profile.');
        } finally {
          setFetching(false);
        }
      } else {
        setFetching(false);
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleProfileSaved = async () => {
    setFetching(true);
    setError('');
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }
    } catch {
      setError('Failed to fetch financial profile.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please log in to use the advisor.');
      setShowToast(true);
      return;
    }
    if (!profile) {
      setError('No financial profile found.');
      setShowToast(true);
      return;
    }
    if (!question.trim()) {
      setError('Please enter a question.');
      setShowToast(true);
      return;
    }
    setLoading(true);
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let newMessages;
    let apiMessages;
    if (messages.length === 0) {
      // Only show the user's question in the UI, but send the full prompt to the backend
      newMessages = [
        { role: 'user', content: question, timestamp }
      ];
      apiMessages = [
        { role: 'system', content: 'You are a friendly and knowledgeable financial advisor.' },
        { role: 'user', content: `You are a trusted personal finance advisor helping a young professional manage their money smartly.\n\nUser Profile:\n- Monthly Income: ₹${profile.income || 0}\n- Monthly Expenses: ₹${profile.expenses || 0}\n- Current Savings: ₹${profile.savings || 0}\n- Financial Goal: ${profile.goal || ''} worth ₹${profile.goalAmount || 0}, target by ${profile.goalDeadline || ''}\n\nThey asked: \"${question}\"\n\nGive friendly, practical advice. Mention if they're on track or what to adjust. Keep it clear, non-technical, and motivating.` }
      ];
    } else {
      newMessages = [...messages, { role: 'user', content: question, timestamp }];
      apiMessages = [
        ...messages.filter(m => m.role !== 'system').map(({ role, content }) => ({ role, content })),
        { role: 'user', content: question }
      ];
      // Optionally, you can prepend the system prompt to apiMessages if needed for context
      apiMessages = [
        { role: 'system', content: 'You are a friendly and knowledgeable financial advisor.' },
        ...apiMessages
      ];
    }
    setMessages(newMessages);
    setQuestion('');
    try {
      const payload = {
        model: 'llama3-70b-8192',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      };
      const response = await axios.post(
        'https://finance-advisor-app-1.onrender.com/api/chat',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...newMessages,
        { role: 'assistant', content: response.data.choices?.[0]?.message?.content || 'No response from advisor.', timestamp: replyTimestamp }
      ]);
    } catch (err) {
      setError('Failed to get response from advisor.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter/Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && question.trim()) {
        handleSubmit(e);
      }
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setError('');
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  if (!profile) {
    return <ProfileForm onProfileSaved={handleProfileSaved} />;
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, background: '#181a1b' }}>
      <h2 style={{ textAlign: 'center' }}>Chat with Your Financial Advisor</h2>
      <button onClick={handleClearChat} style={{ display: 'block', margin: '0 auto 1rem auto', background: '#f44336', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 16px', cursor: 'pointer' }}>Clear Chat</button>
      <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', background: '#23272a', padding: 12, borderRadius: 6, marginBottom: 16 }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>Ask your first question to start the conversation.</div>}
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 12 }}>
            {/* Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: msg.role === 'user' ? '#007bff' : '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, marginLeft: msg.role === 'user' ? 12 : 0, marginRight: msg.role === 'assistant' ? 12 : 0 }}>
              {msg.role === 'user' ? 'U' : 'A'}
            </div>
            {/* Chat bubble */}
            <div style={{ background: msg.role === 'user' ? '#007bff' : '#fff', color: msg.role === 'user' ? '#fff' : '#222', borderRadius: 16, padding: '10px 16px', maxWidth: '70%', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'relative' }}>
              <div style={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <div style={{ fontSize: 11, color: msg.role === 'user' ? '#cce3ff' : '#888', textAlign: 'right', marginTop: 4 }}>{msg.timestamp}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, marginRight: 12 }}>A</div>
            <div style={{ background: '#fff', color: '#222', borderRadius: 16, padding: '10px 16px', maxWidth: '70%', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', fontStyle: 'italic' }}>
              Advisor is typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Ask a financial question:
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #444', padding: 8, fontSize: 15, background: '#23272a', color: '#fff' }}
            disabled={loading}
            required
            placeholder="Type your question and press Enter..."
          />
        </label>
        <button type="submit" disabled={loading || !question.trim()} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Asking...' : 'Ask Advisor'}</button>
      </form>
      {/* Error Toast */}
      {showToast && error && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#f44336', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatAdvisor; 