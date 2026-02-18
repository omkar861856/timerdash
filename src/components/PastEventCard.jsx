import React from 'react';
import { Trash2, History } from 'lucide-react';

const PastEventCard = ({ event, currentTime, onDelete }) => {
  const elapsed = currentTime - new Date(event.date);
  const totalSeconds = Math.floor(elapsed / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const units = [
    { label: 'days',    value: days },
    { label: 'hours',   value: hours },
    { label: 'minutes', value: minutes },
    { label: 'seconds', value: seconds },
  ];

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        borderLeft: '3px solid rgba(248,113,113,0.4)',
        opacity: 0.9,
      }}
    >
      {/* Delete button */}
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
        <button
          onClick={() => onDelete(event.id)}
          className="btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
        >
          <Trash2 size={15} color="#f87171" style={{ opacity: 0.7 }} />
        </button>
      </div>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <History size={14} color="#f87171" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{event.name}</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
          {' · '}
          {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Elapsed time grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
        {units.map(({ label, value }, i) => (
          <div
            key={label}
            className="glass-card"
            style={{
              padding: '0.75rem 0.25rem',
              borderRadius: '12px',
              background: 'rgba(248, 113, 113, 0.07)',
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f87171', letterSpacing: '-0.02em' }}>
              {i === 0 ? '-' : ''}{value.toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Footer label */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#f87171', fontWeight: '500', opacity: 0.8 }}>
        Time elapsed since this event
      </div>
    </div>
  );
};

export default PastEventCard;
