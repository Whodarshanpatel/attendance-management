const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyStudentRecord,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMyStudentRecord);          // logged-in student's own record
router.get('/', getAllStudents);
router.get('/:id', getStudent);
router.post('/', authorize('teacher'), createStudent);
router.put('/:id', authorize('teacher'), updateStudent);
router.delete('/:id', authorize('teacher'), deleteStudent);

module.exports = router;
