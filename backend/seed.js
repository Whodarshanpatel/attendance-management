/**
 * AttendEase - Full Database Seed Script
 * Seeds: 6 teachers, 100 students, 30 attendance sessions
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Notification = require('./models/Notification');

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEACHERS = [
  { name: 'Prof. Anjali Sharma', email: 'anjali.sharma@college.edu', phone: '+919876501001', course: 'B.Tech' },
  { name: 'Dr. Rajesh Mehta', email: 'rajesh.mehta@college.edu', phone: '+919876501002', course: 'BCA' },
  { name: 'Prof. Priya Nair', email: 'priya.nair@college.edu', phone: '+919876501003', course: 'M.Tech' },
  { name: 'Dr. Vikram Singh', email: 'vikram.singh@college.edu', phone: '+919876501004', course: 'B.Sc' },
  { name: 'Prof. Sunita Patel', email: 'sunita.patel@college.edu', phone: '+919876501005', course: 'BBA' },
  { name: 'Dr. Arjun Krishnan', email: 'arjun.krishnan@college.edu', phone: '+919876501006', course: 'MCA' },
];

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Darshan', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Karan',
  'Priya', 'Ananya', 'Diya', 'Aisha', 'Kavya', 'Riya', 'Shreya', 'Meera', 'Isha', 'Nisha',
  'Pooja', 'Sneha', 'Divya', 'Avni', 'Tanvi', 'Simran', 'Kritika', 'Sakshi', 'Neha', 'Mansi',
  'Rahul', 'Rohan', 'Nikhil', 'Akash', 'Amit', 'Suresh', 'Vignesh', 'Harish', 'Deepak', 'Sanjay',
  'Lakshmi', 'Swati', 'Anjali', 'Rekha', 'Sunita', 'Geeta', 'Radha', 'Poonam', 'Shweta', 'Vibha',
  'Farhan', 'Zoya', 'Imran', 'Nadir', 'Raza', 'Sara', 'Hassan', 'Sana', 'Ali', 'Fatima',
  'Tejas', 'Omkar', 'Rushikesh', 'Prathamesh', 'Yash', 'Sahil', 'Varun', 'Gaurav', 'Tarun', 'Mohit',
  'Chandni', 'Bharti', 'Pallavi', 'Roshni', 'Hina', 'Seema', 'Kavita', 'Lalita', 'Jyoti', 'Rani',
  'Parth', 'Neel', 'Hardik', 'Jay', 'Mihir', 'Raj', 'Dev', 'Om', 'Rishab', 'Chirag',
];

const LAST_NAMES = [
  'Patel', 'Shah', 'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Yadav', 'Mehta', 'Joshi',
  'Nair', 'Pillai', 'Menon', 'Iyer', 'Reddy', 'Rao', 'Naidu', 'Krishnan', 'Murthy', 'Rajan',
  'Khan', 'Ansari', 'Siddiqui', 'Sheikh', 'Malik', 'Chaudhary', 'Mishra', 'Tiwari', 'Pandey', 'Shukla',
  'Desai', 'Dave', 'Bhatt', 'Trivedi', 'Brahmbhatt', 'Parekh', 'Modi', 'Soni', 'Thakkar', 'Kapoor',
];

const COURSES = [
  { course: 'B.Tech', semesters: [1, 2, 3, 4, 5, 6, 7, 8] },
  { course: 'BCA', semesters: [1, 2, 3, 4, 5, 6] },
  { course: 'M.Tech', semesters: [1, 2, 3, 4] },
  { course: 'B.Sc', semesters: [1, 2, 3, 4, 5, 6] },
  { course: 'BBA', semesters: [1, 2, 3, 4, 5, 6] },
  { course: 'MCA', semesters: [1, 2, 3, 4] },
];

const SUBJECTS_BY_COURSE = {
  'B.Tech': ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Web Development', 'Machine Learning'],
  'BCA': ['Programming Fundamentals', 'Web Technologies', 'Database Management', 'Networking Basics', 'Software Development'],
  'M.Tech': ['Advanced Algorithms', 'Cloud Computing', 'AI & ML', 'Research Methodology', 'Big Data Analytics'],
  'B.Sc': ['Mathematics', 'Physics', 'Chemistry', 'Statistics', 'Computer Science'],
  'BBA': ['Business Management', 'Marketing', 'Financial Accounting', 'Organisational Behaviour', 'Economics'],
  'MCA': ['Java Programming', 'Python', 'System Programming', 'Distributed Systems', 'Project Management'],
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function pastDate(daysAgo) {
  const d = new Date('2026-03-16');
  d.setDate(d.getDate() - daysAgo);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected to MongoDB\n');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️   Cleared old data');

  const PASSWORD = 'password123'; // plain text — model pre-save hook hashes it

  // ── Teachers ──────────────────────────────────────────────────────────────────
  // Use create() one-by-one so the pre-save hash hook runs for each
  const teacherDocs = [];
  for (const t of TEACHERS) {
    const doc = await User.create({ ...t, password: PASSWORD, role: 'teacher', isActive: true });
    teacherDocs.push(doc);
  }
  const demoTeacher = await User.create({
    name: 'Professor Sharma', email: 'teacher@college.edu',
    password: PASSWORD, role: 'teacher', phone: '+919876543210', course: 'B.Tech', isActive: true,
  });
  const allTeachers = [...teacherDocs, demoTeacher];
  console.log(`👨‍🏫  Created ${allTeachers.length} teachers`);

  // ── Demo student user ─────────────────────────────────────────────────────────
  await User.create({
    name: 'Darshan Patel', email: 'student@college.edu',
    password: PASSWORD, role: 'student', phone: '+919876543211',
    course: 'B.Tech', semester: 5, enrollmentNumber: '2021BTCS001', isActive: true,
  });

  // ── 100 students ──────────────────────────────────────────────────────────────
  const studentDocs = [];
  for (let i = 0; i < 100; i++) {
    const courseObj = COURSES[i % COURSES.length];
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const semester = courseObj.semesters[i % courseObj.semesters.length];
    const yr = courseObj.course.startsWith('M') ? '2024' : '2021';
    const cc = courseObj.course.replace(/[\.\s]/g, '').toUpperCase().slice(0, 4);
    const enrollment = `${yr}${cc}${String(i + 2).padStart(3, '0')}`;

    studentDocs.push({
      name,
      enrollmentNumber: enrollment,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.edu`,
      phone: `+9197${String(80000000 + i).slice(0, 8)}`,
      course: courseObj.course,
      semester,
      addedBy: allTeachers[i % allTeachers.length]._id,
      isActive: true,
    });
  }

  // Add Darshan as a student record too
  studentDocs.push({
    name: 'Darshan Patel', enrollmentNumber: '2021BTCS001',
    email: 'student@college.edu', phone: '+919876543211',
    course: 'B.Tech', semester: 5, addedBy: demoTeacher._id, isActive: true,
  });

  const students = await Student.insertMany(studentDocs);
  console.log(`👥  Created ${students.length} students`);

  // ── 30 attendance sessions ────────────────────────────────────────────────────
  const attendanceRecords = [];
  const notifications = [];
  let dayOffset = 1;

  for (let s = 0; s < 30; s++) {
    dayOffset += randInt(1, 2);
    const teacher = allTeachers[s % allTeachers.length];
    const courseObj = COURSES[s % COURSES.length];
    const semester = courseObj.semesters[s % courseObj.semesters.length];
    const subject = rand(SUBJECTS_BY_COURSE[courseObj.course]);
    const date = pastDate(dayOffset);

    const cohort = students.filter(
      st => st.course === courseObj.course && st.semester === semester
    ).slice(0, randInt(15, 30));

    if (cohort.length === 0) continue;

    for (const student of cohort) {
      const roll = Math.random();
      const status = roll < 0.75 ? 'present' : roll < 0.90 ? 'absent' : 'late';

      attendanceRecords.push({
        student: student._id, subject, date, status,
        markedBy: teacher._id,
        course: student.course, semester: student.semester,
        remarks: status === 'absent' ? rand(['Medical leave', 'No information', 'Personal reasons', '']) : '',
      });

      if (status === 'absent') {
        notifications.push({
          recipient: teacher._id,
          student: student._id,
          type: 'absent',
          title: 'Student Absent',
          message: `${student.name} was absent in ${subject} on ${date.toDateString()}.`,
          subject,
          isRead: Math.random() > 0.4,
          channels: { inApp: true, email: false, whatsapp: false },
          emailSent: false, whatsappSent: false,
          createdAt: date,
        });
      }
    }

    process.stdout.write(`\r  Session ${s + 1}/30 — ${subject} (${courseObj.course}, ${cohort.length} students)`);
  }
  console.log('\n');

  // Deduplicate attendance (student + subject + date must be unique)
  const seen = new Set();
  const unique = attendanceRecords.filter(r => {
    const key = `${r.student}-${r.subject}-${r.date.toISOString().split('T')[0]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await Attendance.insertMany(unique, { ordered: false }).catch(() => { });
  console.log(`✅  Created ${unique.length} attendance records`);

  await Notification.insertMany(notifications.slice(0, 250));
  console.log(`🔔  Created ${Math.min(notifications.length, 250)} notifications`);

  // ── Final summary ─────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(56));
  console.log('🎉   SEED COMPLETE!');
  console.log('═'.repeat(56));
  console.log(`👨‍🏫  Teachers   : ${allTeachers.length}`);
  console.log(`👥  Students   : ${students.length}`);
  console.log(`📋  Attendance : ${unique.length} records across 30 sessions`);
  console.log(`🔔  Notifs     : ${Math.min(notifications.length, 250)}`);
  console.log('');
  console.log('🔑  DEMO LOGIN (password: password123)');
  console.log('─'.repeat(56));
  console.log('   teacher@college.edu  →  Professor Sharma  (Teacher)');
  console.log('   student@college.edu  →  Darshan Patel     (Student)');
  console.log('');
  console.log('   Other teacher logins:');
  TEACHERS.forEach(t => console.log(`   • ${t.email.padEnd(35)} ${t.name}`));
  console.log('═'.repeat(56));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Seed error:', err.message);
  process.exit(1);
});
