'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../../utils/api';
import styles from './login.module.css';

export default function CollegeLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);

            if (response.success) {
                const user = response.data.user;
                if (user.role && (user.role === 'college' || user.role === 'admin')) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(user));
                    router.push('/college/dashboard');
                } else {
                    setError('Access Denied. This portal is for college administrators only.');
                    // Optional: clear token if we don't want them logged in at all
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className="card-glass" style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    <div className={styles.header}>
                        <h1>College Portal</h1>
                        <p>Administrator Login</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="admin@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner"></span>
                                    Verifying credentials...
                                </span>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <Link href="/login" className={styles.link}>
                            Student Login
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.background}>
                {/* Reusing similar background divs but maybe different colors via CSS if possible, 
                 or just rely on the existing module which we need to copy/create */}
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
            </div>
        </div>
    );
}
