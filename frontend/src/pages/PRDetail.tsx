import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { socket } from '../socket';
import { 
  ArrowLeft, Send, Terminal, MessageSquare, 
  Code, Sparkles 
} from 'lucide-react';
import { MOCK_DIFFS, DEFAULT_DIFF, PRDiff } from '../mockData';

const PRDetail = () => {
  const { owner, repo, prId } = useParams<{ owner: string; repo: string; prId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || user?.login || 'Collaborator';

  const [annotations, setAnnotations] = useState<any[]>([]);
  const [generalCommentText, setGeneralCommentText] = useState('');
  
  // Interactive line comment forms
  const [activeLineForm, setActiveLineForm] = useState<number | null>(null);
  const [inlineCommentText, setInlineCommentText] = useState('');
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // Reference for scrolling to highlighted code line
  const codeLinesRef = useRef<Record<number, HTMLDivElement | null>>({});

  // Resolve diff object
  const diffData = React.useMemo<PRDiff>(() => {
    if (prId && MOCK_DIFFS[prId]) {
      return MOCK_DIFFS[prId];
    }
    return DEFAULT_DIFF;
  }, [prId]);

  useEffect(() => {
    // Join WebSockets war room
    socket.emit('join_pr', prId);

    socket.on('sync_annotations', (data) => {
      setAnnotations(data);
    });

    socket.on('new_annotation', (annotation) => {
      setAnnotations(prev => [...prev, annotation]);
    });

    return () => {
      socket.off('sync_annotations');
      socket.off('new_annotation');
    };
  }, [prId]);

  // Handle general review comments submission
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalCommentText.trim()) return;

    const newAnnotation = {
      id: Date.now(),
      line: null,
      text: generalCommentText.trim(),
      user: userName,
      timestamp: new Date().toISOString(),
    };

    socket.emit('add_annotation', { prId, annotation: newAnnotation });
    setGeneralCommentText('');
  };

  // Handle inline code line comment submission
  const handleInlineSubmit = (lineNum: number) => {
    if (!inlineCommentText.trim()) return;

    const newAnnotation = {
      id: Date.now(),
      line: lineNum,
      text: inlineCommentText.trim(),
      user: userName,
      timestamp: new Date().toISOString(),
    };

    socket.emit('add_annotation', { prId, annotation: newAnnotation });
    setInlineCommentText('');
    setActiveLineForm(null);
  };

  // Simulate active reviewers comments
  const handleSimulateReviewers = () => {
    // Sarah reviews code inline
    setTimeout(() => {
      const simAnn1 = {
        id: Date.now() + 1,
        line: 12,
        user: 'Sarah (Lead Architect)',
        text: '⚠️ Critical review: We must ensure this token payload is parsed safely. Let\'s wrap the JWT decoding in a try-catch block to handle malformed strings.',
        timestamp: new Date().toISOString()
      };
      socket.emit('add_annotation', { prId, annotation: simAnn1 });
    }, 2000);

    // David makes general comment in war room
    setTimeout(() => {
      const simAnn2 = {
        id: Date.now() + 2,
        line: null,
        user: 'David (Senior Security)',
        text: '🔒 Verified the dependency chain. There are no known CVE injection vulnerability paths in the axios/fetch headers. High priority PR - let\'s merge this as soon as checks pass.',
        timestamp: new Date().toISOString()
      };
      socket.emit('add_annotation', { prId, annotation: simAnn2 });
    }, 5000);
  };

  // Jump to specific code line when clicking an annotation in the sidebar
  const handleJumpToLine = (lineNum: number) => {
    setHighlightedLine(lineNum);
    const element = codeLinesRef.current[lineNum];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      {/* Back button */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600, transition: 'color 0.2s' }} className="btn-secondary btn">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      {/* PR Header title */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pull Request Review War Room
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
            {owner}/{repo} <span style={{ color: 'var(--text-muted)' }}>#{prId}</span>
          </h1>
        </div>
        <button 
          onClick={handleSimulateReviewers}
          className="btn btn-primary"
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={16} /> Simulate Peer Reviewers
        </button>
      </header>

      {/* Main split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Interactive Code Diff Viewer */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="code-diff-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={16} color="var(--accent-primary)" />
              {diffData.filename}
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Click line numbers to annotate
            </span>
          </div>

          <div className="code-diff-table" style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
            {diffData.diff.map((line, idx) => {
              const lineAnn = annotations.filter(ann => ann.line === line.lineNum);
              const isFormOpen = activeLineForm === line.lineNum;
              const isHighlighted = highlightedLine === line.lineNum;

              return (
                <div key={idx} style={{ display: 'table-row-group' }}>
                  {/* The Code Line Row */}
                  <div 
                    ref={el => { codeLinesRef.current[line.lineNum] = el; }}
                    className={`code-diff-line ${line.type} ${isHighlighted ? 'highlighted' : ''}`}
                    style={{ 
                      display: 'table-row',
                      borderLeft: isHighlighted ? '4px solid var(--accent-secondary)' : 'none',
                      backgroundColor: isHighlighted ? 'rgba(236, 72, 153, 0.08)' : undefined
                    }}
                  >
                    <div 
                      className="line-number"
                      onClick={() => {
                        setActiveLineForm(isFormOpen ? null : line.lineNum);
                        setInlineCommentText('');
                      }}
                    >
                      {line.lineNum}
                    </div>
                    <div className="code-content">{line.content}</div>
                  </div>

                  {/* Inline Annotations List for this Line */}
                  {lineAnn.map(ann => (
                    <div key={ann.id} style={{ display: 'table-row' }}>
                      <div className="line-number" style={{ background: 'var(--bg-tertiary)' }}></div>
                      <div style={{ display: 'table-cell' }}>
                        <div className="inline-annotation-container animate-fade-in">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="comment-avatar">
                                {ann.user[0].toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--accent-tertiary)', fontSize: '0.9rem' }}>
                                {ann.user}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(ann.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ann.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Inline Form to add comment under this Line */}
                  {isFormOpen && (
                    <div style={{ display: 'table-row' }}>
                      <div className="line-number" style={{ background: 'var(--bg-tertiary)' }}></div>
                      <div style={{ display: 'table-cell', padding: '1rem' }}>
                        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--accent-primary)' }}>
                          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Add Comment on Line {line.lineNum}
                          </h4>
                          <textarea 
                            value={inlineCommentText}
                            onChange={e => setInlineCommentText(e.target.value)}
                            className="form-input"
                            placeholder="State your review comments..."
                            rows={3}
                            style={{ width: '100%', resize: 'none', marginBottom: '0.75rem', fontSize: '0.9rem' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setActiveLineForm(null)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleInlineSubmit(line.lineNum)}
                              className="btn btn-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              Add Annotation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live War Room Sidebar Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '650px', position: 'sticky', top: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} color="var(--accent-secondary)" />
            Live War Room
          </h2>
          
          {/* Timeline stream of annotations */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem', marginBottom: '1.25rem' }}>
            {annotations.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No reviewer activity logged yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click lines to annotate or use simulation!</p>
              </div>
            ) : (
              annotations.map(ann => {
                const isLineComment = ann.line !== null;
                return (
                  <div 
                    key={ann.id} 
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      padding: '1rem', 
                      borderRadius: '10px',
                      border: isLineComment ? '1px solid rgba(139, 92, 246, 0.15)' : '1px solid var(--border-color)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>
                          {ann.user}
                        </span>
                        {isLineComment && (
                          <button 
                            onClick={() => handleJumpToLine(ann.line)}
                            style={{ 
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: 'var(--accent-tertiary)',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Line {ann.line}
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(ann.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>{ann.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* General comment submission form */}
          <form onSubmit={handleGeneralSubmit} style={{ marginTop: 'auto' }}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input 
                value={generalCommentText}
                onChange={e => setGeneralCommentText(e.target.value)}
                className="form-input" 
                placeholder="Log a general review comment..."
                autoComplete="off"
                style={{ fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              <Send size={16} /> Broadcast Log
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PRDetail;
