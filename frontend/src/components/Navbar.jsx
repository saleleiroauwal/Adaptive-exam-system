import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User, LayoutDashboard, Database, BarChart3, BookOpen } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div 
          onClick={() => setCurrentView('dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            cursor: 'pointer' 
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>
              Adaptive<span style={{ color: 'var(--primary-light)' }}>AI</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Exam System
            </span>
          </div>
        </div>

        {/* Navigation items based on role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>

          {isAdmin ? (
            <>
              <button
                onClick={() => setCurrentView('question_bank')}
                className={`btn ${currentView === 'question_bank' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                <Database size={15} />
                Question Bank
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`btn ${currentView === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                <BarChart3 size={15} />
                Student Results & Trajectory
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentView('my_results')}
              className={`btn ${currentView === 'my_results' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <BookOpen size={15} />
              My Results
            </button>
          )}
        </div>
      </div>

      {/* User profile info & logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'right' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {user.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
              <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-easy'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                {user.role}
              </span>
              {user.student_id_number && (
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {user.student_id_number}
                </span>
              )}
            </div>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <User size={18} />
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          title="Log Out"
          style={{ padding: '0.45rem 0.65rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
