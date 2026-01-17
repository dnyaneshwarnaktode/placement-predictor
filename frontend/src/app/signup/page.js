'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../utils/api';
import styles from '../login/login.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' // Default role
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

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
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className="card-glass">
                    <div className={styles.header}>
                        <h1>Create Account</h1>
                        <p>Sign up to start predicting your placement</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className="form-group">
                            <label className="form-label">Account Type</label>
                            <select
                                name="role"
                                className="form-input"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ backgroundColor: '#1e293b' }}
                            >
                                <option value="student">Student</option>
                                <option value="college">College Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
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
                                    Creating account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            Already have an account?{' '}
                            <Link href="/login" className={styles.link}>
                                Login
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
