import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Repeat } from 'lucide-react';

const EventCard = ({ event, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isActive: false });
  const [nextTarget, setNextTarget] = useState(null);


  useEffect(() => {
    function calculateTimeLeft() {
      let targetDate;
      let isActive = false;
      
      if (event.isRepeating) {
        const now = new Date();
        const times = event.repeatTimes.sort();
        let currentOrNext = null;

        // Check if we are currently in an active window
        for (const timeStr of times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const start = new Date();
          start.setHours(hours, minutes, 0, 0);
          const end = new Date(start.getTime() + (event.activeDuration || 60) * 60000);
          
          if (now >= start && now <= end) {
            currentOrNext = end;
            isActive = true;
            break;
          }
          
          if (start > now && (!currentOrNext || start < currentOrNext)) {
            currentOrNext = start;
          }
        }

        // If no occurrence today, take first one tomorrow
        if (!currentOrNext) {
          const [hours, minutes] = times[0].split(':').map(Number);
          const nextStart = new Date();
          nextStart.setDate(nextStart.getDate() + 1);
          nextStart.setHours(hours, minutes, 0, 0);
          currentOrNext = nextStart;
        }

        // Check against overall deadline (endDate)
        if (event.endDate) {
          const deadline = new Date(event.endDate);
          deadline.setHours(23, 59, 59, 999);
          if (currentOrNext > deadline && !isActive) {
            return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
          }
        }
        
        targetDate = currentOrNext;
      } else {
        targetDate = new Date(event.date);
      }

      const difference = +targetDate - +new Date();
      
      if (difference > 0) {
        return {
          expired: false,
          isActive,
          target: targetDate,
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    }

    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
      if (result.target) setNextTarget(result.target);
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  const isExpired = timeLeft.expired;

  return (
    <div className="glass-card p-6 animate-fade-in flex flex-direction-column gap-4 relative" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <button 
        onClick={() => onDelete(event.id)}
        className="btn-ghost"
        style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%' }}
      >
        <Trash2 size={18} className="text-muted" />
      </button>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{event.name}</h3>
          {event.isRepeating && <Repeat size={14} color={timeLeft.isActive ? '#f87171' : 'var(--primary)'} />}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {event.isRepeating 
            ? timeLeft.isActive ? 'Action Required' : `Daily: ${event.repeatTimes.join(', ')}`
            : new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })
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
