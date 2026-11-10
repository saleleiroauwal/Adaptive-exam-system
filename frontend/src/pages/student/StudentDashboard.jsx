import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, HelpCircle, CheckCircle2, ChevronRight, Award, Flame, AlertCircle } from 'lucide-react';

export default function StudentDashboard({ onSelectExam, onViewResult }) {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsData, resultsData] = await Promise.all([
          api.exams.list(),
          api.results.getMyResults()
        ]);
        setExams(examsData);
        setResults(resultsData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        Loading examination portal...
      </div>
    );
  }

  const completedExamIds = new Set(results.map(r => r.exam_id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Hero Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid var(--border-glow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
              Student Portal
            </span>
            {user.student_id_number && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ID: {user.student_id_number}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Select an examination below to begin. Questions will dynamically calibrate in difficulty in real time based on your ongoing answers.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--wrong-bg)', border: '1px solid var(--hard-border)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      {/* Available Adaptive Exams Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>Available Examinations</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Adaptive tests currently active and published</p>
          </div>
          <span className="badge badge-medium">
            {exams.length} Available
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>No active examinations are currently published by lecturers.</p>
          </div>
        ) : (
          <div className="grid-2">
            {exams.map((exam) => {
              const isTaken = completedExamIds.has(exam.id);
              const pastResult = results.find(r => r.exam_id === exam.id);

              return (
                <div key={exam.id} className="glass-card interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {exam.course}
                      </span>
                      {isTaken && (
                        <span className="badge badge-easy" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} />
                          Attempted ({pastResult?.score_percentage}%)
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {exam.description || 'Comprehensive real-time adaptive examination.'}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      padding: '0.75rem 0',
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '1rem',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={15} color="var(--accent-cyan)" />
                        {exam.duration_minutes} Mins
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <HelpCircle size={15} color="var(--primary-light)" />
                        {exam.total_questions} Adaptive Questions
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Flame size={15} color="var(--medium-color)" />
                        Real-Time Scaling
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => onSelectExam(exam)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        {isTaken ? 'Retake Exam' : 'Start Examination'}
                        <ChevronRight size={16} />
                      </button>

                      {isTaken && pastResult && (
                        <button
                          onClick={() => onViewResult(pastResult.session_id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.85rem' }}
                        >
                          View Result
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Performance & Completed Exams */}
      {results.length > 0 && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>Your Completed Examinations</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historical adaptive performances and calculated ability ratings</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((res) => (
              <div 
                key={res.id} 
                className="glass-card" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{res.exam_title}</h4>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{res.course}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Completed on {new Date(res.completed_at).toLocaleDateString()} at {new Date(res.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: res.score_percentage >= 70 ? 'var(--easy-color)' : res.score_percentage >= 50 ? 'var(--medium-color)' : 'var(--hard-color)' }}>
                      {res.score_percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {res.correct_answers} / {res.total_questions} Correct
                    </div>
                  </div>

                  <span className="badge badge-medium" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                    <Award size={13} /> {res.final_level}
                  </span>

                  <button
                    onClick={() => onViewResult(res.session_id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.825rem', padding: '0.5rem 0.9rem' }}
                  >
                    Inspect Trajectory
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
