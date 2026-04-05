const twilio = require('twilio');

// Lazy-initialize client so server doesn't crash if creds not set yet
let client = null;
const getClient = () => {
  if (!client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || sid.startsWith('AC') && sid.length < 30) {
      throw new Error('TWILIO_ACCOUNT_SID not configured in .env');
    }
    if (!token || token === 'your_twilio_auth_token') {
      throw new Error('TWILIO_AUTH_TOKEN not configured in .env');
    }
    client = twilio(sid, token);
  }
  return client;
};

/**
 * Normalize any Indian phone number to whatsapp:+91XXXXXXXXXX
 */
const formatPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, '');           // strip non-digits
  if (cleaned.startsWith('0'))  cleaned = cleaned.slice(1);       // remove leading 0
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    // already has country code
  } else if (cleaned.length === 10) {
    cleaned = '91' + cleaned;                        // add India code
  }
  return `whatsapp:+${cleaned}`;
};

/**
 * Core send function — returns { success, sid } or { success: false, error }
 */
exports.sendWhatsApp = async (phone, message) => {
  if (!phone) return { success: false, error: 'No phone number provided' };

  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const to   = formatPhone(phone);

  // SAFETY CHECK: Avoid hitting Twilio daily limits on dummy seed data
  // Only send to the user's actual number or non-dummy numbers
  const isDummy = to.includes('+919876') || to.includes('+91978');
  if (isDummy && !to.includes('7359959638')) {
    console.log(`ℹ️ Skipping WhatsApp to dummy number: ${to}`);
    return { success: true, sid: 'skipped_dummy_dev_mode' };
  }
  try {
    const cl     = getClient();
    const result = await cl.messages.create({ body: message, from, to });
    console.log(`📱 WhatsApp sent → ${to}  SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error(`❌ WhatsApp failed → ${phone}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Absent notification message
 */
exports.sendAbsentWhatsApp = async (student, subject, date) => {
  const formatted = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const message =
`🎓 *AttendEase – Attendance Alert*

Hello *${student.name}*,

You were marked *ABSENT* for:
📚 Subject: *${subject}*
📅 Date: ${formatted}
🆔 Enrollment: ${student.enrollmentNumber || 'N/A'}

Please ensure you maintain *75% attendance* to remain eligible for exams.

_AttendEase Smart Attendance System_`;

  return exports.sendWhatsApp(student.phone, message);
};

/**
 * Low-attendance warning message
 */
exports.sendLowAttendanceWhatsApp = async (student, percentage, subject) => {
  const needed = Math.ceil((0.75 * 100 - percentage * 1) / (100 - 75));   // rough estimate

  const message =
`⚠️ *AttendEase – Low Attendance Warning*

Hello *${student.name}*,

Your attendance has dropped below the required threshold!

📊 Current:  *${Number(percentage).toFixed(1)}%*
✅ Required: *75%*${subject ? `\n📚 Subject:  *${subject}*` : ''}

Please attend upcoming classes regularly to avoid debarment from exams.

_AttendEase Smart Attendance System_`;

  return exports.sendWhatsApp(student.phone, message);
};

/**
 * Quick test helper – call directly to verify credentials work
 */
exports.sendTestWhatsApp = async (targetPhone) => {
  const message =
`✅ *AttendEase – Test Message*

WhatsApp notifications are now *active* on your AttendEase system!

You will receive alerts when:
• A student is marked absent
• Attendance drops below 75%

_This is a test — no action needed._`;

  return exports.sendWhatsApp(targetPhone, message);
};
