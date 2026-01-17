/**
 * Prediction Model
 * Schema for storing prediction results
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true,
    },
    placement: {
        placed: {
            type: Boolean,
            required: true,
        },
        probability: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
    },
    salary: {
        expected_salary: {
            type: Number,
            default: null,
        },
        salary_range: {
            min: {
                type: Number,
                default: null,
            },
            max: {
                type: Number,
                default: null,
            },
        },
    },
    skill_analysis: {
        skill_gaps: [{
            area: String,
            current: String,
            target: String,
            priority: String,
        }],
        recommendations: [String],
        overall_score: Number,
        improvement_potential: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Prediction', predictionSchema);
