'use client';

import { useState, useEffect } from 'react';
import { collegeAPI } from '../../../utils/api';
import styles from './dashboard.module.css';

export default function CollegeDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await collegeAPI.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-10"><span className="spinner"></span></div>;
    }

    if (!stats) return <div className="text-center p-10">Failed to load dashboard data</div>;

    return (
        <div>
            <h1 className={styles.title}>Dashboard Overview</h1>
            <p className={styles.subtitle}>Real-time placement analytics for your institute</p>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Total Students</h3>
                    <div className={styles.value}>{stats.totalStudents}</div>
                    <div className={styles.trend}>Tracked candidates</div>
                </div>

                <div className={styles.card}>
                    <h3>Average Placement Probability</h3>
                    <div className={styles.value} style={{ color: '#38bdf8' }}>
                        {(stats.avgProbability * 100).toFixed(1)}%
                    </div>
                    <div className={styles.trend}>Across all batches</div>
                </div>

                <div className={styles.card}>
                    <h3>Likely Placed</h3>
                    <div className={styles.value} style={{ color: '#4ade80' }}>
                        {stats.placedCount}
                    </div>
                    <div className={styles.trend}>
                        {((stats.placedCount / stats.totalStudents || 0) * 100).toFixed(1)}% conversion rate
                    </div>
                </div>

                <div className={styles.card}>
                    <h3>Average Expected Salary</h3>
                    <div className={styles.value} style={{ color: '#fbbf24' }}>
                        ₹{stats.avgSalary?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className={styles.trend}>Annual CTC</div>
                </div>
            </div>

            {/* We could add charts here later */}
            <div className={styles.chartSection}>
                <div className="card-glass">
                    <h3>Placement Trends</h3>
                    <div className={styles.placeholderChart}>
                        Chart visualization coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
