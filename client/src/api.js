const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function createLink(url, customCode) {
  return request('/api/links', {
    method: 'POST',
    body: JSON.stringify({ url, customCode: customCode || undefined }),
  });
}

export function getLinks() {
  return request('/api/links');
}

export function getStats(code) {
  return request(`/api/links/${code}/stats`);
}

export function deleteLink(code) {
  return request(`/api/links/${code}`, { method: 'DELETE' });
}

