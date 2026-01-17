'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });

        if (response.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            return response;
        }

        throw new Error(response.message || 'Login failed');
    };

    const register = async (name, email, password) => {
        const response = await authAPI.register({ name, email, password });

        if (response.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            return response;
        }

        throw new Error(response.message || 'Registration failed');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
