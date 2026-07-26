import React, { useState } from 'react';
import { useGetPullRequestsQuery, useGetAnalyticsQuery } from '../store/api';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { 
  Activity, GitPullRequest, Users, Search, 
  Database, LogOut, Terminal 
} from 'lucide-react';
import Metrics from '../components/Metrics';
import { MOCK_PRS, DEFAULT_MOCK_PRS } from '../mockData';

const PRESETS = [
  { name: 'React', owner: 'facebook', repo: 'react' },
  { name: 'Next.js', owner: 'vercel', repo: 'next.js' },
  { name: 'Tailwind CSS', owner: 'tailwindlabs', repo: 'tailwindcss' }
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [owner, setOwner] = useState('facebook');
  const [repo, setRepo] = useState('react');
  const [searchOwner, setSearchOwner] = useState('facebook');
  const [searchRepo, setSearchRepo] = useState('react');

  // Fetch real github API pull requests
  const { data: rawPrs, isLoading, error } = useGetPullRequestsQuery({ owner, repo });

  // Fetch PostgreSQL/SQLite analytics metrics
  const { data: analytics } = useGetAnalyticsQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOwner(searchOwner);
    setRepo(searchRepo);
  };

  const handlePresetClick = (o: string, r: string) => {
    setOwner(o);
    setRepo(r);
    setSearchOwner(o);
    setSearchRepo(r);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Determine fallback PRs when Github API errors or rate-limits
  const prs = React.useMemo(() => {
    if (rawPrs && rawPrs.length > 0) return rawPrs;
    // Look up local mock repository
    const key = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
    const matched = Object.keys(MOCK_PRS).find(k => k.toLowerCase() === key);
    return matched ? MOCK_PRS[matched] : DEFAULT_MOCK_PRS;
  }, [rawPrs, owner, repo]);

  const isMockFallback = !rawPrs && error;

  return (
    <div className="dashboard-layout">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Activity size={24} color="var(--accent-primary)" style={{ animation: 'pulse 2s infinite' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>DevPulse</h2>
        </div>

        {/* Engine status indicator */}
        <div style={{ marginTop: '-0.5rem' }}>
          {isMockFallback ? (
            <span className="badge-engine mock">
              <Terminal size={12} /> Sandbox Mode (Mock Fallback)
            </span>
          ) : (
            <span className="badge-engine live">
              <Database size={12} /> Live Engine Active
            </span>
          )}
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Repository Owner</label>
            <input 
              value={searchOwner} 
              onChange={e => setSearchOwner(e.target.value)} 
              className="form-input" 
              placeholder="e.g. facebook"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Repository Name</label>
            <input 
              value={searchRepo} 
              onChange={e => setSearchRepo(e.target.value)} 
              className="form-input" 
              placeholder="e.g. react"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Search size={18} /> Load Repository
          </button>
        </form>

        {/* Quick Presets Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Quick Presets
          </h3>
          <div className="preset-badges">
            {PRESETS.map((p, idx) => {
              const isActive = owner === p.owner && repo === p.repo;
              return (
                <button 
                  key={idx} 
                  onClick={() => handlePresetClick(p.owner, p.repo)}
                  className={`preset-badge ${isActive ? 'active' : ''}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active team war room participants */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginTop: 'auto' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="var(--accent-primary)" />
            Live Reviewers
          </h3>
          <div className="live-users-list">
            <div className="live-user-item">
              <div className="pulse-dot"></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Sarah (Lead Architect)
              </span>
            </div>
            <div className="live-user-item">
              <div className="pulse-dot"></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                David (Senior Security)
              </span>
            </div>
            <div className="live-user-item">
              <div className="pulse-dot"></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {user?.name || 'You'} (Sandbox Guest)
              </span>
            </div>
          </div>
        </div>

        {/* Log Out button */}
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
        >
          <LogOut size={14} /> Exit War Room
        </button>
      </aside>

      {/* Main dashboard content */}
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>{owner} / {repo}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Real-time collaboration diagnostics, code-diff annotations, and Git telemetry.
            </p>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Signed in as: </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>{user?.login || 'guest'}</span>
          </div>
        </header>

        {/* DB Metrics Section */}
        {analytics && <Metrics analytics={analytics} />}

        {/* PR list grid */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitPullRequest size={20} color="var(--accent-secondary)" /> 
              Collaborative Triage Pull Requests
            </h2>
            {isMockFallback && (
              <span style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                * Using sandbox data (GitHub API rate-limit threshold met)
              </span>
            )}
          </div>
          
          {isLoading && <div style={{ color: 'var(--text-secondary)' }}>Querying GitHub API...</div>}
          
          <div className="pr-list">
            {prs?.map(pr => (
              <Link 
                to={`/pr/${owner}/${repo}/${pr.number}`} 
                key={pr.id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card pr-item">
                  <div>
                    <h3 className="pr-item-title">
                      {pr.title} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>#{pr.number}</span>
                    </h3>
                    <div className="pr-item-meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {pr.user.avatar_url ? (
                          <img 
                            src={pr.user.avatar_url} 
                            alt={pr.user.login} 
                            style={{ width: 18, height: 18, borderRadius: '50%' }}
                          />
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-primary)', fontSize: 10, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                            {pr.user.login[0].toUpperCase()}
                          </div>
                        )}
                        <span>{pr.user.login}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`pr-status ${pr.state}`}>
                    {pr.state}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
