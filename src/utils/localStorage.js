const STORAGE_KEY = 'event-countdown-timers';

export const getEvents = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const addEvent = (event) => {
  const events = getEvents();
  const newEvent = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  saveEvents([...events, newEvent]);
  return newEvent;
};

export const deleteEvent = (id) => {
  const events = getEvents();
  const filteredEvents = events.filter(e => e.id !== id);
  saveEvents(filteredEvents);
  return filteredEvents;
};

export const updateEvent = (id, updatedData) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedData };
    saveEvents(events);
  }
  return events;
};
