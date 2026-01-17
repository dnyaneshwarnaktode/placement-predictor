/**
 * Prediction Routes
 */

const express = require('express');
const router = express.Router();
const {
    submitPrediction,
    getPredictionHistory,
    getPredictionById,
    deletePrediction,
} = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/submit', protect, submitPrediction);
router.get('/history', protect, getPredictionHistory);
router.get('/:id', protect, getPredictionById);
router.delete('/:id', protect, deletePrediction);

module.exports = router;
