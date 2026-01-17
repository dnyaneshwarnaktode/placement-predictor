/**
 * API Client
 * Axios instance with authentication and error handling
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
};

// Prediction API
export const predictionAPI = {
    submit: async (studentData) => {
        const response = await api.post('/api/predictions/submit', studentData);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/api/predictions/history');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/api/predictions/${id}`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/api/predictions/${id}`);
        return response.data;
    },
};

// College API
export const collegeAPI = {
    addStudent: async (data) => {
        const response = await api.post('/api/college/students', data);
        return response.data;
    },
    bulkAdd: async (students) => {
        const response = await api.post('/api/college/students/bulk', students);
        return response.data;
    },
    getStudents: async (params) => {
        const response = await api.get('/api/college/students', { params });
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/api/college/stats');
        return response.data;
    },
    getStudentById: async (id) => {
        const response = await api.get(`/api/college/students/${id}`);
        return response.data;
    },
};

export default api;
