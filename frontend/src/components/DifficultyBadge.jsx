import React from 'react';
import { ShieldCheck, Zap, Flame } from 'lucide-react';

export default function DifficultyBadge({ level, showIcon = true }) {
  const numLevel = Number(level);

  if (numLevel === 1) {
    return (
      <span className="badge badge-easy">
        {showIcon && <ShieldCheck size={12} />}
        Easy
      </span>
    );
  }

  if (numLevel === 3) {
    return (
      <span className="badge badge-hard">
        {showIcon && <Flame size={12} />}
        Hard
      </span>
    );
  }

  return (
    <span className="badge badge-medium">
      {showIcon && <Zap size={12} />}
      Medium
    </span>
  );
}
