import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import DifficultyBadge from '../../components/DifficultyBadge';
import { Plus, Trash2, ArrowLeft, Filter, Search, CheckCircle2, ShieldCheck, Zap, Flame, AlertCircle } from 'lucide-react';

export default function QuestionBankManager({ initialExamId, onBack }) {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Question Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 2,
    topic: 'General'
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsList = await api.exams.list();
        setExams(examsList);
        if (!selectedExamId && examsList.length > 0) {
          setSelectedExamId(examsList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load exams');
      }
    };
    fetchExams();
  }, []);

  const fetchQuestions = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const data = await api.questions.listForExam(selectedExamId);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions();
    }
  }, [selectedExamId]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.questions.create(selectedExamId, {
        ...formData,
        difficulty: Number(formData.difficulty)
      });
      setIsAddModalOpen(false);
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        difficulty: 2,
        topic: 'General'
      });
      fetchQuestions();
    } catch (err) {
      alert(err.message || 'Failed to add question');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to remove this question from the bank?')) {
      try {
        await api.questions.delete(questionId);
        fetchQuestions();
      } catch (err) {
        alert(err.message || 'Failed to delete question');
      }
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesDiff = difficultyFilter === 'ALL' || q.difficulty === Number(difficultyFilter);
    const matchesSearch =
      searchTerm === '' ||
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  const easyCount = questions.filter(q => q.difficulty === 1).length;
  const mediumCount = questions.filter(q => q.difficulty === 2).length;
  const hardCount = questions.filter(q => q.difficulty === 3).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Exam Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Question Bank Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Maintain questions, options, topics, and difficulty ratings
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            style={{ width: 'auto', minWidth: '220px' }}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.course})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.15rem' }}
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Difficulty Pool Balance Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--easy-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--easy-color)', fontWeight: 600 }}>Easy (Tier 1)</span>
            <ShieldCheck size={16} color="var(--easy-color)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>{easyCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions available</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--medium-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--medium-color)', fontWeight: 600 }}>Medium (Tier 2)</span>
            <Zap size={16} color="var(--medium-color)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>{mediumCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions available</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--hard-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--hard-color)', fontWeight: 600 }}>Hard (Tier 3)</span>
            <Flame size={16} color="var(--hard-color)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>{hardCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions available</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Difficulty Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Filter Difficulty:</span>
          {['ALL', '1', '2', '3'].map((tier) => (
            <button
              key={tier}
              onClick={() => setDifficultyFilter(tier)}
              className={`btn ${difficultyFilter === tier ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              {tier === 'ALL' ? 'All (Total)' : tier === '1' ? 'Easy (1)' : tier === '2' ? 'Medium (2)' : 'Hard (3)'}
            </button>
          ))}
        </div>

        {/* Search by Text / Topic */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by topic or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingBlock: '0.45rem', fontSize: '0.85rem' }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Questions Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading question bank...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p>No questions match your current search or filter criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      #{idx + 1}
                    </span>
                    <DifficultyBadge level={q.difficulty} />
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {q.topic}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                    title="Delete Question"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {q.question_text}
                </div>

                {/* Multiple choice options grid with correct answer highlighted */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map((opt) => {
                    const isCorrect = opt.key === q.correct_answer;
                    return (
                      <div
                        key={opt.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          background: isCorrect ? 'var(--correct-bg)' : 'rgba(10, 14, 26, 0.4)',
                          border: `1px solid ${isCorrect ? 'var(--easy-border)' : 'var(--border-subtle)'}`,
                          color: isCorrect ? 'var(--correct-color)' : 'var(--text-secondary)'
                        }}
                      >
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCorrect ? 'var(--easy-color)' : 'rgba(255, 255, 255, 0.08)',
                          color: isCorrect ? '#000000' : 'var(--text-secondary)'
                        }}>
                          {opt.key}
                        </span>
                        <span style={{ flex: 1 }}>{opt.text}</span>
                        {isCorrect && <CheckCircle2 size={15} color="var(--easy-color)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Question to Bank"
        maxWidth="700px"
      >
        <form onSubmit={handleCreateQuestion}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              placeholder="Enter question statement..."
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value={1}>1 - Easy</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Topic / Category</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Data Types, OOP, Trees"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Multiple Choice Options
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    {opt}
                  </span>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder={`Option ${opt} text`}
                    value={formData[`option_${opt.toLowerCase()}`]}
                    onChange={(e) => setFormData({ ...formData, [`option_${opt.toLowerCase()}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correct Option</label>
            <select
              className="form-select"
              value={formData.correct_answer}
              onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
            >
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? 'Saving Question...' : 'Add to Question Bank'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
