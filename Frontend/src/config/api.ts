import axios from 'axios';


const getApiBaseUrl = () => {

    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();


const api = axios.create({
    baseURL: API_BASE_URL,
});


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

            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
