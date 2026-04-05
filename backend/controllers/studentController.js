const Student = require('../models/Student');
const User = require('../models/User');

exports.getAllStudents = async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.course) query.course = req.query.course;
    if (req.query.semester) query.semester = parseInt(req.query.semester);
    if (req.query.search) {
      const s = req.query.search;
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { enrollmentNumber: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, enrollmentNumber, email, phone, course, semester } = req.body;

    const existing = await Student.findOne({
      $or: [{ enrollmentNumber }, { email }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student with this enrollment number or email already exists',
      });
    }

    const student = await Student.create({
      name,
      enrollmentNumber,
      email,
      phone,
      course,
      semester,
      addedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Student created', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getMyStudentRecord = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email, isActive: true });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found for this user' });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
