'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { predictionAPI } from '../../utils/api';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        loadPredictions();
    }, [router]);

    const loadPredictions = async () => {
        try {
            const response = await predictionAPI.getHistory();
            setPredictions(response.data || []);
        } catch (error) {
            console.error('Failed to load predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this prediction?')) {
            try {
                await predictionAPI.delete(id);
                loadPredictions();
            } catch (error) {
                console.error('Failed to delete prediction:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.navContent}>
                    <h2 className={styles.logo}>Placement Predictor</h2>
                    <div className={styles.navRight}>
                        <span className={styles.userName}>👋 {user?.name}</span>
                        <button onClick={handleLogout} className="btn btn-outline">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <div>
                        <h1>Dashboard</h1>
                        <p>View your placement predictions and history</p>
                    </div>
                    <Link href="/predict" className="btn btn-primary">
                        + New Prediction
                    </Link>
                </div>

                {predictions.length === 0 ? (
                    <div className={styles.empty}>
                        <div className="card-glass">
                            <div className={styles.emptyIcon}>📊</div>
                            <h3>No Predictions Yet</h3>
                            <p>Get started by creating your first placement prediction</p>
                            <Link href="/predict" className="btn btn-primary mt-3">
                                Create Prediction
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {predictions.map((prediction) => (
                            <div key={prediction._id} className="card-glass">
                                <div className={styles.predictionCard}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <span className={`badge ${prediction.placement.placed ? 'badge-success' : 'badge-error'}`}>
                                                {prediction.placement.placed ? 'Placed' : 'Not Placed'}
                                            </span>
                                            <p className={styles.date}>
                                                {new Date(prediction.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(prediction._id)}
                                            className={styles.deleteBtn}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>Placement Probability</span>
                                            <span className={styles.statValue}>
                                                {(prediction.placement.probability * 100).toFixed(1)}%
                                            </span>
                                        </div>

                                        {prediction.salary?.expected_salary && (
                                            <div className={styles.stat}>
                                                <span className={styles.statLabel}>Expected Salary</span>
                                                <span className={styles.statValue}>
                                                    ₹{prediction.salary.expected_salary.toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>Skill Gaps</span>
                                            <span className={styles.statValue}>
                                                {prediction.skill_analysis.skill_gaps.length}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/predict?id=${prediction._id}`}
                                        className="btn btn-outline w-full"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
