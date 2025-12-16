const API_URL = '/api';

// Users
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const createUser = async (name, email) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  return response.json();
};

// Desks
export const getDesks = async () => {
  const response = await fetch(`${API_URL}/desks`);
  if (!response.ok) throw new Error('Failed to fetch desks');
  return response.json();
};

// Bookings
export const getBookings = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`${API_URL}/bookings?${params}`);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

export const createBooking = async (userId, deskId, date) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, desk_id: deskId, date })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }
  return response.json();
};

export const deleteBooking = async (bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete booking');
  return response.json();
};

// Meetings
export const getMeetings = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`${API_URL}/meetings?${params}`);
  if (!response.ok) throw new Error('Failed to fetch meetings');
  return response.json();
};

export const createMeeting = async (title, description, date, time, createdBy) => {
  const response = await fetch(`${API_URL}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, date, time, created_by: createdBy })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create meeting');
  }
  return response.json();
};

export const deleteMeeting = async (meetingId) => {
  const response = await fetch(`${API_URL}/meetings/${meetingId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete meeting');
  return response.json();
};
