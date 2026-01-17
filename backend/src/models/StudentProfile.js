/**
 * Student Profile Model
 * Schema for student academic and personal information
 */

const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
    },
    enrollmentNumber: {
        type: String,
        trim: true,
    },
    batch: {
        type: String,
    },
    branch: {
        type: String,
    },
    isManuallyAdded: {
        type: Boolean,
        default: false,
    },
    gender: {
        type: String,
        required: true,
        enum: ['M', 'F'],
    },
    ssc_p: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    ssc_b: {
        type: String,
        required: true,
        enum: ['Central', 'Others'],
    },
    hsc_p: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    hsc_b: {
        type: String,
        required: true,
        enum: ['Central', 'Others'],
    },
    hsc_s: {
        type: String,
        required: true,
        enum: ['Commerce', 'Science', 'Arts'],
    },
    degree_p: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    degree_t: {
        type: String,
        required: true,
        enum: ['Sci&Tech', 'Comm&Mgmt', 'Others'],
    },
    workex: {
        type: String,
        required: true,
        enum: ['Yes', 'No'],
    },
    etest_p: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    specialisation: {
        type: String,
        required: true,
        enum: ['Mkt&HR', 'Mkt&Fin'],
    },
    mba_p: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    skills: [{
        type: String,
        trim: true
    }],
    projects: [{
        title: String,
        description: String,
        technologies: String
    }],
    internships: [{
        role: String,
        company: String,
        duration: String, // e.g., "3 months"
    }],
    placementStatus: {
        type: String, // 'Placed', 'Not Placed', 'Seeking' - for training labels
        enum: ['Placed', 'Not Placed', 'Seeking'],
        default: 'Seeking'
    },
    salary_offered: {
        type: Number, // Actual salary if placed
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
studentProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
