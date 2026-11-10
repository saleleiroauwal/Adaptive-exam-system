import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { Plus, BookOpen, HelpCircle, CheckCircle2, Clock, Trash2, Edit3, Eye, ToggleLeft, ToggleRight, AlertCircle, Database } from 'lucide-react';

export default function AdminDashboard({ onNavigateToQuestions, onNavigateToAnalytics }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Exam Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    description: '',
    duration_minutes: 30,
    total_questions: 10
  });
  const [creating, setCreating] = useState(false);

  const fetchExams = async () => {
    try {
      const data = await api.exams.list();
      setExams(data);
    } catch (err) {
      setError(err.message || 'Failed to load examinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.exams.create({
        ...formData,
        duration_minutes: Number(formData.duration_minutes),
        total_questions: Number(formData.total_questions)
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        course: '',
        description: '',
        duration_minutes: 30,
        total_questions: 10
      });
      fetchExams();
    } catch (err) {
      alert(err.message || 'Failed to create exam');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (examId) => {
    try {
      await api.exams.togglePublish(examId);
      fetchExams();
    } catch (err) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  const handleDeleteExam = async (examId, title) => {
    if (window.confirm(`Are you sure you want to delete the exam "${title}"? This will delete all its questions, sessions, and student results.`)) {
      try {
        await api.exams.delete(examId);
        fetchExams();
      } catch (err) {
        alert(err.message || 'Failed to delete exam');
      }
    }
  };

  const totalBankQuestions = exams.reduce((acc, curr) => acc + (curr.total_questions_in_bank || 0), 0);
  const publishedCount = exams.filter(e => e.status === 'PUBLISHED').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner with Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>Lecturer Administration Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Configure adaptive exams, manage difficulty pools, and analyze student response progressions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} />
          Create New Exam
        </button>
      </div>

      {/* Summary Statistics Metric Cards */}
      <div className="grid-4">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Exams</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {exams.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '0.25rem' }}>Active configurations</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Published Exams</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--easy-color)', marginTop: '0.25rem' }}>
            {publishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Available to students</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Questions in Bank</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {totalBankQuestions}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Across Easy/Med/Hard</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Real-Time Engine</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--medium-color)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={18} /> Ready
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Real-time dynamic scaling</div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--wrong-bg)', border: '1px solid var(--hard-border)', color: '#fca5a5', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      {/* Examinations Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Created Examinations
        </h3>

        {exams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>No examinations found. Click "Create New Exam" to begin.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Exam Title & Course</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Questions Limit</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Question Bank Pool</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exam.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>{exam.course}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> {exam.duration_minutes} mins
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {exam.total_questions} items
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-easy" title="Easy Questions">{exam.easy_questions_count} E</span>
                        <span className="badge badge-medium" title="Medium Questions">{exam.medium_questions_count} M</span>
                        <span className="badge badge-hard" title="Hard Questions">{exam.hard_questions_count} H</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({exam.total_questions_in_bank} total)</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleTogglePublish(exam.id)}
                        className={`badge ${exam.status === 'PUBLISHED' ? 'badge-easy' : 'badge-primary'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle published status"
                      >
                        {exam.status}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => onNavigateToQuestions(exam.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          title="Manage Questions in Bank"
                        >
                          <Database size={14} />
                          Bank
                        </button>
                        <button
                          onClick={() => onNavigateToAnalytics(exam.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          title="View Student Results"
                        >
                          <Eye size={14} />
                          Results
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                          title="Delete Examination"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Adaptive Examination"
      >
        <form onSubmit={handleCreateExam}>
          <div className="form-group">
            <label className="form-label">Examination Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Adaptive Operating Systems & Concurrency"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course / Subject Code</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. CSC 305"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Provide context and candidate instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={240}
                required
                className="form-input"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Questions per Session</label>
              <input
                type="number"
                min={3}
                max={100}
                required
                className="form-input"
                value={formData.total_questions}
                onChange={(e) => setFormData({ ...formData, total_questions: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? 'Creating...' : 'Create Examination'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
