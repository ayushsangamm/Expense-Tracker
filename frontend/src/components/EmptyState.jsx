// frontend/src/components/EmptyState.jsx
// Visual component to render when list queries find no entries.

import React from 'react';
import { CalendarRange, Plus } from 'lucide-react';

const EmptyState = ({
  title = 'No transactions recorded',
  message = 'Add your first income or expense to begin tracking your financial flows.',
  buttonText = 'Add Transaction',
  onActionClick,
  icon: Icon = CalendarRange,
}) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center p-10 py-16 border-dashed border-zinc-800/80 bg-zinc-950/20">
      {/* Illustrative circular floating icon badge */}
      <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-cardBorder flex items-center justify-center text-zinc-500 mb-5 animate-float shadow-inner">
        <Icon size={28} />
      </div>

      <h3 className="text-zinc-200 font-bold text-lg mb-1">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onActionClick && (
        <button
          onClick={onActionClick}
          className="btn-primary flex items-center gap-1.5 shadow-primary-600/10 px-4 py-2 text-sm rounded-xl font-medium"
        >
          <Plus size={16} />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
