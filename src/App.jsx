import React, { useEffect, useState } from 'react';
import ChatAdvisor from './ChatAdvisor';
import Login from './Login';
import Dashboard from './Dashboard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#f9f9f9', padding: '2rem 0' }}>
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 10, background: '#fff', marginBottom: 32 }}>
        {user ? <Dashboard /> : null}
      </div>
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderRadius: 10, background: '#fff' }}>
        {user ? <ChatAdvisor /> : <Login />}
      </div>
    </div>
  );
}

export default App;
