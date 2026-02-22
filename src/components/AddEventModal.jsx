import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onAdd, eventToEdit }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDateNormal, setEndDateNormal] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatTimes, setRepeatTimes] = useState(['08:00']);
  const [activeDuration, setActiveDuration] = useState(60);
  const [recurrence, setRecurrence] = useState({ type: 'daily', daysOfWeek: [], dayOfMonth: 1 });
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Wrap state updates in setTimeout to avoid cascading renders lint error
    const timer = setTimeout(() => {
      if (eventToEdit) {
        setName(eventToEdit.name || '');
        setStartDate(eventToEdit.startDate || eventToEdit.date || '');
        setEndDateNormal(eventToEdit.endDate || '');
        setIsRepeating(eventToEdit.isRepeating || false);
        setRepeatTimes(eventToEdit.repeatTimes || (eventToEdit.timeRanges ? eventToEdit.timeRanges.map(t => t.startTime) : ['08:00']));
        setActiveDuration(eventToEdit.activeDuration || 60);
        setRecurrence(eventToEdit.recurrence || { type: 'daily', daysOfWeek: [], dayOfMonth: 1 });
        setEndDate(eventToEdit.endDate || '');
      } else {
        setName('');
        setStartDate('');
        setEndDateNormal('');
        setIsRepeating(false);
        setRepeatTimes(['08:00']);
        setActiveDuration(60);
        setRecurrence({ type: 'daily', daysOfWeek: [], dayOfMonth: 1 });
        setEndDate('');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTime = () => setRepeatTimes([...repeatTimes, '12:00']);
  const handleRemoveTime = (index) => setRepeatTimes(repeatTimes.filter((_, i) => i !== index));
  const handleTimeChange = (index, value) => {
    const newTimes = [...repeatTimes];
    newTimes[index] = value;
    setRepeatTimes(newTimes);
  };
  const handleDayOfWeekToggle = (day) => {
    const r = { ...recurrence };
    if (r.daysOfWeek.includes(day)) {
      r.daysOfWeek = r.daysOfWeek.filter(d => d !== day);
    } else {
      r.daysOfWeek = [...r.daysOfWeek, day];
    }
    setRecurrence(r);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    
    const eventData = isRepeating ? {
      name,
      isRepeating: true,
      repeatTimes,
      activeDuration: parseInt(activeDuration) || 60,
      recurrence,
      endDate: endDate || null
    } : {
      name,
      startDate,
      endDate: endDateNormal,
      isRepeating: false
    };

    onAdd(eventData, eventToEdit?.id);
    
    // Reset form
    setName('');
    setStartDate('');
    setEndDateNormal('');
    setIsRepeating(false);
    setRepeatTimes(['08:00']);
    setActiveDuration(60);
    setRecurrence({ type: 'daily', daysOfWeek: [], dayOfMonth: 1 });
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

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
          {eventToEdit ? 'Edit' : 'Add'} {isRepeating ? 'Repeating' : ''} Event
        </h2>
        
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
            <label htmlFor="isRepeating" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Repeating Event</label>
          </div>
          
          {!isRepeating ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required={!isRepeating}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>End Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={endDateNormal}
                  onChange={e => setEndDateNormal(e.target.value)}
                  required={!isRepeating}
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Recurrence Type</label>
                <select
                  value={recurrence.type}
                  onChange={e => setRecurrence({ ...recurrence, type: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom_days">Custom Days of Week</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {(recurrence.type === 'weekly' || recurrence.type === 'custom_days') && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Days of Week</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dIdx) => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                        <input
                          type="checkbox"
                          checked={recurrence.daysOfWeek.includes(dIdx)}
                          onChange={() => handleDayOfWeekToggle(dIdx)}
                          style={{ width: 'auto', margin: 0 }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {recurrence.type === 'monthly' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={recurrence.dayOfMonth}
                    onChange={e => setRecurrence({ ...recurrence, dayOfMonth: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Daily Times (Start Time)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {repeatTimes.map((time, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="time" 
                        value={time}
                        onChange={e => handleTimeChange(index, e.target.value)}
                        required
                        style={{ flex: 1 }}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Window / Timer (minutes)</label>
                <input 
                  type="number" 
                  value={activeDuration}
                  onChange={e => setActiveDuration(e.target.value)}
                  min="1"
                  required
                  placeholder="e.g. 60"
                  style={{ width: '100%' }}
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
            {eventToEdit ? <Save size={20} /> : <Plus size={20} />} 
            {eventToEdit ? 'Update Event' : 'Add Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
