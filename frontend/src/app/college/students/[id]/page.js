'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collegeAPI } from '../../../../utils/api';
import styles from './student_detail.module.css';

export default function StudentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [student, setStudent] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const data = await collegeAPI.getStudentById(id);
                setStudent(data.data.student);
                setPrediction(data.data.prediction);
            } catch (err) {
                setError('Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStudent();
        }
    }, [id]);

    if (loading) return <div className="text-center p-10 text-white">Loading profile...</div>;
    if (error) return <div className="text-center p-10 text-red-400">{error}</div>;
    if (!student) return <div className="text-center p-10 text-white">Student not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{student.name}</h1>
                    <p style={{ color: '#94a3b8' }}>{student.enrollmentNumber} • {student.branch} ({student.batch})</p>
                </div>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← Back to List
                </button>
            </div>

            <div className={styles.grid}>
                {/* Left Column: Academics & Prediction */}
                <div>
                    <div className={`${styles.section} ${styles.placementCard}`}>
                        <h2 className={styles.sectionTitle}>Placement Analysis</h2>

                        <div className={styles.row}>
                            <span className={styles.label}>Predicted Probability:</span>
                            <span className={styles.value} style={{ color: prediction?.placement?.probability > 0.7 ? '#4ade80' : '#facc15' }}>
                                {(prediction?.placement?.probability * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Expected Salary:</span>
                            <span className={styles.value}>
                                ₹{prediction?.salary?.expected_salary?.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Current Status:</span>
                            <span className={styles.value}>{student.placementStatus}</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Academic Performance</h2>
                        <div className={styles.row}>
                            <span className={styles.label}>SSC (10th):</span>
                            <span className={styles.value}>{student.ssc_p}% ({student.ssc_b})</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>HSC (12th):</span>
                            <span className={styles.value}>{student.hsc_p}% ({student.hsc_s})</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Degree:</span>
                            <span className={styles.value}>{student.degree_p}% ({student.degree_t})</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>MBA:</span>
                            <span className={styles.value}>{student.mba_p}% ({student.specialisation})</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Employability Test:</span>
                            <span className={styles.value}>{student.etest_p}%</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Skills, Projects, Internships */}
                <div>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {student.skills && student.skills.length > 0 ? (
                                student.skills.map((skill, index) => (
                                    <span key={index} className={styles.skillChip}>{skill}</span>
                                ))
                            ) : (
                                <p className="text-gray-500">No skills listed</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Projects</h2>
                        {student.projects && student.projects.length > 0 ? (
                            student.projects.map((proj, index) => (
                                <div key={index} className={styles.projectCard}>
                                    <div className={styles.projectTitle}>{proj.title}</div>
                                    <div className={styles.projectTech}>{proj.technologies}</div>
                                    <div className={styles.projectDesc}>{proj.description}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No projects listed</p>
                        )}
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Internships / Work Ex</h2>
                        <div className={styles.row}>
                            <span className={styles.label}>Work Experience:</span>
                            <span className={styles.value}>{student.workex}</span>
                        </div>
                        {student.internships && student.internships.map((intern, index) => (
                            <div key={index} className={styles.projectCard} style={{ marginTop: '1rem' }}>
                                <div className={styles.projectTitle}>{intern.role}</div>
                                <div className={styles.projectTech} style={{ color: '#94a3b8' }}>{intern.company}</div>
                                <div className={styles.projectDesc}>Duration: {intern.duration}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
