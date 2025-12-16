const API_URL = '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============= AUTHENTICATION =============

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch current user');
  return response.json();
};

// ============= USERS =============

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const updateUser = async (userId, data) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
  return response.json();
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change password');
  }
  return response.json();
};

// ============= DESKS =============

export const getDesks = async () => {
  const response = await fetch(`${API_URL}/desks`);
  if (!response.ok) throw new Error('Failed to fetch desks');
  return response.json();
};

export const getAllDesks = async () => {
  const response = await fetch(`${API_URL}/admin/desks`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch all desks');
  return response.json();
};

export const createDesk = async (name) => {
  const response = await fetch(`${API_URL}/admin/desks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create desk');
  }
  return response.json();
};

export const updateDesk = async (deskId, data) => {
  const response = await fetch(`${API_URL}/admin/desks/${deskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update desk');
  }
  return response.json();
};

export const deleteDesk = async (deskId) => {
  const response = await fetch(`${API_URL}/admin/desks/${deskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete desk');
  }
  return response.json();
};

// ============= BOOKINGS =============

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

// ============= MEETINGS =============

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

// ============= WEEK TEMPLATES =============

export const getTemplates = async () => {
  const response = await fetch(`${API_URL}/templates`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
};

export const createTemplate = async (name, days) => {
  const response = await fetch(`${API_URL}/templates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, days })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create template');
  }
  return response.json();
};

export const applyTemplate = async (templateId, startDate, endDate, deskId = null) => {
  const response = await fetch(`${API_URL}/templates/${templateId}/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ startDate, endDate, deskId })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply template');
  }
  return response.json();
};

export const deleteTemplate = async (templateId) => {
  const response = await fetch(`${API_URL}/templates/${templateId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete template');
  return response.json();
};
