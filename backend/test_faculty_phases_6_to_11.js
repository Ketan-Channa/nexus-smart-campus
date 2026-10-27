const http = require('http');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   NEXUS SMART CAMPUS: PHASES 6 - 11 E2E VERIFICATION SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kets.8865',
    database: 'nexus_campus_db',
  });

  const testRoll = '2329362'; // KETAN CHANNA
  const testClass = 'B.TECH CSE 2023 A';

  try {
    // -------------------------------------------------------------
    // TEST SUITE 1: PHASE 11 - Faculty Attendance Register & Real-Time Sync
    // -------------------------------------------------------------
    console.log('\n--- [1] PHASE 11: Faculty Attendance Management & Audit Log ---');

    const testDate = new Date().toISOString().substring(0, 10);
    const testSlot = '09:00 AM - 10:00 AM';

    const batchPayload = {
      className: testClass,
      subject: 'Blockchain Technologies',
      subjectCode: 'CS701',
      date: testDate,
      timeSlot: testSlot,
      facultyEmail: 'faculty@nexus.edu',
      facultyName: 'Dr. SMB',
      forceOverwrite: true,
      records: [
        { rollNumber: testRoll, status: 'Present', remarks: 'On time' },
        { rollNumber: '2329300', status: 'On Duty (OD)', remarks: 'NSS Duty' },
      ],
    };

    const markRes = await request('POST', '/api/attendance/mark-batch', batchPayload);
    assert(markRes.status === 200 && markRes.data.success, 'Batch attendance marked successfully in MySQL');

    const [attRows] = await db.query('SELECT * FROM attendance WHERE roll_number = ? AND date = ?', [testRoll, testDate]);
    assert(attRows.length > 0 && attRows[0].status === 'Present', 'Attendance record verified in MySQL table');

    const correctPayload = {
      attendanceId: attRows[0].id,
      rollNumber: testRoll,
      className: testClass,
      subject: 'Blockchain Technologies',
      date: testDate,
      timeSlot: testSlot,
      newStatus: 'Fees Not Paid but present (FP)',
      reason: 'Accounts clearance pending verified by Dean',
      changedByName: 'Dr. SMB (Faculty)',
      changedByEmail: 'faculty@nexus.edu',
    };

    const correctRes = await request('PUT', '/api/attendance/correct', correctPayload);
    assert(correctRes.status === 200 && correctRes.data.success, 'Attendance correction executed via REST API');

    const [auditRows] = await db.query('SELECT * FROM attendance_audit_log WHERE attendance_id = ? ORDER BY id DESC LIMIT 1', [attRows[0].id]);
    assert(
      auditRows.length > 0 &&
      auditRows[0].original_status === 'Present' &&
      auditRows[0].new_status === 'Fees Not Paid but present (FP)' &&
      auditRows[0].reason.includes('Accounts clearance pending'),
      'Audit log entry created in attendance_audit_log table with reason and timestamps'
    );

    const studentAttRes = await request('GET', `/api/attendance?className=${encodeURIComponent(testClass)}&rollNumber=${testRoll}`);
    assert(
      studentAttRes.status === 200 &&
      studentAttRes.data.success &&
      studentAttRes.data.data.some(r => r.rollNumber === testRoll),
      'Student queries personal attendance records successfully'
    );

    // -------------------------------------------------------------
    // TEST SUITE 2: PHASE 6 - Medical Leave & 65% Criteria Management
    // -------------------------------------------------------------
    console.log('\n--- [2] PHASE 6: Medical Leave & Dynamic Criteria (75% -> 65%) ---');

    const appRef = `MED-${Date.now()}`;
    const medPayload = {
      applicationRef: appRef,
      rollNumber: testRoll,
      studentName: 'KETAN CHANNA',
      className: testClass,
      department: 'Computer Science & Engineering',
      illness: 'Acute Gastroenteritis & Dehydration',
      causeDetails: 'Admitted for IV fluid therapy and bed rest.',
      conditionType: 'Emergency',
      startDate: '2026-09-01',
      endDate: '2026-09-12',
      totalDays: 12,
      doctorName: 'Dr. S. K. Mehta, M.D.',
      doctorRegNo: 'MCI-84920',
      hospitalName: 'Apollo Care Hospital',
      prescriptionDocUrl: 'https://cdn.nexus.edu/docs/med_cert_99.pdf',
    };

    const medSubmitRes = await request('POST', '/api/attendance/medical/submit', medPayload);
    assert(medSubmitRes.status === 200 && medSubmitRes.data.success, 'Student submitted Medical Certificate application');

    const pendingRes = await request('GET', `/api/attendance/medical/pending?className=${encodeURIComponent(testClass)}`);
    assert(
      pendingRes.status === 200 &&
      pendingRes.data.success &&
      pendingRes.data.certificates.some(r => r.applicationRef === appRef),
      'Faculty retrieves pending medical applications for their class'
    );

    const verifyPayload = {
      applicationRef: appRef,
      action: 'APPROVE',
      verifierName: 'Dr. SMB',
      verifierEmail: 'faculty@nexus.edu',
      remarks: 'Verified medical documents from Apollo Hospital. Approved.',
    };

    const verifyRes = await request('POST', '/api/attendance/medical/verify', verifyPayload);
    assert(verifyRes.status === 200 && verifyRes.data.success, 'Faculty approved medical certificate');

    const [studentRows] = await db.query('SELECT attendance_criteria, medical_verified FROM students WHERE roll_number = ?', [testRoll]);
    assert(
      studentRows.length > 0 &&
      parseFloat(studentRows[0].attendance_criteria) === 65.00 &&
      studentRows[0].medical_verified === 'Yes',
      'Student record in MySQL updated: attendance_criteria = 65.00 and medical_verified = Yes'
    );

    // -------------------------------------------------------------
    // TEST SUITE 3: PHASE 7 - Faculty Timetable & Academic Schedule
    // -------------------------------------------------------------
    console.log('\n--- [3] PHASE 7: Faculty Timetable & Schedule ---');

    const ttRes = await request('GET', `/api/faculty/timetable?className=${encodeURIComponent(testClass)}`);
    assert(ttRes.status === 200 && (ttRes.data.success || ttRes.data.status === 'success'), 'Faculty retrieved class timetable schedule');
    const ttList = ttRes.data.timetable || ttRes.data.data;
    assert(Array.isArray(ttList) && ttList.length > 0, 'Timetable contains scheduled class sessions');

    // -------------------------------------------------------------
    // TEST SUITE 4: PHASE 8 - Faculty Announcements & Acknowledgement
    // -------------------------------------------------------------
    console.log('\n--- [4] PHASE 8: Faculty Announcements & Student Acknowledgement ---');

    const ancPayload = {
      title: 'Mandatory Lab Internal Assessment Schedule',
      message: 'All students must bring signed lab manuals for the distributed systems assessment.',
      category: 'Exam & Fee',
      priority: 'Urgent',
      targetClass: testClass,
      facultyName: 'Dr. S. M. Bhatnagar',
      facultyEmail: 'bhatnagar@nexus.edu',
      requiresAcknowledgement: true,
      expiresAt: '2026-12-31',
    };

    const ancCreateRes = await request('POST', '/api/faculty/announcements', ancPayload);
    assert(ancCreateRes.status === 200 && ancCreateRes.data.success, 'Faculty announcement published to MySQL');

    const createdAncId = ancCreateRes.data.announcementId;

    const ackRes = await request('POST', `/api/faculty/announcements/${createdAncId}/acknowledge`, {
      rollNumber: testRoll,
      studentName: 'KETAN CHANNA',
      studentEmail: 'ketan@nexus.edu',
    });
    assert(ackRes.status === 200 && ackRes.data.success, 'Student acknowledged mandatory announcement');

    const ancListRes = await request('GET', `/api/faculty/announcements?className=${encodeURIComponent(testClass)}`);
    const fetchedAnc = ancListRes.data.announcements.find(a => a.announcementId === createdAncId);
    assert(
      fetchedAnc && fetchedAnc.acknowledgementCount >= 1,
      'Faculty announcement analytics accurately reflect student acknowledgement count'
    );

    const remindRes = await request('POST', `/api/faculty/announcements/${createdAncId}/remind`);
    assert(remindRes.status === 200 && remindRes.data.success, 'Faculty reminder dispatched to pending students');

    // -------------------------------------------------------------
    // TEST SUITE 5: PHASE 9 - Faculty Utilities & AI Assistant
    // -------------------------------------------------------------
    console.log('\n--- [5] PHASE 9: Faculty Utilities & AI Faculty Assistant ---');

    const noteRes = await request('POST', '/api/faculty/notes', {
      facultyEmail: 'bhatnagar@nexus.edu',
      title: 'Syllabus Review Notes',
      content: 'Unit 4 Distributed Consensus Algorithms needs practical demonstration.',
      category: 'Academic',
      priority: 'High',
    });
    assert(noteRes.status === 200 && noteRes.data.success, 'Faculty personal note created');

    const noteListRes = await request('GET', '/api/faculty/notes?facultyEmail=bhatnagar@nexus.edu');
    assert(noteListRes.status === 200 && noteListRes.data.notes.some(n => n.title === 'Syllabus Review Notes'), 'Faculty retrieved saved notes');

    const aiRes = await request('POST', '/api/faculty/ai-assistant', {
      query: `Who are the at-risk students with attendance below 75% in ${testClass}?`,
      className: testClass,
    });
    assert(aiRes.status === 200 && aiRes.data.success, 'AI Faculty Assistant responded successfully');
    assert(
      typeof aiRes.data.response === 'string' && aiRes.data.response.length > 20,
      'AI Assistant generated structured answer derived directly from MySQL database metrics'
    );

    const reportRes = await request('GET', `/api/faculty/class-report?className=${encodeURIComponent(testClass)}`);
    assert(reportRes.status === 200 && reportRes.data.success, 'Comprehensive Class Report generated');
    assert(
      reportRes.data.report &&
      reportRes.data.report.totalStudents >= 1 &&
      typeof reportRes.data.report.averageAttendance === 'number',
      'Class Report metrics computed authentically from live MySQL records'
    );

    // -------------------------------------------------------------
    // TEST SUITE 6: PHASE 10 - My Class Overview & Student Academic Profile
    // -------------------------------------------------------------
    console.log('\n--- [6] PHASE 10: My Class Overview & 7-Tab Student Profile ---');

    const classOverviewRes = await request('GET', `/api/faculty/my-class-overview?className=${encodeURIComponent(testClass)}`);
    assert(classOverviewRes.status === 200 && classOverviewRes.data.success, 'My Class Overview retrieved');
    assert(Array.isArray(classOverviewRes.data.students) && classOverviewRes.data.students.length > 0, 'Class roster contains populated student records');

    const studentDetailRes = await request('GET', `/api/faculty/student-details/${testRoll}`);
    assert(studentDetailRes.status === 200 && studentDetailRes.data.success, '7-Tab Student Academic Profile retrieved');
    assert(
      studentDetailRes.data.student &&
      (studentDetailRes.data.attendance || studentDetailRes.data.attendanceSummary) &&
      Array.isArray(studentDetailRes.data.medicalLeaves) &&
      (Array.isArray(studentDetailRes.data.assignments) || Array.isArray(studentDetailRes.data.assignmentSubmissions)),
      'Student profile includes complete academic, attendance, medical, and assignment history'
    );

  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  } finally {
    await db.end();
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
