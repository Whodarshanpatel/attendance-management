const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone, course, semester, enrollmentNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      course,
      semester,
      enrollmentNumber,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        semester: user.semester,
        enrollmentNumber: user.enrollmentNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        course: user.course,
        semester: user.semester,
        enrollmentNumber: user.enrollmentNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, course, semester } = req.body;
    const updateData = {};

    if (name)     updateData.name     = name;
    if (phone)    updateData.phone    = phone;
    if (course)   updateData.course   = course;
    if (semester) updateData.semester = Number(semester);

    if (req.file) {
      // Delete old profile picture if exists
      const currentUser = await User.findById(req.user._id);
      if (currentUser?.profilePicture) {
        const oldPath = path.join(__dirname, '..', currentUser.profilePicture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: false }
    );

    // Return a clean, consistent user object (same shape as login response)
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        role:             user.role,
        phone:            user.phone,
        course:           user.course,
        semester:         user.semester,
        enrollmentNumber: user.enrollmentNumber,
        profilePicture:   user.profilePicture,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
