// API base URL - uses environment variable in production, defaults to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
