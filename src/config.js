// Central API configuration
// Uses VITE_API_URL from Vercel env vars in production,
// falls back to Railway backend URL if not set,
// and localhost only for local dev overrides.
const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://automax-backend-production.up.railway.app');

export default API_BASE;
