const API_BASE = 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/me`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  return response.json();
}

export async function submitForm(payload) {
  const response = await fetch(`${API_BASE}/forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export async function getLatestForm() {
  const response = await fetch(`${API_BASE}/forms/latest`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  return response.json();
}
