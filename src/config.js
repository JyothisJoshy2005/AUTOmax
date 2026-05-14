// Central API configuration
// In production: set VITE_API_URL in your Vercel environment variables
// In development: falls back to localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
