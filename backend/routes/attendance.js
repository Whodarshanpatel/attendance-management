const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByStudent,
  getAttendanceByDate,
  getDashboardStats,
  getStudentDashboard,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/student-dashboard/:studentId', getStudentDashboard);
router.get('/student/:studentId', getAttendanceByStudent);
router.get('/', authorize('teacher'), getAttendanceByDate);
router.post('/', authorize('teacher'), markAttendance);

module.exports = router;
