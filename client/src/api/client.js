import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL });

// Attach the JWT on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('epc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling -> bounce to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.startsWith('/login')) {
      localStorage.removeItem('epc_token');
      localStorage.removeItem('epc_user');
      location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const apiError = (err) =>
  err?.response?.data?.error || err?.message || 'Something went wrong';

/**
 * Downloads a file from an authenticated API endpoint (sends the JWT header,
 * which a plain <a href> navigation cannot). Triggers a browser save dialog.
 */
export async function download(path) {
  const { data, headers } = await api.get(path, { responseType: 'blob' });
  const disposition = headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'report';
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
