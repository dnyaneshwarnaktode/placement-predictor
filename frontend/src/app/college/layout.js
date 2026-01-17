'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

export default function CollegeLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // If on login page, don't redirect
        if (pathname === '/college/login') {
            setAuthorized(true);
            return;
        }

        if (!token || (savedUser.role !== 'college' && savedUser.role !== 'admin')) {
            router.push('/college/login');
        } else {
            setUser(savedUser);
            setAuthorized(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/college/login');
    };

    if (!authorized) return null;

    if (pathname === '/college/login') {
        return <>{children}</>;
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>College Admin</h2>
                    <p>{user?.name}</p>
                </div>

                <nav className={styles.nav}>
                    <Link
                        href="/college/dashboard"
                        className={`${styles.navItem} ${pathname === '/college/dashboard' ? styles.active : ''}`}
                    >
                        <span>📊</span> Dashboard
                    </Link>
                    <Link
                        href="/college/students"
                        className={`${styles.navItem} ${pathname === '/college/students' ? styles.active : ''}`}
                    >
                        <span>👥</span> Students
                    </Link>
                    <Link
                        href="/college/students/add"
                        className={`${styles.navItem} ${pathname === '/college/students/add' ? styles.active : ''}`}
                    >
                        <span>➕</span> Add Student
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
