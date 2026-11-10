import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import AdaptiveProgressionGraph from '../../components/AdaptiveProgressionGraph';
import { ArrowLeft, Award, Eye, Clock, CheckCircle2, XCircle, AlertCircle, BarChart3, Users } from 'lucide-react';

export default function StudentAnalytics({ initialExamId, onBack }) {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trajectory inspection modal state
  const [inspectedSession, setInspectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsList = await api.exams.list();
        setExams(examsList);
        if (!selectedExamId && examsList.length > 0) {
          setSelectedExamId(examsList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load examinations');
      }
    };
    fetchExams();
  }, []);

  const fetchResults = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const data = await api.results.getExamResultsForAdmin(selectedExamId);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchResults();
    }
  }, [selectedExamId]);

  const handleInspect = (result) => {
    setInspectedSession(result);
    setIsModalOpen(true);
  };

  const averageScore = results.length > 0
    ? (results.reduce((acc, r) => acc + r.score_percentage, 0) / results.length).toFixed(1)
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Exam Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Student Results & Adaptive Analytics</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Inspect candidate scores, difficulty progression, and real-time adaptation steps
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Exam:</label>
          <select
            className="form-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{ width: 'auto', minWidth: '240px' }}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.course})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submissions</span>
            <Users size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{results.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed sessions</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Score</span>
            <BarChart3 size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{averageScore}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class-wide average</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Adaptive Engine</span>
            <Award size={18} color="var(--easy-color)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--easy-color)' }}>
            Real-Time Verified
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per-student calibrated</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Candidate Performance Records
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading student results...
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>No student results have been recorded for this examination yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name & ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Score (%)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Correct / Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assessed Level</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Questions Served (E / M / H)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Completed At</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Adaptive Path</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.student_id_number || 'No ID specified'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: r.score_percentage >= 70 ? 'var(--easy-color)' : r.score_percentage >= 50 ? 'var(--medium-color)' : 'var(--hard-color)'
                      }}>
                        {r.score_percentage}%
                      </span>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {r.correct_answers} / {r.total_questions}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-medium" style={{ fontSize: '0.75rem' }}>
                        {r.final_level}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="badge badge-easy" title="Easy questions">{r.easy_count} E</span>
                        <span className="badge badge-medium" title="Medium questions">{r.medium_count} M</span>
                        <span className="badge badge-hard" title="Hard questions">{r.hard_count} H</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(r.completed_at).toLocaleDateString()} {new Date(r.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleInspect(r)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} />
                        Inspect Trajectory
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trajectory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adaptive Trajectory: ${inspectedSession?.student_name}`}
        maxWidth="850px"
      >
        {inspectedSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{inspectedSession.student_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>{inspectedSession.student_id_number}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Final Score</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: inspectedSession.score_percentage >= 70 ? 'var(--easy-color)' : 'var(--medium-color)' }}>
                  {inspectedSession.score_percentage}% ({inspectedSession.correct_answers}/{inspectedSession.total_questions})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ability Classification</div>
                <span className="badge badge-medium">{inspectedSession.final_level}</span>
              </div>
            </div>

            {/* Visual Step-by-Step Graph */}
            <AdaptiveProgressionGraph trajectory={inspectedSession.trajectory} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Close Inspection
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
