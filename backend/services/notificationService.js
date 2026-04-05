const Notification = require('../models/Notification');
const { sendAbsentNotificationEmail, sendLowAttendanceEmail } = require('./emailService');
const { sendAbsentWhatsApp, sendLowAttendanceWhatsApp } = require('./whatsappService');

/**
 * Helper to identify dummy data during development
 */
const isDummy = (student) => {
  const emailDummy = student.email?.includes('example.com') || student.email?.includes('dummy');
  const phoneDummy = student.phone?.includes('+919876') || student.phone?.includes('+91978');
  
  // Whitelist the main test accounts
  const isWhitelisted = student.email === 'student@college.edu' || student.phone === '+917359959638';
  
  return (emailDummy || phoneDummy) && !isWhitelisted;
};

exports.createAbsentNotification = async ({ student, subject, date, recipientUserId }) => {
  try {
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const notification = await Notification.create({
      recipient: recipientUserId,
      student: student._id,
      type: 'absent',
      title: `Absent: ${subject}`,
      message: `Hello ${student.name}, you were marked absent for ${subject} on ${formattedDate}.`,
      subject,
      channels: { inApp: true, email: !!student.email, whatsapp: !!student.phone },
    });

    // Send email
    if (student.email) {
      if (isDummy(student)) {
        console.log(`ℹ️ Skipping Email to dummy: ${student.email}`);
      } else {
        const emailResult = await sendAbsentNotificationEmail(student, subject, date);
        if (emailResult.success) {
          await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
        }
      }
    }

    // Send WhatsApp
    if (student.phone) {
      // whatsappService already has its own dummy check, but we can be explicit here too
      const waResult = await sendAbsentWhatsApp(student, subject, date);
      if (waResult.success && waResult.sid !== 'skipped_dummy_dev_mode') {
        await Notification.findByIdAndUpdate(notification._id, { whatsappSent: true });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating absent notification:', error);
  }
};

exports.createLowAttendanceNotification = async ({ student, percentage, subject, recipientUserId }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientUserId,
      student: student._id,
      type: 'low_attendance',
      title: '⚠️ Low Attendance Warning',
      message: `Your attendance has dropped to ${Number(percentage).toFixed(1)}%${subject ? ` in ${subject}` : ''}. Please maintain the required 75% attendance.`,
      subject,
      channels: { inApp: true, email: !!student.email, whatsapp: !!student.phone },
    });

    if (student.email) {
      if (isDummy(student)) {
        console.log(`ℹ️ Skipping Email to dummy: ${student.email}`);
      } else {
        const emailResult = await sendLowAttendanceEmail(student, percentage, subject);
        if (emailResult.success) {
          await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
        }
      }
    }

    if (student.phone) {
      const waResult = await sendLowAttendanceWhatsApp(student, percentage, subject);
      if (waResult.success && waResult.sid !== 'skipped_dummy_dev_mode') {
        await Notification.findByIdAndUpdate(notification._id, { whatsappSent: true });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating low attendance notification:', error);
  }
};
