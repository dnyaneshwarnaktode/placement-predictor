'use client';

import { useState, useEffect } from 'react';
import { collegeAPI } from '../../../utils/api';
import styles from './students.module.css';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        batch: '',
        branch: '',
        sort: 'prob_desc'
    });

    useEffect(() => {
        loadStudents();
    }, [filters]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.batch) params.batch = filters.batch;
            if (filters.branch) params.branch = filters.branch;
            if (filters.sort) params.sort = filters.sort;

            const response = await collegeAPI.getStudents(params);
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to load students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const downloadCSV = () => {
        if (students.length === 0) return;

        const headers = ['Rank', 'Name', 'Enrollment', 'Batch', 'Branch', 'Placement Probability', 'Expected Salary', 'Likely Placed', 'Skill Gap Score'];

        const csvRows = students.map((s, index) => {
            return [
                index + 1,
                `"${s.profile.name || ''}"`,
                `"${s.profile.enrollmentNumber || ''}"`,
                s.profile.batch || '',
                s.profile.branch || '',
                (s.placement.probability * 100).toFixed(1) + '%',
                s.salary.expected_salary,
                s.placement.placed ? 'Yes' : 'No',
                s.skill_analysis?.overall_score || ''
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `placement_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Student Rankings</h1>
                    <p>Real-time analysis based on {students.length} students</p>
                </div>
                <button onClick={downloadCSV} className="btn btn-outline" disabled={loading || students.length === 0}>
                    📥 Download Report
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <input
                        type="text"
                        name="batch"
                        placeholder="Filter by Batch (e.g. 2024)"
                        value={filters.batch}
                        onChange={handleFilterChange}
                        className={styles.filterInput}
                    />
                    <input
                        type="text"
                        name="branch"
                        placeholder="Filter by Branch"
                        value={filters.branch}
                        onChange={handleFilterChange}
                        className={styles.filterInput}
                    />
                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="prob_desc">Sort by Probability (High-Low)</option>
                        <option value="salary_desc">Sort by Salary (High-Low)</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Enrollment</th>
                            <th>Branch</th>
                            <th>Placement Prob.</th>
                            <th>Exp. Salary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center p-8">Loading...</td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-8">No students found</td>
                            </tr>
                        ) : (
                            students.map((student, index) => (
                                <tr
                                    key={student._id}
                                    className={styles.row}
                                    onClick={() => window.location.href = `/college/students/${student.profile._id}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>#{index + 1}</td>
                                    <td>{student.profile.name}</td>
                                    <td>{student.profile.enrollmentNumber}</td>
                                    <td>{student.profile.branch || '-'}</td>
                                    <td>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{
                                                    width: `${student.placement.probability * 100}%`,
                                                    backgroundColor: student.placement.probability > 0.7 ? '#4ade80' :
                                                        student.placement.probability > 0.4 ? '#fbbf24' : '#f87171'
                                                }}
                                            />
                                        </div>
                                        <span className={styles.probText}>{(student.placement.probability * 100).toFixed(1)}%</span>
                                    </td>
                                    <td>₹{student.salary.expected_salary.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${student.placement.placed ? 'badge-success' : 'badge-error'}`}>
                                            {student.placement.placed ? 'Placed' : 'Not Placed'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
