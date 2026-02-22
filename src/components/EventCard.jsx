import React from 'react';
import { Trash2, Clock, Repeat, Plus } from 'lucide-react';
import { getEventStatus, formatRecurrence } from '../utils/eventUtils';

const EventCard = ({ event, currentTime, onDelete, onEdit }) => {
  const timeLeft = getEventStatus(event, currentTime || new Date());
  const nextTarget = timeLeft.target;
  const isExpired = timeLeft.expired;

  return (
    <div className="glass-card p-6 animate-fade-in flex flex-direction-column gap-4 relative" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.25rem' }}>
        <button 
          onClick={onEdit}
          className="btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
        >
          <Plus size={16} className="text-muted" />
        </button>
        <button 
          onClick={() => onDelete(event.id)}
          className="btn-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
        >
          <Trash2 size={16} color="#f87171" style={{ opacity: 0.8 }} />
        </button>
      </div>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{event.name}</h3>
          {event.isRepeating && <Repeat size={14} color={timeLeft.isActive ? '#f87171' : 'var(--primary)'} />}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {event.isRepeating 
            ? timeLeft.isActive ? 'Action Required' : formatRecurrence(event)
            : (() => {
                const s = new Date(event.startDate || event.date);
                const sStr = s.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (!event.endDate) return sStr;
                const e = new Date(event.endDate);
                const eStr = e.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `${sStr} to ${eStr}`;
              })()
          }
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
          <div key={unit} className="glass-card" style={{ padding: '0.75rem 0.25rem', borderRadius: '12px', background: timeLeft.isActive ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isExpired ? 'var(--text-muted)' : (timeLeft.isActive ? '#f87171' : 'var(--primary)') }}>
              {timeLeft[unit].toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {unit}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: timeLeft.isActive ? '#f87171' : 'var(--text-muted)', fontWeight: timeLeft.isActive ? '600' : '400' }}>
        {isExpired 
          ? (event.isRepeating ? 'All rounds completed' : 'Event has passed')
          : timeLeft.isActive 
            ? `DUE NOW - Deadline: ${nextTarget ? nextTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
            : `Next: ${nextTarget ? nextTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calculating...'}`
        }
      </div>
    </div>
  );
};

export default EventCard;
