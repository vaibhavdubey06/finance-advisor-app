import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { db } from './firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp, addDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileForm from './ProfileForm';
import Typewriter from './components/Typewriter';
import ReactMarkdown from 'react-markdown';

// Blinking cursor component
const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-2 animate-blink">{visible ? '|' : ' '}</span>;
};

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
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [abortController, setAbortController] = useState(null);

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

  useEffect(() => {
    if (!user) return;
    // Fetch transactions
    const fetchTransactions = async () => {
      try {
        const txCol = collection(db, 'transactions', user.uid, 'items');
        const txSnap = await getDocs(txCol);
        setTransactions(txSnap.docs.map(doc => doc.data()));
      } catch {
        setTransactions([]);
      }
    };
    // Fetch holdings
    const fetchHoldings = async () => {
      try {
        const hCol = collection(db, 'holdings', user.uid, 'items');
        const hSnap = await getDocs(hCol);
        setHoldings(hSnap.docs.map(doc => doc.data()));
      } catch {
        setHoldings([]);
      }
    };
    fetchTransactions();
    fetchHoldings();
  }, [user]);

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

  // Load latest messages on mount or user change
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) {
        setChatHistory([]);
        setMessages([]);
        setLastVisible(null);
        setHasMore(true);
        return;
      }
      try {
        const messagesCol = collection(db, 'chats', user.uid, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'desc'), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        const msgs = [];
        snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
        const reversedMsgs = msgs.reverse();
        setChatHistory(reversedMsgs);
        
        // Convert Firestore messages to API format for conversation history
        const apiMessages = reversedMsgs.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message,
          timestamp: msg.timestamp?.toDate?.() || new Date()
        }));
        setMessages(apiMessages);
        
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.size === PAGE_SIZE);
      } catch (err) {
        setChatHistory([]);
        setMessages([]);
        setLastVisible(null);
        setHasMore(false);
      }
    };
    fetchChatHistory();
  }, [user]);

  const loadOlderMessages = async () => {
    if (!user || !lastVisible) return;
    const messagesCol = collection(db, 'chats', user.uid, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const msgs = [];
    snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
    const reversedMsgs = msgs.reverse();
    setChatHistory(prev => [...reversedMsgs, ...prev]);
    
    // Update API messages with older messages
    const apiMessages = reversedMsgs.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message,
      timestamp: msg.timestamp?.toDate?.() || new Date()
    }));
    setMessages(prev => [...apiMessages, ...prev]);
    
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.size === PAGE_SIZE);
  };

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

  // Save a message to Firestore
  const saveMessage = async (msgObj) => {
    if (!user) return;
    const messagesCol = collection(db, 'chats', user.uid, 'messages');
    await addDoc(messagesCol, msgObj);
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
    // Save user message
    const userMsg = { sender: 'user', message: question, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    await saveMessage({ ...userMsg, timestamp: serverTimestamp() });
    let txSummary = '';
    if (transactions && transactions.length > 0) {
      const totalIncome = transactions.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Number(t.amount), 0);
      txSummary = `\nRecent Transactions (sample):\n` + transactions.slice(0, 5).map(t => `- ${t.date}: ${t.description} (${t.amount})`).join('\n') + `\nTotal Income: ₹${totalIncome}, Total Expenses: ₹${totalExpenses}`;
    }
    let holdingsSummary = '';
    if (holdings && holdings.length > 0) {
      const totalInvested = holdings.reduce((sum, h) => sum + Number(h.avgPrice) * Number(h.quantity), 0);
      const totalCurrent = holdings.reduce((sum, h) => sum + Number(h.currentValue), 0);
      holdingsSummary = `\nPortfolio Holdings (sample):\n` + holdings.slice(0, 5).map(h => `- ${h.name}: Qty ${h.quantity}, Avg Price ${h.avgPrice}, Current Value ${h.currentValue}`).join('\n') + `\nTotal Invested: ₹${totalInvested}, Current Value: ₹${totalCurrent}`;
    }
    // Build the system prompt as the first message
    const systemPrompt = `You are a trusted personal finance advisor helping a young professional manage their money smartly.\n\nUser Profile:\n- Monthly Income: ₹${profile.income || 0}\n- Monthly Expenses: ₹${profile.expenses || 0}\n- Current Savings: ₹${profile.savings || 0}\n- Financial Goal: ${profile.goal || ''} worth ₹${profile.goalAmount || 0}, target by ${profile.goalDeadline || ''}${txSummary}${holdingsSummary}\n\nGive friendly, practical advice. Mention if they're on track or what to adjust. Keep it clear, non-technical, and motivating.`;
    // Prepare the full conversation for Groq (system, ...messages, new user message)
    const systemMessage = { role: 'system', content: systemPrompt };
    // Only send role/content to Groq
    const conversation = [
      systemMessage,
      ...messages,
      { role: 'user', content: question }
    ].map(({ role, content }) => ({ role, content }));
    setQuestion('');
    let localAbortController = new AbortController();
    setAbortController(localAbortController);
    try {
      // Streaming fetch with abort support
      const response = await fetch('https://finance-advisor-app-1.onrender.com/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation, stream: true }),
        signal: localAbortController.signal
      });
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      let result = '';
      let done = false;
      setMessages([...messages, { role: 'user', content: question, timestamp }, { role: 'assistant', content: '', timestamp: '' }]);
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = new TextDecoder().decode(value);
          chunk.split('\n').forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.replace('data: ', '').trim();
              if (data && data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  result += delta;
                  setMessages(prev => {
                    const updated = [...prev];
                    if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                      updated[updated.length - 1] = { ...updated[updated.length - 1], content: result };
                    }
                    return updated;
                  });
                } catch {}
              }
            }
          });
        }
      }
      // Save advisor message to Firestore after streaming is done
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const advisorMsg = { sender: 'advisor', message: result, timestamp: new Date() };
      setChatHistory(prev => [...prev, advisorMsg]);
      await saveMessage({ ...advisorMsg, timestamp: serverTimestamp() });
      // Update the timestamp for the last assistant message
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1] = { ...updated[updated.length - 1], timestamp: replyTimestamp };
        }
        return updated;
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Response stopped by user.');
      } else {
        setError('Failed to get response from advisor.');
      }
      setShowToast(true);
    } finally {
      setLoading(false);
      setAbortController(null);
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
    setChatHistory([]);
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
      <div className="min-h-[200px] max-h-[300px] overflow-y-auto bg-[#23272a] p-3 rounded mb-4">
        {hasMore && (
          <button onClick={loadOlderMessages} className="block mx-auto mb-4 bg-blue-600 text-white rounded px-4 py-1">Load older messages</button>
        )}
        {chatHistory.length === 0 && <div className="text-gray-400">Ask your first question to start the conversation.</div>}
        {chatHistory.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          const isAdvisor = msg.sender === 'advisor' || msg.sender === 'assistant';
          // Only the last advisor/assistant message gets the streaming effect
          const isLastAdvisor = isAdvisor && idx === chatHistory.length - 1;
          return (
            <div key={msg.id || idx} className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end mb-3`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${isUser ? 'bg-blue-600 text-white ml-3' : 'bg-green-500 text-white mr-3'}`}>{isUser ? '👤' : '🤖'}</div>
              {/* Chat bubble */}
              <div className={
                isUser
                  ? 'bg-blue-50 text-blue-800 rounded-lg px-4 py-2 max-w-[70%] shadow'
                  : 'bg-green-50 border-l-4 border-green-400 text-green-900 p-4 rounded shadow-md max-w-[70%]'
              }>
                <div className="text-[15px] prose prose-sm max-w-none">
                  {isLastAdvisor && loading ? (
                    <>{msg.message}<BlinkingCursor /></>
                  ) : (
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  )}
                </div>
                <div className={`text-xs mt-1 ${isUser ? 'text-blue-400 text-right' : 'text-green-600 text-right'}`}>
                  {msg.timestamp && msg.timestamp.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex flex-row items-center mb-2">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg mr-3">🤖</div>
            <div className="bg-green-50 border-l-4 border-green-400 text-green-900 p-4 rounded shadow-md max-w-[70%] italic">
              Advisor is typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Stop Generating button */}
      {loading && abortController && (
        <button onClick={() => abortController.abort()} className="bg-red-500 text-white px-4 py-2 rounded font-semibold mb-2 w-full">Stop Generating</button>
      )}
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