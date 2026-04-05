const nodemailer = require('nodemailer');

// Lazy-initialize transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || user === 'your_gmail@gmail.com') {
      throw new Error('EMAIL_USER not configured in .env');
    }
    if (!pass || pass === 'your_16_char_app_password') {
      throw new Error('EMAIL_PASS not configured in .env');
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port == 465, // true for 465, false for other ports
      auth: { user, pass },
    });
  }
  return transporter;
};

/**
 * Core send function
 */
exports.sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return { success: false, error: 'No recipient email provided' };

  try {
    const tr = getTransporter();
    const mailOptions = {
      from: `"AttendEase System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await tr.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email error for ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Absent notification email
 */
exports.sendAbsentNotificationEmail = async (student, subject, date) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return exports.sendEmail({
    to: student.email,
    subject: `❗ Absent Alert: ${subject} - ${formattedDate}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
        <div style="background: #4f46e5; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Attendance Alert</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; margin-top: 0;">Hello <strong>${student.name}</strong>,</p>
          <p>You were marked <span style="color: #dc2626; font-weight: 700;">ABSENT</span> for the following class:</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>📚 Subject:</strong> ${subject}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="margin: 0;"><strong>🆔 Enrollment:</strong> ${student.enrollmentNumber || 'N/A'}</p>
          </div>
          
          <p style="margin-bottom: 25px;">Please ensure you maintain a minimum of <strong>75% attendance</strong> to remain eligible for examinations.</p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
            This is an automated notification from the <strong>AttendEase Management System</strong>.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Low attendance warning email
 */
exports.sendLowAttendanceEmail = async (student, percentage, subject) => {
  return exports.sendEmail({
    to: student.email,
    subject: `⚠️ Low Attendance Warning - ${subject || 'Overall'}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
        <div style="background: #f59e0b; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Attendance Warning</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; margin-top: 0;">Hello <strong>${student.name}</strong>,</p>
          <p>Your attendance has dropped below the required threshold of <strong>75%</strong>.</p>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #92400e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Current Status</p>
            <p style="margin: 10px 0; font-size: 48px; color: #b45309; font-weight: 800;">${Number(percentage).toFixed(1)}%</p>
            ${subject ? `<p style="margin: 0; color: #92400e;"><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <p style="font-weight: 600; color: #b45309; text-align: center;">Urgent: Please attend upcoming classes regularly to avoid debarment.</p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
            This is an automated notification from the <strong>AttendEase Management System</strong>.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Test email helper
 */
exports.sendTestEmail = async (targetEmail) => {
  return exports.sendEmail({
    to: targetEmail,
    subject: '✅ AttendEase Email Configuration Test',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 40px; background: #f3f4f6;">
        <div style="background: white; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-top: 0;">Success!</h2>
          <p style="font-size: 16px;">Your <strong>AttendEase</strong> email settings are working perfectly.</p>
          <p style="color: #666;">The system is now capable of sending attendance alerts to students.</p>
          <div style="margin-top: 30px; padding: 20px; background: #ecfdf5; border-radius: 8px; border: 1px solid #10b981;">
            <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Status:</strong> Active & Ready</p>
          </div>
        </div>
      </div>
    `,
  });
};
