import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import CountdownTimer from '../../components/CountdownTimer';
import { Brain, ArrowRight, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function ActiveExamInterface({ initialSessionData, onExamCompleted }) {
  const [session, setSession] = useState(initialSessionData);
  const [currentQuestion, setCurrentQuestion] = useState(initialSessionData.current_question);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track response time in seconds
  const questionStartTimeRef = useRef(Date.now());

  useEffect(() => {
    // Reset timer on question change
    questionStartTimeRef.current = Date.now();
    setSelectedOption('');
    setError('');
  }, [currentQuestion?.id]);

  const handleSelectOption = (letter) => {
    if (!submitting) {
      setSelectedOption(letter);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      setError('Please select an option before proceeding to the next question.');
      return;
    }

    setSubmitting(true);
    setError('');

    const elapsedSeconds = (Date.now() - questionStartTimeRef.current) / 1000.0;

    try {
      const response = await api.sessions.submitAnswer(session.session_id, {
        question_id: currentQuestion.id,
        selected_answer: selectedOption,
        response_time_seconds: elapsedSeconds
      });

      if (response.is_completed) {
        onExamCompleted(session.session_id);
      } else {
        // Advance to next dynamically adapted question
        setCurrentQuestion(response.next_question);
        setSession((prev) => ({
          ...prev,
          current_question_index: response.current_question_index,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = async () => {
    try {
      await api.sessions.finalize(session.session_id);
      onExamCompleted(session.session_id);
    } catch {
      onExamCompleted(session.session_id);
    }
  };

  const handleEarlyFinalize = async () => {
    if (window.confirm('Are you sure you want to end and submit this examination now? Unanswered questions will count as incomplete.')) {
      setSubmitting(true);
      try {
        await api.sessions.finalize(session.session_id);
        onExamCompleted(session.session_id);
      } catch (err) {
        setError(err.message || 'Failed to finalize examination.');
        setSubmitting(false);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        Calibrating examination question...
      </div>
    );
  }

  const progressPercentage = Math.round(
    ((session.current_question_index - 1) / session.total_questions) * 100
  );

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Status & Timer Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ongoing Adaptive Examination
            </span>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              {session.exam_title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CountdownTimer
              initialSeconds={currentQuestion.remaining_seconds || 1800}
              onTimeUp={handleTimeUp}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            <span>Question <strong>{session.current_question_index}</strong> of <strong>{session.total_questions}</strong></span>
            <span>{progressPercentage}% Completed</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--wrong-bg)', border: '1px solid var(--hard-border)', color: '#fca5a5', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Question Card */}
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
            Topic: {currentQuestion.topic || 'General'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Brain size={15} color="var(--primary-light)" />
            AI Calibrated
          </div>
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          marginBottom: '2rem',
          fontWeight: 600
        }}>
          {currentQuestion.question_text}
        </h3>

        {/* Multiple Choice Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`option-item ${isSelected ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') handleSelectOption(opt.key);
                }}
              >
                <div className="option-marker">
                  {opt.key}
                </div>
                <div style={{ fontSize: '0.975rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>
                  {opt.text}
                </div>
                {isSelected && (
                  <CheckCircle2 size={18} color="var(--primary-light)" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button
            type="button"
            onClick={handleEarlyFinalize}
            disabled={submitting}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Finalize & Submit Exam
          </button>

          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={submitting || !selectedOption}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            {submitting ? 'Analyzing Response...' : session.current_question_index === session.total_questions ? 'Submit Final Answer' : 'Submit & Next Question'}
            {!submitting && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}
