import React from 'react';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';

export default function AdaptiveProgressionGraph({ trajectory }) {
  if (!trajectory || trajectory.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
        No adaptive progression data recorded yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Real-Time Adaptation Trajectory (Question-by-Question)
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Total steps: {trajectory.length}
        </div>
      </div>

      <div className="trajectory-container">
        {trajectory.map((step, idx) => (
          <React.Fragment key={idx}>
            <div 
              className={`trajectory-step ${step.is_correct ? 'correct' : 'wrong'}`}
              style={{
                boxShadow: step.is_correct 
                  ? '0 2px 8px rgba(16, 185, 129, 0.1)' 
                  : '0 2px 8px rgba(239, 68, 68, 0.1)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    Q{step.step_number}
                  </span>
                  <DifficultyBadge level={step.difficulty_level} showIcon={false} />
                  {step.is_correct ? (
                    <span style={{ color: 'var(--correct-color)', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle2 size={15} />
                    </span>
                  ) : (
                    <span style={{ color: 'var(--wrong-color)', display: 'flex', alignItems: 'center' }}>
                      <XCircle size={15} />
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  <span>Topic: {step.topic}</span>
                  {step.response_time_seconds > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={11} /> {step.response_time_seconds.toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
            </div>

            {idx < trajectory.length - 1 && (
              <div className="trajectory-arrow">
                <ArrowRight size={16} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
