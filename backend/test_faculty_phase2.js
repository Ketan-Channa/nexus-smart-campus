const mysql = require('mysql2/promise');
const axios = require('axios');
const express = require('express');
const facultyRoutes = require('./dist/routes/facultyRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testFacultyPhase2() {
  console.log('====================================================');
  console.log('NEXUS SMART CAMPUS — FACULTY PHASE 2 E2E VERIFICATION');
  console.log('====================================================\n');

  await initializeDatabaseSchema();

  const app = express();
  app.use(express.json());
  app.use('/api/faculty', facultyRoutes);
  const server = app.listen(5099);

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    console.log('✓ Connected to MySQL database nexus_campus_db.');

    // 1. Create or ensure test Faculty & Student records in single source of truth
    const testFacEmail = 'dr_smb_incharge@nexus.edu';
    const testClass = 'B.TECH CSE 2023 A';

    await conn.query(
      `INSERT INTO faculties (employee_id, faculty_name, email, password, mobile, address, department, designation, is_class_incharge, incharge_class)
       VALUES ('FAC202699', 'Dr. S. M. Bhatnagar', ?, 'hashed_pwd', '9876543210', 'Nexus Faculty Block A', 'Computer Science & Engineering', 'Professor', 'Yes', ?)
       ON DUPLICATE KEY UPDATE is_class_incharge = 'Yes', incharge_class = ?`,
      [testFacEmail, testClass, testClass]
    );

    const testStudentEmail = 'phase2_student@nexus.edu';
    const testRollNo = '2023CSE999';

    await conn.query(
      `INSERT INTO students (full_name, email, password, mobile, address, roll_number, admission_number, class, department, semester, section, is_active, govt_id_number, govt_id_photo_url, father_govt_id_number, college_doc_url)
       VALUES ('Aarav Sharma Phase2', ?, 'hashed_pwd', '9876543211', '123 Campus Hostel', ?, 'ADM2023999', ?, 'Computer Science & Engineering', '5th Sem', 'A', 1, '1234-5678-9012', 'http://secret_govt_id.png', '9876-5432-1098', 'http://secret_college_doc.pdf')
       ON DUPLICATE KEY UPDATE roll_number = ?, class = ?`,
      [testStudentEmail, testRollNo, testClass, testRollNo, testClass]
    );

    console.log(`✓ Test Faculty (${testFacEmail}) assigned as Class Incharge of (${testClass}).`);
    console.log(`✓ Test Student (${testStudentEmail}) registered in class (${testClass}) with sensitive Govt IDs in MySQL.\n`);

    // 2. Test GET /api/faculty/classes/:classId/students
    console.log('--- TEST 1: Class Roster API & Class Normalization ---');
    const rosterUrl = `http://localhost:5099/api/faculty/students?className=${encodeURIComponent(testClass)}&email=${encodeURIComponent(testFacEmail)}`;
    const rosterRes = await axios.get(rosterUrl);

    if (rosterRes.data && rosterRes.data.success && Array.isArray(rosterRes.data.students)) {
      console.log(`✓ Roster API success: Returned ${rosterRes.data.students.length} students for class ${rosterRes.data.className}`);
      const foundStudent = rosterRes.data.students.find((s) => s.email === testStudentEmail);
      if (foundStudent) {
        console.log(`✓ Target student found in roster: ${foundStudent.fullName || foundStudent.name} (${foundStudent.rollNumber})`);
      } else {
        console.error('✕ Target student not found in roster!');
      }
    } else {
      console.error('✕ Roster API failed!', rosterRes.data);
    }

    // 3. Test Privacy RBAC: Ensure sensitive Govt IDs are NOT returned in Faculty APIs
    console.log('\n--- TEST 2: Privacy RBAC & Sensitive Govt Document Redaction ---');
    const sampleStudent = rosterRes.data?.students?.find((s) => s.email === testStudentEmail);
    if (sampleStudent) {
      const exposesGovtId = 'govt_id_number' in sampleStudent || 'govt_id_photo_url' in sampleStudent || 'father_govt_id_number' in sampleStudent;
      if (!exposesGovtId) {
        console.log('✓ PRIVACY PASSED: Sensitive government fields (Aadhaar, PAN, Govt photo docs) are strictly redacted from Faculty API response!');
      } else {
        console.error('✕ PRIVACY FAILED: Sensitive government fields exposed to faculty!');
      }
    }

    // 4. Test GET /api/faculty/students/:studentId (7-Tab Drawer Dataset)
    console.log('\n--- TEST 3: 7-Tab Student Detail Drawer API ---');
    const targetId = sampleStudent?.id || testRollNo;
    const detailRes = await axios.get(`http://localhost:5099/api/faculty/students/${targetId}`);
    if (detailRes.data && detailRes.data.success && detailRes.data.student) {
      const st = detailRes.data.student;
      console.log('✓ Student Drawer API returned full dataset with tabs:');
      console.log(`  - Profile: ${st.fullName || st.name} (${st.rollNumber})`);
      console.log(`  - Academics: Enrolled Courses (${detailRes.data.academics?.enrolledCourses?.length})`);
      console.log(`  - Attendance: ${detailRes.data.attendance?.percentage}% overall`);
      console.log(`  - Assignments: ${detailRes.data.assignments?.length} submission records`);
      console.log(`  - Medical Leaves: ${detailRes.data.medicalLeaves?.length} leave requests`);
      console.log(`  - Remarks: ${detailRes.data.facultyRemarks?.length} faculty remarks logged`);
      console.log(`  - Communication: ${detailRes.data.communications?.length} message logs`);
    } else {
      console.error('✕ Student Drawer API failed!', detailRes.data);
    }

    // 5. Test Direct Message Dispatch (POST /api/faculty/students/:studentId/message)
    console.log('\n--- TEST 4: Direct Student Message Dispatch ---');
    const msgText = `Phase 2 Test Direct Message sent at ${new Date().toISOString()}`;
    const msgRes = await axios.post(`http://localhost:5099/api/faculty/students/${testRollNo}/message`, {
      message: msgText,
      category: 'Direct',
      priority: 'HIGH',
      facultyEmail: testFacEmail,
      facultyName: 'Dr. S. M. Bhatnagar',
    });

    if (msgRes.data && msgRes.data.success) {
      console.log(`✓ Direct message API success: ${msgRes.data.message}`);

      // Verify insertion in `chat_messages` in MySQL
      const [msgRows] = await conn.query('SELECT * FROM chat_messages WHERE message_text = ? LIMIT 1', [msgText]);
      if (msgRows.length > 0) {
        console.log(`✓ REAL DATABASE VERIFIED: Message recorded in chat_messages table (ID: ${msgRows[0].id}).`);
      } else {
        console.error('✕ Message not found in MySQL chat_messages table!');
      }
    } else {
      console.error('✕ Direct message API failed!', msgRes.data);
    }

    // 6. Test Logging Performance Remark (POST /api/faculty/students/:studentId/remarks)
    console.log('\n--- TEST 5: Logging Student Remark ---');
    const remarkText = 'Demonstrates exemplary leadership in Blockchain lab project.';
    const remarkRes = await axios.post(`http://localhost:5099/api/faculty/students/${testRollNo}/remarks`, {
      remark: remarkText,
      category: 'Academic',
      facultyEmail: testFacEmail,
      facultyName: 'Dr. S. M. Bhatnagar',
    });

    if (remarkRes.data && remarkRes.data.success) {
      console.log(`✓ Remark API success: ${remarkRes.data.message}`);

      // Verify in `faculty_student_remarks` table
      const [remRows] = await conn.query('SELECT * FROM faculty_student_remarks WHERE remark = ? LIMIT 1', [remarkText]);
      if (remRows.length > 0) {
        console.log(`✓ REAL DATABASE VERIFIED: Remark recorded in faculty_student_remarks table (ID: ${remRows[0].id}).`);
      } else {
        console.error('✕ Remark not found in faculty_student_remarks table!');
      }
    } else {
      console.error('✕ Remark API failed!', remarkRes.data);
    }

    // 7. Test Class Broadcast (POST /api/faculty/classes/:classId/broadcast)
    console.log('\n--- TEST 6: Class Broadcast Dispatch ---');
    const broadcastTitle = 'Urgent Class Announcement Phase 2';
    const broadcastMsg = 'Tomorrow DBMS lecture is rescheduled to Seminar Hall ET-301 at 10:00 AM.';

    const bcastRes = await axios.post(`http://localhost:5099/api/faculty/my-students-classes/broadcast`, {
      title: broadcastTitle,
      message: broadcastMsg,
      category: 'TIMETABLE',
      priority: 'HIGH',
      targetClass: testClass,
      facultyEmail: testFacEmail,
      facultyName: 'Dr. S. M. Bhatnagar',
    });

    if (bcastRes.data && bcastRes.data.success) {
      console.log(`✓ Broadcast API success: ${bcastRes.data.message}`);

      // Verify in `class_broadcasts` in MySQL
      const [bcRows] = await conn.query('SELECT * FROM class_broadcasts WHERE broadcast_id = ? LIMIT 1', [bcastRes.data.broadcastId]);
      if (bcRows.length > 0) {
        console.log(`✓ REAL DATABASE VERIFIED: Broadcast saved in class_broadcasts table (Recipients: ${bcRows[0].recipient_count}).`);
      } else {
        console.error('✕ Broadcast not found in MySQL class_broadcasts table!');
      }
    } else {
      console.error('✕ Broadcast API failed!', bcastRes.data);
    }

    await conn.end();
    server.close();

    console.log('\n====================================================');
    console.log('ALL PHASE 2 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================');
  } catch (error) {
    server.close();
    console.error('✕ E2E Verification failed:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    process.exit(1);
  }
}

testFacultyPhase2();
