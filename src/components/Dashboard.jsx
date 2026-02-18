import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, LayoutDashboard, Repeat, AlertCircle, Loader } from 'lucide-react';
import EventCard from './EventCard';
import AddEventModal from './AddEventModal';
import { getEvents, addEvent, deleteEvent, updateEvent } from '../utils/api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        setError('Could not connect to server. Check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10);

    return () => clearInterval(clockTimer);
  }, []);

  const handleSaveEvent = async (eventData, id) => {
    try {
      if (id) {
        const updated = await updateEvent(id, eventData);
        setEvents(prev => prev.map(e => e.id === id ? updated : e));
      } else {
        const newEvent = await addEvent(eventData);
        setEvents(prev => [...prev, newEvent]);
      }
      setEditingEvent(null);
    } catch (err) {
      setError('Failed to save event. Please try again.');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError('Failed to delete event. Please try again.');
    }
  };

  const isEventActive = (event) => {
    if (!event.isRepeating) return true;
    
    const now = currentTime;
    const times = event.repeatTimes;
    const duration = (event.activeDuration || 60) * 60000;
    const preShow = 30 * 60000;

    if (event.endDate) {
      const deadline = new Date(event.endDate);
      deadline.setHours(23, 59, 59, 999);
      if (now > deadline) return false;
    }

    return times.some(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + duration);
      const showTime = new Date(start.getTime() - preShow);
      
      if (now >= showTime && now <= end) return true;
      
      const nextStart = new Date(start);
      nextStart.setDate(nextStart.getDate() + 1);
      const nextShow = new Date(nextStart.getTime() - preShow);
      const nextEnd = new Date(nextStart.getTime() + duration);
      
      if (event.endDate) {
        if (nextStart > new Date(event.endDate).setHours(23,59,59,999)) return false;
      }

      return now >= nextShow && now <= nextEnd;
    });
  };

  const activeEvents = events.filter(isEventActive);
  const scheduledEvents = events.filter(e => e.isRepeating && !isEventActive(e));

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            className="glass-card" 
            style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}
          >
            <Clock size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>System Clock • {currentTime.toLocaleDateString([], { dateStyle: 'long' })}</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}>
          <Plus size={20} /> New Event
        </button>
      </header>

      {error && (
        <div className="glass-card animate-fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '3px solid #f87171', background: 'rgba(248,113,113,0.08)' }}>
          <AlertCircle size={18} color="#f87171" />
          <p style={{ color: '#f87171', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {loading ? (
        <div className="glass-card animate-fade-in" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Loader size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading events from cloud…</p>
        </div>
      ) : events.length === 0 ? (
        <div 
          className="glass-card animate-fade-in" 
          style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Calendar size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No events yet</h2>
          <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}>Add Event</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Active &amp; Upcoming</h2>
            {activeEvents.length > 0 ? (
              <div className="grid">
                {activeEvents
                  .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
                  .map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      currentTime={currentTime} 
                      onDelete={handleDeleteEvent} 
                      onEdit={() => handleEditEvent(event)}
                    />
                  ))
                }
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No active events right now.</p>
            )}
          </div>

          {scheduledEvents.length > 0 && (
            <div style={{ marginTop: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <LayoutDashboard size={18} color="var(--text-muted)" />
                <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Scheduled Sequence</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scheduledEvents.map(event => (
                  <div key={event.id} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Repeat size={16} color="var(--primary)" />
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{event.name}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily: {event.repeatTimes.join(', ')}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditEvent(event)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <Plus size={16} />
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleSaveEvent}
        eventToEdit={editingEvent}
      />

      <footer style={{ marginTop: '5rem', textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ fontSize: '0.875rem' }}>&copy; {new Date().getFullYear()} Event Countdown. Cloud-synced via MongoDB.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
