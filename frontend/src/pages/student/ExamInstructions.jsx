import React, { useState } from 'react';
import { api } from '../../services/api';
import { Brain, Clock, HelpCircle, ArrowLeft, Play, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';

export default function ExamInstructions({ exam, onBack, onStartExam }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setError('');
    setStarting(true);
    try {
      const sessionData = await api.sessions.start(exam.id);
      onStartExam(sessionData);
    } catch (err) {
      setError(err.message || 'Failed to start examination');
      setStarting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-primary">{exam.course}</span>
          <span className="badge badge-medium">Real-Time Adaptive</span>
        </div>

        <h1 style={{ fontSize: '1.85rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {exam.title}
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {exam.description || 'You are about to begin an adaptive assessment where question difficulty calibrates based on your answers.'}
        </p>

        {error && (
          <div style={{ background: 'var(--wrong-bg)', border: '1px solid var(--hard-border)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Quick parameters grid */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
              <Clock size={18} />
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{exam.duration_minutes} Minutes</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous countdown</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)', marginBottom: '0.35rem' }}>
              <HelpCircle size={18} />
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Questions</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{exam.total_questions} Questions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dynamically selected</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--medium-color)', marginBottom: '0.35rem' }}>
              <Zap size={18} />
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Initial Level</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Medium (Level 2)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calibrates upwards/downwards</div>
          </div>
        </div>

        {/* How Adaptive AI Engine Works card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Brain size={18} color="var(--primary-light)" />
            Real-Time Adaptive Mechanism
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--easy-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Correct Answer:</strong> The system immediately increases the difficulty of the next question (Medium &rarr; Hard).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--hard-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Incorrect Answer:</strong> The system decreases the difficulty of the next question (Hard &rarr; Medium &rarr; Easy).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Session Exclusivity:</strong> The system will never present any question you have already answered during this session.</span>
            </li>
          </ul>
        </div>

        {/* Important Rules notice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--medium-border)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <ShieldAlert size={20} color="var(--medium-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong>Important Examination Rules:</strong> Once started, your answers are locked immediately upon submission. Do not refresh or navigate away from the browser window while an active examination session is in progress.
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
        >
          {starting ? 'Initializing Adaptive Session...' : 'I Am Ready — Begin Examination'}
          {!starting && <Play size={18} />}
        </button>
      </div>
    </div>
  );
}
