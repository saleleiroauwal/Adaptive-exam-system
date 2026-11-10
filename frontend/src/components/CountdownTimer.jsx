import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ initialSeconds, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsLeft < 300; // less than 5 minutes
  const isCriticalTime = secondsLeft < 60; // less than 1 minute

  let colorStyle = {
    background: 'var(--bg-surface-elevated)',
    borderColor: 'var(--border-subtle)',
    color: 'var(--text-primary)'
  };

  if (isCriticalTime) {
    colorStyle = {
      background: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'var(--hard-color)',
      color: '#f87171',
      animation: 'pulseGlow 1s infinite alternate'
    };
  } else if (isLowTime) {
    colorStyle = {
      background: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'var(--medium-color)',
      color: '#fbbf24'
    };
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.45rem 0.9rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid',
      fontWeight: 700,
      fontFamily: 'monospace',
      fontSize: '1rem',
      letterSpacing: '0.05em',
      ...colorStyle
    }}>
      <Clock size={16} />
      <span>{formattedTime}</span>
    </div>
  );
}
