'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { predictionAPI } from '../../utils/api';
import { PlacementChart, SkillGapChart } from '../../components/Chart';
import styles from './predict.module.css';

export default function PredictPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const predictionId = searchParams.get('id');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        gender: 'M',
        ssc_p: '',
        ssc_b: 'Others',
        hsc_p: '',
        hsc_b: 'Others',
        hsc_s: 'Commerce',
        degree_p: '',
        degree_t: 'Sci&Tech',
        workex: 'No',
        etest_p: '',
        specialisation: 'Mkt&HR',
        mba_p: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (predictionId) {
            loadPrediction(predictionId);
        }
    }, [predictionId, router]);

    const loadPrediction = async (id) => {
        try {
            const response = await predictionAPI.getById(id);
            setResult(response.data);
            setStep(2);
        } catch (error) {
            console.error('Failed to load prediction:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert string values to numbers
            const submitData = {
                ...formData,
                ssc_p: parseFloat(formData.ssc_p),
                hsc_p: parseFloat(formData.hsc_p),
                degree_p: parseFloat(formData.degree_p),
                etest_p: parseFloat(formData.etest_p),
                mba_p: parseFloat(formData.mba_p),
            };

            const response = await predictionAPI.submit(submitData);
            setResult(response.data.result);
            setStep(2);
        } catch (error) {
            console.error('Prediction failed:', error);
            alert('Failed to generate prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep(1);
        setResult(null);
        setFormData({
            gender: 'M',
            ssc_p: '',
            ssc_b: 'Others',
            hsc_p: '',
            hsc_b: 'Others',
            hsc_s: 'Commerce',
            degree_p: '',
            degree_t: 'Sci&Tech',
            workex: 'No',
            etest_p: '',
            specialisation: 'Mkt&HR',
            mba_p: '',
        });
    };

    if (step === 2 && result) {
        return (
            <div className={styles.container}>
                <nav className={styles.nav}>
                    <div className={styles.navContent}>
                        <h2 className={styles.logo}>Placement Predictor</h2>
                        <button onClick={() => router.push('/dashboard')} className="btn btn-outline">
                            Dashboard
                        </button>
                    </div>
                </nav>

                <main className={styles.main}>
                    <div className={styles.resultHeader}>
                        <h1>Prediction Results</h1>
                        <div className={styles.resultActions}>
                            <button onClick={handleReset} className="btn btn-outline">
                                New Prediction
                            </button>
                        </div>
                    </div>

                    <div className={styles.results}>
                        {/* Placement Result */}
                        <div className="card-glass">
                            <h3>Placement Prediction</h3>
                            <div className={styles.chartContainer}>
                                <PlacementChart probability={result.placement.probability} />
                            </div>
                            <div className={styles.placementInfo}>
                                <div className={styles.infoItem}>
                                    <span>Status:</span>
                                    <span className={`badge ${result.placement.placed ? 'badge-success' : 'badge-error'}`}>
                                        {result.placement.placed ? 'Likely to be Placed' : 'May Not be Placed'}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span>Probability:</span>
                                    <strong>{(result.placement.probability * 100).toFixed(1)}%</strong>
                                </div>
                                <div className={styles.infoItem}>
                                    <span>Confidence:</span>
                                    <strong>{(result.placement.confidence * 100).toFixed(1)}%</strong>
                                </div>
                            </div>
                        </div>

                        {/* Salary Prediction */}
                        {result.salary && (
                            <div className="card-glass">
                                <h3>Salary Prediction</h3>
                                <div className={styles.salaryInfo}>
                                    <div className={styles.salaryMain}>
                                        <span className={styles.salaryLabel}>Expected Salary</span>
                                        <span className={styles.salaryValue}>
                                            ₹{result.salary.expected_salary.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className={styles.salaryRange}>
                                        <div>
                                            <span>Min:</span>
                                            <strong>₹{result.salary.salary_range.min.toLocaleString()}</strong>
                                        </div>
                                        <div>
                                            <span>Max:</span>
                                            <strong>₹{result.salary.salary_range.max.toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skill Gap Analysis */}
                        <div className="card-glass" style={{ gridColumn: '1 / -1' }}>
                            <h3>Skill Gap Analysis</h3>

                            {result.skill_analysis.skill_gaps.length > 0 && (
                                <div className={styles.chartContainer}>
                                    <SkillGapChart skillGaps={result.skill_analysis.skill_gaps} />
                                </div>
                            )}

                            <div className={styles.skillGaps}>
                                {result.skill_analysis.skill_gaps.length === 0 ? (
                                    <p className={styles.noGaps}>✅ Great! No major skill gaps identified.</p>
                                ) : (
                                    result.skill_analysis.skill_gaps.map((gap, index) => (
                                        <div key={index} className={styles.gapItem}>
                                            <div className={styles.gapHeader}>
                                                <strong>{gap.area}</strong>
                                                <span className={`badge badge-${gap.priority === 'high' ? 'error' : 'warning'}`}>
                                                    {gap.priority}
                                                </span>
                                            </div>
                                            <div className={styles.gapDetails}>
                                                <span>Current: {gap.current}</span>
                                                <span>→</span>
                                                <span>Target: {gap.target}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={styles.recommendations}>
                                <h4>Recommendations</h4>
                                <ul>
                                    {result.skill_analysis.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.navContent}>
                    <h2 className={styles.logo}>Placement Predictor</h2>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-outline">
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.formContainer}>
                    <div className="card-glass">
                        <h1>Student Information Form</h1>
                        <p className={styles.formDesc}>
                            Fill in your academic details to get placement and salary predictions
                        </p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGrid}>
                                {/* Personal Information */}
                                <div className={styles.section}>
                                    <h3>Personal Information</h3>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            name="gender"
                                            className="form-select"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Secondary Education */}
                                <div className={styles.section}>
                                    <h3>Secondary Education (10th)</h3>

                                    <div className="form-group">
                                        <label className="form-label">SSC Percentage</label>
                                        <input
                                            type="number"
                                            name="ssc_p"
                                            className="form-input"
                                            placeholder="75.5"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.ssc_p}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Board of Education</label>
                                        <select
                                            name="ssc_b"
                                            className="form-select"
                                            value={formData.ssc_b}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Central">Central</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Higher Secondary Education */}
                                <div className={styles.section}>
                                    <h3>Higher Secondary (12th)</h3>

                                    <div className="form-group">
                                        <label className="form-label">HSC Percentage</label>
                                        <input
                                            type="number"
                                            name="hsc_p"
                                            className="form-input"
                                            placeholder="80.0"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.hsc_p}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Board of Education</label>
                                        <select
                                            name="hsc_b"
                                            className="form-select"
                                            value={formData.hsc_b}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Central">Central</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Specialization</label>
                                        <select
                                            name="hsc_s"
                                            className="form-select"
                                            value={formData.hsc_s}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Commerce">Commerce</option>
                                            <option value="Science">Science</option>
                                            <option value="Arts">Arts</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Undergraduate Degree */}
                                <div className={styles.section}>
                                    <h3>Undergraduate Degree</h3>

                                    <div className="form-group">
                                        <label className="form-label">Degree Percentage</label>
                                        <input
                                            type="number"
                                            name="degree_p"
                                            className="form-input"
                                            placeholder="70.0"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.degree_p}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Degree Type</label>
                                        <select
                                            name="degree_t"
                                            className="form-select"
                                            value={formData.degree_t}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Sci&Tech">Science & Technology</option>
                                            <option value="Comm&Mgmt">Commerce & Management</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Work Experience</label>
                                        <select
                                            name="workex"
                                            className="form-select"
                                            value={formData.workex}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>

                                {/* MBA */}
                                <div className={styles.section}>
                                    <h3>MBA Information</h3>

                                    <div className="form-group">
                                        <label className="form-label">Employability Test %</label>
                                        <input
                                            type="number"
                                            name="etest_p"
                                            className="form-input"
                                            placeholder="65.0"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.etest_p}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">MBA Specialization</label>
                                        <select
                                            name="specialisation"
                                            className="form-select"
                                            value={formData.specialisation}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Mkt&HR">Marketing & HR</option>
                                            <option value="Mkt&Fin">Marketing & Finance</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">MBA Percentage</label>
                                        <input
                                            type="number"
                                            name="mba_p"
                                            className="form-input"
                                            placeholder="68.0"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.mba_p}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="spinner"></span>
                                        Generating Prediction...
                                    </span>
                                ) : (
                                    'Get Prediction'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
