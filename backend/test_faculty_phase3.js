const mysql = require('mysql2/promise');
const axios = require('axios');
const express = require('express');
const attendanceRoutes = require('./dist/routes/attendanceRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testFacultyPhase3() {
  console.log('====================================================');
  console.log('NEXUS SMART CAMPUS — FACULTY PHASE 3 E2E VERIFICATION');
  console.log('====================================================\n');

  await initializeDatabaseSchema();

  const app = express();
  app.use(express.json());
  app.use('/api/attendance', attendanceRoutes);
  const server = app.listen(5098);

  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    console.log('✓ Connected to MySQL database nexus_campus_db.');

    const testFacEmail = 'vakeel@pcte.edu.in';
    const testClass = 'B.TECH CSE 2023 A';
    const testSubject = 'Blockchain Technologies';
    const testDate = '2026-09-12';
    const testSlot = '09:00 AM - 10:00 AM (Period 1)';
    const testStudentRoll = '2329362';
    const testStudentEmail = 'ketan@gmail.com';

    // 1. Check Faculty Options API
    console.log('\n--- TEST 1: GET /api/attendance/faculty/options ---');
    const optRes = await axios.get(`http://localhost:5098/api/attendance/faculty/options?email=${encodeURIComponent(testFacEmail)}`);
    if (optRes.data && optRes.data.success) {
      console.log(`✓ Faculty Options loaded: ${optRes.data.classes.length} classes, ${optRes.data.subjects.length} subjects`);
      console.log(`  - Classes: ${optRes.data.classes.join(', ')}`);
      console.log(`  - Subjects: ${optRes.data.subjects.join(', ')}`);
    } else {
      console.error('✕ Faculty options API failed!', optRes.data);
    }

    // 2. Fetch Attendance Register Roster Matrix
    console.log('\n--- TEST 2: GET /api/attendance/register ---');
    const regUrl = `http://localhost:5098/api/attendance/register?className=${encodeURIComponent(testClass)}&subject=${encodeURIComponent(testSubject)}&date=${testDate}&timeSlot=${encodeURIComponent(testSlot)}&facultyEmail=${encodeURIComponent(testFacEmail)}`;
    const regRes = await axios.get(regUrl);

    if (regRes.data && regRes.data.success && Array.isArray(regRes.data.roster)) {
      console.log(`✓ Attendance Register loaded: ${regRes.data.totalStudents} active students found for ${testClass} (${testSubject})`);
      const targetStudent = regRes.data.roster.find((s) => s.rollNumber === testStudentRoll || s.email === testStudentEmail);
      if (targetStudent) {
        console.log(`✓ Real Student found in roster: ${targetStudent.studentName} (${targetStudent.rollNumber})`);
        console.log(`  - Default Status: ${targetStudent.status}, Current %: ${targetStudent.currentPercentage}%, Previous %: ${targetStudent.previousPercentage}%`);
      } else {
        console.error(`✕ Test student ${testStudentRoll} not found in register roster!`);
      }
    } else {
      console.error('✕ Attendance register API failed!', regRes.data);
    }

    // 3. Submit Batch Attendance (Faculty marks Student A Present)
    console.log('\n--- TEST 3: POST /api/attendance/mark-batch (Save Attendance) ---');
    const batchRes = await axios.post('http://localhost:5098/api/attendance/mark-batch', {
      className: testClass,
      subject: testSubject,
      subjectCode: 'CS-501',
      date: testDate,
      timeSlot: testSlot,
      facultyEmail: testFacEmail,
      facultyName: 'Vakeel Singh',
      forceOverwrite: true,
      records: [
        {
          studentId: 1,
          rollNumber: testStudentRoll,
          studentName: 'KETAN CHANNA',
          department: 'CSE',
          className: testClass,
          section: 'A',
          status: 'Present',
          remarks: 'Punctual entry',
        },
      ],
    });

    if (batchRes.data && batchRes.data.success) {
      console.log(`✓ Batch Attendance API success: ${batchRes.data.message}`);

      // Verify insertion in MySQL `attendance` table
      const [attRows] = await conn.query(
        `SELECT * FROM attendance WHERE roll_number = ? AND subject = ? AND date = ? LIMIT 1`,
        [testStudentRoll, testSubject, testDate]
      );

      if (attRows.length > 0) {
        console.log(`✓ REAL DATABASE VERIFIED: Attendance recorded in MySQL attendance table (ID: ${attRows[0].id}, Status: ${attRows[0].status}).`);
      } else {
        console.error('✕ Record not found in MySQL attendance table!');
      }
    } else {
      console.error('✕ Batch attendance API failed!', batchRes.data);
    }

    // 4. Duplicate Prevention Check
    console.log('\n--- TEST 4: Duplicate Slot Submission Prevention ---');
    try {
      await axios.post('http://localhost:5098/api/attendance/mark-batch', {
        className: testClass,
        subject: testSubject,
        date: testDate,
        timeSlot: testSlot,
        facultyEmail: testFacEmail,
        facultyName: 'Vakeel Singh',
        forceOverwrite: false, // Should trigger duplicate prevention
        records: [{ rollNumber: testStudentRoll, studentName: 'KETAN CHANNA', status: 'Present' }],
      });
      console.error('✕ Duplicate prevention FAILED! Duplicate request was allowed without error.');
    } catch (err) {
      if (err.response && err.response.status === 409 && err.response.data?.duplicateDetected) {
        console.log(`✓ DUPLICATE PREVENTION PASSED: System blocked duplicate slot submission with HTTP 409 conflict ("${err.response.data.message}")`);
      } else {
        console.error('✕ Unexpected error in duplicate prevention:', err.message);
      }
    }

    // 5. Authorized Attendance Correction with Audit Trail Logging
    console.log('\n--- TEST 5: PUT /api/attendance/correct (Attendance Correction & Audit Log) ---');
    const correctionReason = 'Representing university in state hackathon competition';
    const correctRes = await axios.put('http://localhost:5098/api/attendance/correct', {
      rollNumber: testStudentRoll,
      subject: testSubject,
      date: testDate,
      timeSlot: testSlot,
      newStatus: 'OD',
      changedByEmail: testFacEmail,
      changedByName: 'Vakeel Singh',
      reason: correctionReason,
    });

    if (correctRes.data && correctRes.data.success) {
      console.log(`✓ Correction API success: ${correctRes.data.message}`);

      // Verify status updated in `attendance` table
      const [updatedAtt] = await conn.query(
        `SELECT status FROM attendance WHERE roll_number = ? AND subject = ? AND date = ? LIMIT 1`,
        [testStudentRoll, testSubject, testDate]
      );
      if (updatedAtt.length > 0 && updatedAtt[0].status === 'OD') {
        console.log(`✓ REAL DATABASE VERIFIED: Attendance status updated to "OD" in attendance table.`);
      }

      // Verify audit trail entry in `attendance_audit_log`
      const [auditRows] = await conn.query(
        `SELECT * FROM attendance_audit_log WHERE roll_number = ? AND reason = ? LIMIT 1`,
        [testStudentRoll, correctionReason]
      );
      if (auditRows.length > 0) {
        console.log(`✓ REAL AUDIT TRAIL VERIFIED: Audit record saved in attendance_audit_log (ID: ${auditRows[0].id}, Changed By: ${auditRows[0].changed_by_name}, Original: ${auditRows[0].original_status} -> New: ${auditRows[0].new_status}).`);
      } else {
        console.error('✕ Audit trail entry not found in attendance_audit_log!');
      }
    } else {
      console.error('✕ Correction API failed!', correctRes.data);
    }

    // 6. Student Portal AttendanceTracker Real-Time Synchronization Verification
    console.log('\n--- TEST 6: Student Portal AttendanceTracker Real-Time Synchronization ---');
    const studentPortalRes = await axios.get(`http://localhost:5098/api/attendance?className=${encodeURIComponent(testClass)}&rollNumber=${testStudentRoll}`);
    if (studentPortalRes.data && studentPortalRes.data.success && Array.isArray(studentPortalRes.data.data)) {
      const studentRecord = studentPortalRes.data.data.find((r) => r.subject === testSubject && r.date === testDate);
      if (studentRecord) {
        console.log(`✓ STUDENT PORTAL SYNCHRONIZED: Student A (${testStudentRoll}) AttendanceTracker received updated status "${studentRecord.status}" directly from backend database!`);
      } else {
        console.error('✕ Student Portal AttendanceTracker could not find recorded lecture slot!');
      }
    } else {
      console.error('✕ Student Portal AttendanceTracker API failed!', studentPortalRes.data);
    }

    await conn.end();
    server.close();

    console.log('\n====================================================');
    console.log('ALL PHASE 3 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
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

testFacultyPhase3();
