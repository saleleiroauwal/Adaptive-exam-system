import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, Lock, Mail, User, BookOpen, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    student_id_number: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px var(--primary-glow)'
          }}>
            <Brain size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Register to take adaptive examinations or manage exams
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--wrong-bg)',
            border: '1px solid var(--hard-border)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector buttons */}
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                className={`btn ${formData.role === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
              >
                <GraduationCap size={16} />
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                className={`btn ${formData.role === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
              >
                <ShieldCheck size={16} />
                Lecturer / Admin
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Alan Turing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {formData.role === 'STUDENT' && (
            <div className="form-group">
              <label className="form-label">Student ID / Matric Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. CSC/2026/042"
                  value={formData.student_id_number}
                  onChange={(e) => setFormData({ ...formData, student_id_number: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <BookOpen size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Department / Faculty</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Computer Science & Engineering"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
