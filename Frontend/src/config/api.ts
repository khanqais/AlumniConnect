import axios from 'axios';

// Centralized API configuration
// Use this base URL for all API calls

const getApiBaseUrl = () => {
    // Check for environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    // Use relative URL for development (works with Vite proxy)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Create a custom axios instance with the base URL
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.token) {
                    config.headers.Authorization = `Bearer ${userData.token}`;
                }
            } catch {
                // Invalid JSON, ignore
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
