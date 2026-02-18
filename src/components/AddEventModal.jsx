import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatTimes, setRepeatTimes] = useState(['08:00']);
  const [activeDuration, setActiveDuration] = useState(60);
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleAddTime = () => setRepeatTimes([...repeatTimes, '12:00']);
  const handleRemoveTime = (index) => setRepeatTimes(repeatTimes.filter((_, i) => i !== index));
  const handleTimeChange = (index, value) => {
    const newTimes = [...repeatTimes];
    newTimes[index] = value;
    setRepeatTimes(newTimes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    
    if (isRepeating) {
      if (repeatTimes.length === 0) return;
      onAdd({ 
        name, 
        isRepeating: true, 
        repeatTimes,
        activeDuration: parseInt(activeDuration) || 60,
        endDate: endDate || null 
      });
    } else {
      if (!date) return;
      onAdd({ name, date, isRepeating: false });
    }
    
    // Reset form
    setName('');
    setDate('');
    setIsRepeating(false);
    setRepeatTimes(['08:00']);
    setActiveDuration(60);
    setEndDate('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        className="glass-card animate-fade-in" 
        style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative', background: '#1e1b4b', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Add {isRepeating ? 'Repeating' : 'New'} Event</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Event Name</label>
            <input 
              type="text" 
              placeholder="e.g. Medicine, Workout, Meeting" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="isRepeating" 
              checked={isRepeating} 
              onChange={e => setIsRepeating(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="isRepeating" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Repeating Event (Daily)</label>
          </div>
          
          {!isRepeating ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Target Date & Time</label>
              <input 
                type="datetime-local" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required={!isRepeating}
              />
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Daily Times</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {repeatTimes.map((time, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="time" 
                        value={time}
                        onChange={e => handleTimeChange(index, e.target.value)}
                        required
                      />
                      {repeatTimes.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTime(index)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                          <Trash2 size={16} color="#f87171" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddTime} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.5rem', borderStyle: 'dashed' }}>
                    <Plus size={14} /> Add another time
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Window (minutes)</label>
                <input 
                  type="number" 
                  value={activeDuration}
                  onChange={e => setActiveDuration(e.target.value)}
                  min="1"
                  required
                  placeholder="e.g. 60"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Repetition Deadline (Optional)</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  placeholder="When to stop repeating"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Plus size={20} /> Add Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
