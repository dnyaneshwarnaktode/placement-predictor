/**
 * Prediction Controller
 * Handles student profile submission and prediction requests
 */

const StudentProfile = require('../models/StudentProfile');
const Prediction = require('../models/Prediction');
const axios = require('axios');

// @desc    Submit student profile and get prediction
// @route   POST /api/predictions/submit
// @access  Private
exports.submitPrediction = async (req, res) => {
    try {
        const userId = req.user._id;
        const studentData = req.body;

        // Create student profile
        const profile = await StudentProfile.create({
            userId,
            ...studentData,
        });

        // Call ML service for prediction
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

        let predictionResult;
        try {
            const response = await axios.post(`${mlServiceUrl}/predict`, studentData);
            predictionResult = response.data;
        } catch (mlError) {
            console.error('ML Service Error:', mlError.message);
            return res.status(503).json({
                success: false,
                message: 'ML service unavailable. Please ensure the ML service is running.',
                error: mlError.message,
            });
        }

        // Save prediction to database
        const prediction = await Prediction.create({
            userId,
            profileId: profile._id,
            placement: predictionResult.placement,
            salary: predictionResult.salary,
            skill_analysis: predictionResult.skill_analysis,
        });

        res.status(201).json({
            success: true,
            message: 'Prediction generated successfully',
            data: {
                profileId: profile._id,
                predictionId: prediction._id,
                result: predictionResult,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Get prediction history for user
// @route   GET /api/predictions/history
// @access  Private
exports.getPredictionHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const predictions = await Prediction.find({ userId })
            .populate('profileId')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: predictions.length,
            data: predictions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Get specific prediction by ID
// @route   GET /api/predictions/:id
// @access  Private
exports.getPredictionById = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id)
            .populate('profileId');

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found',
            });
        }

        // Check if prediction belongs to user
        if (prediction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this prediction',
            });
        }

        res.status(200).json({
            success: true,
            data: prediction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private
exports.deletePrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found',
            });
        }

        // Check if prediction belongs to user
        if (prediction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this prediction',
            });
        }

        await prediction.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Prediction deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};
