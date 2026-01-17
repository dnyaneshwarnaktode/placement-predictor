'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collegeAPI } from '../../../../utils/api';
import styles from './add.module.css';

export default function AddStudentPage() {
    const router = useRouter();
    const [mode, setMode] = useState('single'); // 'single' or 'bulk'
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Single Student Form State
    const [formData, setFormData] = useState({
        // Basic
        name: '',
        enrollmentNumber: '',
        gender: 'M',
        batch: '2024',
        branch: 'CSE',

        // Academics
        ssc_p: '',
        ssc_b: 'Central',
        hsc_p: '',
        hsc_b: 'Central',
        hsc_s: 'Science',
        degree_p: '',
        degree_t: 'Sci&Tech',
        mba_p: '',
        etest_p: '',
        specialisation: 'Mkt&HR',
        workex: 'No',

        // Skills & Extras
        skills: [],
        projects: [],
        internships: [],

        // Placement
        placementStatus: 'Seeking', // 'Placed', 'Not Placed', 'Seeking'
        salary_offered: ''
    });

    // Helper state for adding skills
    const [currentSkill, setCurrentSkill] = useState('');

    // Bulk JSON State
    const [jsonInput, setJsonInput] = useState('');

    const TAB_ORDER = ['basic', 'academics', 'skills', 'projects', 'internships', 'placement'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Skill Handlers
    const addSkill = () => {
        if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, currentSkill.trim()]
            }));
            setCurrentSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    // Project Handlers
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: '', description: '', technologies: '' }]
        }));
    };

    const updateProject = (index, field, value) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        setFormData(prev => ({ ...prev, projects: newProjects }));
    };

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    // Internship Handlers
    const addInternship = () => {
        setFormData(prev => ({
            ...prev,
            internships: [...prev.internships, { role: '', company: '', duration: '' }]
        }));
    };

    const updateInternship = (index, field, value) => {
        const newInternships = [...formData.internships];
        newInternships[index][field] = value;
        setFormData(prev => ({ ...prev, internships: newInternships }));
    };

    const removeInternship = (index) => {
        setFormData(prev => ({
            ...prev,
            internships: prev.internships.filter((_, i) => i !== index)
        }));
    };

    const handleSingleSubmit = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const submitData = {
                ...formData,
                ssc_p: parseFloat(formData.ssc_p),
                hsc_p: parseFloat(formData.hsc_p),
                degree_p: parseFloat(formData.degree_p),
                etest_p: parseFloat(formData.etest_p),
                mba_p: parseFloat(formData.mba_p),
                salary_offered: formData.salary_offered ? parseFloat(formData.salary_offered) : undefined
            };

            await collegeAPI.addStudent(submitData);
            setMessage({ type: 'success', text: 'Student added and analyzed successfully!' });
            // Redirect after delay
            setTimeout(() => {
                router.push('/college/students');
            }, 1000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add student' });
            setLoading(false);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let students;
            try {
                students = JSON.parse(jsonInput);
                if (!Array.isArray(students)) throw new Error('Input must be an array');
            } catch (err) {
                setMessage({ type: 'error', text: 'Invalid JSON format. Please check your syntax.' });
                setLoading(false);
                return;
            }

            const response = await collegeAPI.bulkAdd(students);
            setMessage({
                type: 'success',
                text: `Processed ${students.length} students. Success: ${response.data.success}, Failed: ${response.data.failed}`
            });
            if (response.data.success > 0) {
                setJsonInput('');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Bulk upload failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const currentIndex = TAB_ORDER.indexOf(activeTab);
        if (currentIndex < TAB_ORDER.length - 1) {
            setActiveTab(TAB_ORDER[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        const currentIndex = TAB_ORDER.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(TAB_ORDER[currentIndex - 1]);
        }
    };

    // Render proper tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input type="text" name="name" className={styles.input} value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Enrollment No.</label>
                            <input type="text" name="enrollmentNumber" className={styles.input} value={formData.enrollmentNumber} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <select name="gender" className={styles.select} value={formData.gender} onChange={handleChange}>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Batch</label>
                            <input type="text" name="batch" className={styles.input} value={formData.batch} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Branch</label>
                            <input type="text" name="branch" className={styles.input} value={formData.branch} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 'academics':
                return (
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SSC % (10th)</label>
                            <input type="number" name="ssc_p" className={styles.input} value={formData.ssc_p} onChange={handleChange} required min="0" max="100" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>SSC Board</label>
                            <select name="ssc_b" className={styles.select} value={formData.ssc_b} onChange={handleChange}>
                                <option value="Central">Central</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>HSC % (12th)</label>
                            <input type="number" name="hsc_p" className={styles.input} value={formData.hsc_p} onChange={handleChange} required min="0" max="100" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>HSC Stream</label>
                            <select name="hsc_s" className={styles.select} value={formData.hsc_s} onChange={handleChange}>
                                <option value="Science">Science</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Arts">Arts</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Degree %</label>
                            <input type="number" name="degree_p" className={styles.input} value={formData.degree_p} onChange={handleChange} required min="0" max="100" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Degree Type</label>
                            <select name="degree_t" className={styles.select} value={formData.degree_t} onChange={handleChange}>
                                <option value="Sci&Tech">Sci&Tech</option>
                                <option value="Comm&Mgmt">Comm&Mgmt</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>MBA %</label>
                            <input type="number" name="mba_p" className={styles.input} value={formData.mba_p} onChange={handleChange} required min="0" max="100" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Employability Test %</label>
                            <input type="number" name="etest_p" className={styles.input} value={formData.etest_p} onChange={handleChange} required min="0" max="100" />
                        </div>
                    </div>
                );
            case 'skills':
                return (
                    <div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Add Top Skills (Technical & Soft Skills)</label>
                            <div className={styles.chipInput}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    placeholder="e.g. Python, Public Speaking"
                                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <button type="button" onClick={addSkill} className="btn btn-outline">Add</button>
                            </div>
                        </div>
                        <div className={styles.chipList}>
                            {formData.skills.map((skill, index) => (
                                <div key={index} className={styles.chip}>
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className={styles.chipRemove}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'projects':
                return (
                    <div className={styles.itemList}>
                        {formData.projects.map((proj, index) => (
                            <div key={index} className={styles.itemCard}>
                                <button onClick={() => removeProject(index)} className={styles.removeBtn}>×</button>
                                <div className={styles.grid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Project Title</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={proj.title}
                                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Technologies Used</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={proj.technologies}
                                            onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                                            placeholder="React, Node, MongoDB"
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Description</label>
                                    <textarea
                                        className={styles.textarea}
                                        rows="2"
                                        value={proj.description}
                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        ))}
                        <button onClick={addProject} className={styles.addItemBtn}>+ Add Project</button>
                    </div>
                );
            case 'internships':
                return (
                    <div className={styles.itemList}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Work Experience (General)</label>
                            <select name="workex" className={styles.select} value={formData.workex} onChange={handleChange}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>

                        <h3>Internship Details</h3>
                        {formData.internships.map((intern, index) => (
                            <div key={index} className={styles.itemCard}>
                                <button onClick={() => removeInternship(index)} className={styles.removeBtn}>×</button>
                                <div className={styles.grid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Role / Position</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={intern.role}
                                            onChange={(e) => updateInternship(index, 'role', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Company</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={intern.company}
                                            onChange={(e) => updateInternship(index, 'company', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Duration</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={intern.duration}
                                            onChange={(e) => updateInternship(index, 'duration', e.target.value)}
                                            placeholder="e.g. 3 Months"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addInternship} className={styles.addItemBtn}>+ Add Internship</button>
                    </div>
                );
            case 'placement':
                return (
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Current Status</label>
                            <select name="placementStatus" className={styles.select} value={formData.placementStatus} onChange={handleChange}>
                                <option value="Seeking">Seeking Placement</option>
                                <option value="Placed">Placed</option>
                                <option value="Not Placed">Not Placed / Opted Out</option>
                            </select>
                        </div>
                        {formData.placementStatus === 'Placed' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Salary Offered (LPA or Absolute)</label>
                                <input
                                    type="number"
                                    name="salary_offered"
                                    className={styles.input}
                                    value={formData.salary_offered}
                                    onChange={handleChange}
                                    placeholder="e.g. 500000"
                                />
                            </div>
                        )}
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <div className="card-glass" style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)' }}>
                                <p style={{ fontSize: '0.9rem' }}>
                                    <strong>Note:</strong> All data collected will be used to train our real-time prediction models.
                                    The prediction you receive immediately after submission is based on the current active model.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Add Student Data</h1>
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeBtn} ${mode === 'single' ? styles.activeMode : ''}`}
                        onClick={() => setMode('single')}
                    >
                        Single Entry
                    </button>
                    <button
                        className={`${styles.modeBtn} ${mode === 'bulk' ? styles.activeMode : ''}`}
                        onClick={() => setMode('bulk')}
                    >
                        Bulk Upload
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
                    {message.text}
                </div>
            )}

            {mode === 'single' ? (
                <div>
                    <div className={styles.steps}>
                        {TAB_ORDER.map((tab, index) => (
                            <div
                                key={tab}
                                className={`${styles.step} ${activeTab === tab ? styles.activeStep : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                <div className={styles.stepNumber}>{index + 1}</div>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </div>
                        ))}
                    </div>

                    <div className={styles.formArea}>
                        <h2 className={styles.sectionTitle}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details
                        </h2>

                        {renderTabContent()}

                        <div className={styles.navigation}>
                            <button
                                onClick={handlePrev}
                                className={styles.prevBtn}
                                disabled={activeTab === TAB_ORDER[0]}
                                style={{ visibility: activeTab === TAB_ORDER[0] ? 'hidden' : 'visible' }}
                            >
                                Previous
                            </button>

                            {activeTab === TAB_ORDER[TAB_ORDER.length - 1] ? (
                                <button
                                    onClick={handleSingleSubmit}
                                    className={`${styles.navBtn} ${styles.submitBtn}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Submit Data'}
                                </button>
                            ) : (
                                <button onClick={handleNext} className={`${styles.navBtn} ${styles.nextBtn}`}>
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.bulkContainer}>
                    <p className={styles.instruction}>
                        Paste a JSON array of student objects. Ensure new fields (skills, projects) are included if available.
                    </p>
                    <div className={styles.codeBlock}>
                        <pre>{`[{"name": "Student A", "skills": ["Python"], ...}]`}</pre>
                    </div>
                    <form onSubmit={handleBulkSubmit}>
                        <textarea
                            className={styles.textarea}
                            rows="10"
                            placeholder="Data JSON"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Upload Bulk Data'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
