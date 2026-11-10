import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AdaptiveProgressionGraph from '../../components/AdaptiveProgressionGraph';
import { Award, CheckCircle2, XCircle, ArrowLeft, Brain, ShieldCheck, Zap, Flame, BarChart2 } from 'lucide-react';

export default function ExamResultView({ sessionId, onBackToDashboard }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.results.getSessionResult(sessionId);
        setResult(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch examination results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        Generating adaptive performance analytics...
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error || 'Result record not found'}</p>
        <button onClick={onBackToDashboard} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <button
          onClick={onBackToDashboard}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={15} />
          Return to Dashboard
        </button>
      </div>

      {/* Hero Result Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid var(--border-glow)',
        textAlign: 'center',
        padding: '2.5rem 1.5rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: result.score_percentage >= 70 ? 'var(--easy-bg)' : 'var(--medium-bg)',
          border: `2px solid ${result.score_percentage >= 70 ? 'var(--easy-color)' : 'var(--medium-color)'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: result.score_percentage >= 70 ? 'var(--easy-color)' : 'var(--medium-color)'
        }}>
          <Award size={32} />
        </div>

        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          Examination Result
        </div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {result.exam_title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Course: {result.course} • Candidate: {result.student_name} {result.student_id_number ? `(${result.student_id_number})` : ''}
        </p>

        {/* Big Score and Final Rating */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          padding: '1.25rem 2.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: result.score_percentage >= 70 ? 'var(--easy-color)' : result.score_percentage >= 50 ? 'var(--medium-color)' : 'var(--hard-color)',
            lineHeight: '1'
          }}>
            {result.score_percentage}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {result.correct_answers} Correct out of {result.total_questions} Questions
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-medium" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              <Brain size={14} /> Ability Level: {result.final_level}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-3">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--correct-bg)', color: 'var(--correct-color)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.correct_answers}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--wrong-bg)', color: 'var(--wrong-color)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incorrect</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.incorrect_answers}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attempted</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.total_questions}</div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Tier */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Questions Answered by Difficulty Level
        </h3>
        <div className="grid-3">
          <div style={{ background: 'var(--easy-bg)', border: '1px solid var(--easy-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--easy-color)', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>EASY (Level 1)</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--easy-color)' }}>
              {result.easy_count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions served</div>
          </div>

          <div style={{ background: 'var(--medium-bg)', border: '1px solid var(--medium-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--medium-color)', marginBottom: '0.5rem' }}>
              <Zap size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>MEDIUM (Level 2)</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--medium-color)' }}>
              {result.medium_count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions served</div>
          </div>

          <div style={{ background: 'var(--hard-bg)', border: '1px solid var(--hard-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--hard-color)', marginBottom: '0.5rem' }}>
              <Flame size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>HARD (Level 3)</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--hard-color)' }}>
              {result.hard_count}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions served</div>
          </div>
        </div>
      </div>

      {/* Adaptive Progression Flowchart Graph */}
      <div className="glass-card">
        <AdaptiveProgressionGraph trajectory={result.trajectory} />
      </div>
    </div>
  );
}
