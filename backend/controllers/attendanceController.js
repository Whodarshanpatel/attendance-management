const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const {
  createAbsentNotification,
  createLowAttendanceNotification,
} = require('../services/notificationService');

exports.markAttendance = async (req, res) => {
  try {
    const { subject, date, records, course, semester } = req.body;
    // records: [{ studentId, status }]

    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            subject,
            date: new Date(date),
          },
          {
            student: record.studentId,
            subject,
            date: new Date(date),
            status: record.status,
            markedBy: req.user._id,
            course,
            semester,
            remarks: record.remarks || '',
          },
          { upsert: true, new: true }
        );
        results.push(attendance);

        // Trigger notifications for absent students
        if (record.status === 'absent') {
          const student = await Student.findById(record.studentId);
          if (student) {
            // Find linked user account
            const userAccount = await User.findOne({ email: student.email });
            const recipientId = userAccount ? userAccount._id : req.user._id;

            // Create absent notification
            await createAbsentNotification({
              student,
              subject,
              date,
              recipientUserId: recipientId,
            });

            // Check overall attendance percentage
            const totalClasses = await Attendance.countDocuments({ student: student._id, subject });
            const presentClasses = await Attendance.countDocuments({
              student: student._id,
              subject,
              status: 'present',
            });
            const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

            if (percentage < 75 && totalClasses >= 3) {
              await createLowAttendanceNotification({
                student,
                percentage,
                subject,
                recipientUserId: recipientId,
              });
            }
          }
        }
      } catch (err) {
        errors.push({ studentId: record.studentId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      results,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, startDate, endDate } = req.query;

    const query = { student: studentId };
    if (subject) query.subject = subject;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('student', 'name enrollmentNumber')
      .populate('markedBy', 'name');

    // Compute stats per subject
    const subjectStats = {};
    records.forEach((r) => {
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      subjectStats[r.subject].total++;
      subjectStats[r.subject][r.status]++;
    });

    const statsArray = Object.entries(subjectStats).map(([sub, stats]) => ({
      subject: sub,
      ...stats,
      percentage: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0',
    }));

    res.status(200).json({
      success: true,
      count: records.length,
      records,
      subjectStats: statsArray,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date, subject, course, semester } = req.query;
    const query = {};

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    }
    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);

    const records = await Attendance.find(query)
      .populate('student', 'name enrollmentNumber course semester')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalStudents = await Student.countDocuments({ isActive: true });
    const todayRecords = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const presentToday = todayRecords.filter((r) => r.status === 'present').length;
    const absentToday = todayRecords.filter((r) => r.status === 'absent').length;
    const totalToday = todayRecords.length;
    const attendancePercentage = totalToday > 0 ? ((presentToday / totalToday) * 100).toFixed(1) : 0;

    // Last 7 days stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRecords = await Attendance.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        todayAttendance: totalToday,
        presentToday,
        absentToday,
        attendancePercentage: parseFloat(attendancePercentage),
        weeklyData: weeklyRecords,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    if (!records.length) {
      return res.status(200).json({
        success: true,
        stats: { totalClasses: 0, present: 0, absent: 0, late: 0, percentage: 0, subjectStats: [], recentRecords: [], streak: 0 },
      });
    }

    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    // Per-subject breakdown
    const subjectMap = {};
    records.forEach(r => {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { total: 0, present: 0, absent: 0, late: 0 };
      subjectMap[r.subject].total++;
      subjectMap[r.subject][r.status]++;
    });
    const subjectStats = Object.entries(subjectMap).map(([subject, s]) => ({
      subject,
      ...s,
      percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '0',
    })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    // Current attendance streak (consecutive present days)
    const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const r of sorted) {
      if (r.status === 'present') streak++;
      else break;
    }

    // Last 30 days daily summary for heatmap
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = records.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const dayMap = {};
    recent.forEach(r => {
      const key = new Date(r.date).toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = { date: key, present: 0, absent: 0, late: 0, total: 0 };
      dayMap[key][r.status]++;
      dayMap[key].total++;
    });
    const recentRecords = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      stats: { totalClasses: total, present, absent, late, percentage: parseFloat(percentage), subjectStats, recentRecords, streak },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
