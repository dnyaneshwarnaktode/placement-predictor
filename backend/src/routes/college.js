const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    addStudent,
    getStudents,
    bulkAddStudents,
    getDashboardStats,
    getStudentById
} = require('../controllers/collegeController');

// All routes are protected and restricted to college role
router.use(protect);
router.use(authorize('college', 'admin'));

router.post('/students', addStudent);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students/bulk', bulkAddStudents);
router.get('/stats', getDashboardStats);

module.exports = router;
