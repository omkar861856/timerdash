// Detect environment: use relative /api in production (Vercel), localhost:3001 in dev
const BASE_URL = import.meta.env.PROD
  ? '/api/events'
  : 'http://localhost:3001/api/events';

export const getEvents = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
};

export const addEvent = async (eventData) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to add event');
  return res.json();
};

export const updateEvent = async (id, updatedData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
};

export const deleteEvent = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete event');
  return res.json();
};
