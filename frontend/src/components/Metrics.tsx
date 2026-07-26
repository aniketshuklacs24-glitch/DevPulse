import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, CartesianGrid, Legend, Area 
} from 'recharts';
import { PRAnalytics } from '../store/api';
import { GitMerge, Clock, FileCode, Flame } from 'lucide-react';

interface MetricsProps {
  analytics: PRAnalytics[];
}

const Metrics = ({ analytics }: MetricsProps) => {
  // Calculate average time to merge
  const averageMergeTime = React.useMemo(() => {
    if (!analytics || analytics.length === 0) return 0;
    const total = analytics.reduce((sum, item) => sum + item.timeToMergeHours, 0);
    return (total / analytics.length).toFixed(1);
  }, [analytics]);

  // Calculate total files changed
  const totalFilesChanged = React.useMemo(() => {
    if (!analytics || analytics.length === 0) return 0;
    return analytics.reduce((sum, item) => sum + item.filesChanged, 0);
  }, [analytics]);

  // Calculate average changes
  const averageLinesAdded = React.useMemo(() => {
    if (!analytics || analytics.length === 0) return 0;
    const total = analytics.reduce((sum, item) => sum + item.linesAdded, 0);
    return Math.round(total / analytics.length);
  }, [analytics]);

  // Recharts styling configs
  const tooltipStyle = {
    backgroundColor: '#0a0a14',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontFamily: 'Outfit, sans-serif'
  };

  return (
    <div>
      {/* Top Aggregated Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.85rem', borderRadius: '10px', color: 'var(--accent-primary)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Time to Merge</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{averageMergeTime}h</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '10px', color: 'var(--success)' }}>
            <GitMerge size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total PRs Merged</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{analytics?.length || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.85rem', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
            <FileCode size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Files Modified</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalFilesChanged}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '10px', color: 'var(--warning)' }}>
            <Flame size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Lines Added</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>+{averageLinesAdded}</h3>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Chart 1: Time to Merge */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Database Audit: Time to Merge (Hours)</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="prId" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(v) => `PR #${v}`} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} unit="h" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="timeToMergeHours" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} name="Merge Time" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Code Volume Changes */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Diff Profile: Additions vs Deletions</h3>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="prId" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(v) => `PR #${v}`} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                <Area type="monotone" dataKey="linesAdded" fill="rgba(16, 185, 129, 0.15)" stroke="var(--success)" name="Lines Added" />
                <Line type="monotone" dataKey="linesRemoved" stroke="var(--danger)" strokeWidth={2} name="Lines Removed" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
