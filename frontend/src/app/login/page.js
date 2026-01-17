'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../utils/api';
import styles from './login.module.css';

export default function LoginPage() {
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
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Redirect based on role
                if (response.data.user.role === 'college' || response.data.user.role === 'admin') {
                    router.push('/college/dashboard');
                } else {
                    router.push('/dashboard');
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
                <div className="card-glass">
                    <div className={styles.header}>
                        <h1>Welcome Back</h1>
                        <p>Student & College Portal Login</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Form Inputs ... */}
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="your.email@example.com"
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
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <div style={{ marginBottom: '1rem' }}>
                            <Link href="/college/login" className={styles.link} style={{ color: '#38bdf8' }}>
                                🏫 Go to College Portal
                            </Link>
                        </div>
                        <p>
                            Don't have an account?{' '}
                            <Link href="/signup" className={styles.link}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.background}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
            </div>
        </div>
    );
}
