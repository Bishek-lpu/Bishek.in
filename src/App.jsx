import React, { useState, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import './index.css'; // Make sure the styles are applied

function App() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'pending', 'success', 'error'
  const [showTurnstile, setShowTurnstile] = useState(false);
  const turnstileRef = useRef(null);

  // Cloudflare Turnstile Client Key
  const SITE_KEY = '0x4AAAAAADRE2JQBHXXLaRy0';

  const handleVerify = () => {
    if (token) {
      // In a real app, you would send this token to your backend
      setStatus('success');
      console.log('Verified! Token:', token);
    } else {
      setShowTurnstile(true);
      setStatus('pending');
    }
  };

  const resetVerification = () => {
    setToken(null);
    setStatus('idle');
    setShowTurnstile(false);
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1 className="title">Secure Verify</h1>
        <p className="subtitle">Protecting your app with modern bot detection.</p>
        
        <div className="status-container">
          {status === 'idle' && (
            <span className="status-badge status-idle">
              Ready to verify
            </span>
          )}
          {status === 'pending' && (
            <span className="status-badge status-pending">
              Awaiting verification...
            </span>
          )}
          {status === 'success' && (
            <span className="status-badge status-success">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Verification Successful
            </span>
          )}
        </div>

        {showTurnstile && status !== 'success' && (
          <div className="turnstile-wrapper">
            <Turnstile
              ref={turnstileRef}
              siteKey={SITE_KEY}
              onSuccess={(t) => {
                setToken(t);
                // Auto-verify if user solves it
                setStatus('success');
              }}
              onError={() => setStatus('error')}
              onExpire={() => {
                setToken(null);
                setStatus('idle');
              }}
              options={{
                theme: 'dark',
              }}
            />
          </div>
        )}

        <div className="actions">
          {status !== 'success' ? (
            <button 
              className="action-btn"
              onClick={handleVerify}
              disabled={status === 'pending' && !token}
            >
              {showTurnstile ? 'Verifying...' : 'Show Verification'}
            </button>
          ) : (
            <button 
              className="action-btn"
              onClick={resetVerification}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
