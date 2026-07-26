import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { ArrowRight, Activity, Terminal, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/github', {
        method: 'POST',
      });
      const data = await res.json();
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate('/');
    } catch (err) {
      console.error('Login failed. Launching standalone sandbox experience...', err);
      // Seamless sandbox authentication bypass if backend is not started yet
      dispatch(setCredentials({ 
        token: 'mock_github_token_123', 
        user: { login: 'sandbox-guest', name: 'Sandbox Guest' } 
      }));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Activity size={36} color="var(--accent-primary)" style={{ animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>DevPulse</span>
        </div>
        <h1>Review War Room</h1>
        <p>Real-time collaborative pull request triage, interactive code diff annotations, and analytics database metrics.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px' }}>
            <Zap size={20} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Real-time Code Canvas</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Collaborative inline code comments synced immediately via WebSockets.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px' }}>
            <Terminal size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Live Simulation Engine</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulate active peer reviews and annotations with a single click.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px' }}>
            <Shield size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Postgres & SQLite Sync</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full transactional database logging of code reviews and project health indexes.</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem' }}
        >
          {loading ? 'Initializing Sandbox...' : 'Launch Application Sandbox'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Login;
