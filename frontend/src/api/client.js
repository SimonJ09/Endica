import axios from 'axios';

// En local → '/api' (proxy Vite)
// En prod → URL absolue du backend Render
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export default api;