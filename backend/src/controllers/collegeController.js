/**
 * College Controller
 * Handles student management and dashboard features for college administrators
 */

const StudentProfile = require('../models/StudentProfile');
const Prediction = require('../models/Prediction');
const axios = require('axios');

// @desc    Add a single student and generate prediction
// @route   POST /api/college/students
// @access  Private (College only)
exports.addStudent = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            enrollmentNumber,
            batch,
            branch,
            skills,
            projects,
            internships,
            placementStatus,
            salary_offered,
            ...academicData
        } = req.body;

        // Basic validation
        if (!name || !enrollmentNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name and Enrollment Number are required'
            });
        }

        // Create student profile
        const profile = await StudentProfile.create({
            userId,
            name,
            enrollmentNumber,
            batch,
            branch,
            batch,
            branch,
            isManuallyAdded: true,
            skills: skills || [],
            projects: projects || [],
            internships: internships || [],
            placementStatus: placementStatus || 'Seeking',
            salary_offered,
            ...academicData,
        });

        // Call ML service
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

        let predictionResult;
        try {
            const response = await axios.post(`${mlServiceUrl}/predict`, academicData);
            predictionResult = response.data;
        } catch (mlError) {
            // If ML fails, we should probably delete the profile or mark it?
            // For now just error out
            await profile.deleteOne();
            throw new Error(`ML Service Error: ${mlError.message}`);
        }

        // Create Prediction linked to Admin (userId) and Student (profileId)
        const prediction = await Prediction.create({
            userId,
            profileId: profile._id,
            placement: predictionResult.placement,
            salary: predictionResult.salary,
            skill_analysis: predictionResult.skill_analysis,
        });

        res.status(201).json({
            success: true,
            message: 'Student added and analyzed successfully',
            data: {
                student: profile,
                prediction: predictionResult
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all students created by this college admin
// @route   GET /api/college/students
// @access  Private (College only)
exports.getStudents = async (req, res) => {
    try {
        const userId = req.user._id;
        const { batch, branch, sort } = req.query;

        // Find predictions by this admin
        let query = { userId };

        // We need to filter by profile fields (batch, branch), but Prediction doesn't have them.
        // We can find Profiles first, then Predictions, or aggregate.
        // Aggregate is best.

        const pipeline = [
            { $match: { userId: userId } }, // Predictions by this admin
            {
                $lookup: {
                    from: 'studentprofiles',
                    localField: 'profileId',
                    foreignField: '_id',
                    as: 'profile'
                }
            },
            { $unwind: '$profile' },
            // Filter by profile fields
            ...(batch ? [{ $match: { 'profile.batch': batch } }] : []),
            ...(branch ? [{ $match: { 'profile.branch': branch } }] : []),
        ];

        // Sorting
        if (sort === 'prob_desc') {
            pipeline.push({ $sort: { 'placement.probability': -1 } });
        } else if (sort === 'salary_desc') {
            pipeline.push({ $sort: { 'salary.expected_salary': -1 } });
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        const results = await Prediction.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Bulk add students
// @route   POST /api/college/students/bulk
// @access  Private (College only)
exports.bulkAddStudents = async (req, res) => {
    try {
        const userId = req.user._id;
        const students = req.body; // Array of student objects

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of students'
            });
        }

        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Process sequentially to avoid overwhelming ML service (or use Promise.all with chunks)
        // For simplicity, sequential or small chunks
        for (const studentData of students) {
            try {
                const { name, enrollmentNumber, batch, branch, ...academicData } = studentData;

                const profile = await StudentProfile.create({
                    name,
                    enrollmentNumber,
                    batch,
                    branch,
                    isManuallyAdded: true,
                    userId: null, // Explicitly null
                    ...academicData
                });

                const response = await axios.post(`${mlServiceUrl}/predict`, academicData);
                const predictionResult = response.data;

                await Prediction.create({
                    userId,
                    profileId: profile._id,
                    placement: predictionResult.placement,
                    salary: predictionResult.salary,
                    skill_analysis: predictionResult.skill_analysis,
                });

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({
                    student: studentData.enrollmentNumber || 'Unknown',
                    error: err.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${students.length} students`,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/college/stats
// @access  Private (College only)
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregate stats
        const stats = await Prediction.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    avgProbability: { $avg: '$placement.probability' },
                    placedCount: {
                        $sum: { $cond: [{ $eq: ['$placement.placed', true] }, 1, 0] }
                    },
                    avgSalary: { $avg: '$salary.expected_salary' }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalStudents: 0,
            avgProbability: 0,
            placedCount: 0,
            avgSalary: 0
        };

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// @desc    Get single student details
// @route   GET /api/college/students/:id
// @access  Private (College only)
exports.getStudentById = async (req, res) => {
    try {
        const userId = req.user._id;
        const studentId = req.params.id;

        // Find profile (ensure it was added manually or belongs to this college context if we had strict ownership)
        // Since isManuallyAdded is true for our additions, we check that.
        // Also check if prediction exists for this admin to verify ownership/access

        const profile = await StudentProfile.findById(studentId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Find the specific prediction record created by this admin for this profile
        const prediction = await Prediction.findOne({
            profileId: studentId,
            userId: userId
        });

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction data not found for this student'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                student: profile,
                prediction: prediction
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
