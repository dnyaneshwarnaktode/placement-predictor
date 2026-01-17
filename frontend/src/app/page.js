'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={`${styles.content} ${mounted ? 'animate-fadeIn' : ''}`}>
                    <h1 className={styles.title}>
                        College Placement
                        <span className={styles.gradient}> Prediction System</span>
                    </h1>
                    <p className={styles.subtitle}>
                        AI-powered platform to predict your placement probability and expected salary
                        using advanced machine learning algorithms
                    </p>

                    <div className={styles.features}>
                        <div className="card-glass">
                            <div className={styles.featureIcon}>🎯</div>
                            <h3>Placement Prediction</h3>
                            <p>Get accurate placement probability based on your academic profile</p>
                        </div>
                        <div className="card-glass">
                            <div className={styles.featureIcon}>💰</div>
                            <h3>Salary Estimation</h3>
                            <p>Discover your expected salary range in the job market</p>
                        </div>
                        <div className="card-glass">
                            <div className={styles.featureIcon}>📊</div>
                            <h3>Skill Analysis</h3>
                            <p>Identify skill gaps and get personalized recommendations</p>
                        </div>
                    </div>

                    <div className={styles.cta}>
                        <Link href="/signup" className="btn btn-primary">
                            Get Started
                        </Link>
                        <Link href="/login" className="btn btn-outline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.background}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>
        </div>
    );
}
