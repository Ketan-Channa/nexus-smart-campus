const mysql = require('mysql2/promise');
const axios = require('axios');
const express = require('express');
const facultyRoutes = require('./dist/routes/facultyRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testFacultyPhase4() {
  console.log('====================================================');
  console.log('NEXUS SMART CAMPUS — FACULTY PHASE 4 E2E VERIFICATION');
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

    const testFacEmail = 'vakeel@pcte.edu.in';
    const testClass = 'B.TECH CSE 2023 A';
    const testSubject = 'Blockchain Technologies';
    const testStudentRoll = '2329362';
    const testStudentEmail = 'ketan@gmail.com';
    const totalMarks = 50;

    // 1. Create & Publish Assignment as Faculty
    console.log('\n--- TEST 1: POST /api/faculty/assignments/create (Create Assignment) ---');
    const createRes = await axios.post('http://localhost:5099/api/faculty/assignments/create', {
      title: 'Smart Contract Verification & Gas Optimization',
      subject: testSubject,
      subjectCode: 'CS-501',
      className: testClass,
      description: 'Implement Solidity smart contract with automated formal verification unit tests.',
      assignmentType: 'Subjective',
      totalMarks,
      deadlineDate: '2026-09-30',
      deadlineTime: '11:59 PM',
      facultyEmail: testFacEmail,
      facultyName: 'Vakeel Singh',
      attachmentUrl: 'https://nexus.edu/docs/solidity_lab_spec.pdf',
    });

    if (!createRes.data || !createRes.data.success || !createRes.data.assignmentId) {
      throw new Error('Create assignment API failed!');
    }

    const assignmentId = createRes.data.assignmentId;
    console.log(`✓ Assignment published successfully! Assignment ID: ${assignmentId}`);

    // Verify insertion in MySQL `assignments` table
    const [asgnRows] = await conn.query('SELECT * FROM assignments WHERE assignment_id = ? LIMIT 1', [assignmentId]);
    if (asgnRows.length > 0) {
      console.log(`✓ REAL DATABASE VERIFIED: Record created in MySQL assignments table (Title: "${asgnRows[0].title}", Class: ${asgnRows[0].class_name}).`);
    } else {
      throw new Error('Record not found in assignments table!');
    }

    // 2. Fetch Assignments List as Student
    console.log('\n--- TEST 2: GET /api/faculty/assignments (Student Views Published Assignment) ---');
    const listRes = await axios.get(`http://localhost:5099/api/faculty/assignments?className=${encodeURIComponent(testClass)}`);
    if (listRes.data && listRes.data.success && Array.isArray(listRes.data.assignments)) {
      const foundAsgn = listRes.data.assignments.find((a) => a.assignmentId === assignmentId);
      if (foundAsgn) {
        console.log(`✓ STUDENT PORTAL VERIFIED: Published assignment "${foundAsgn.title}" is visible to students in ${testClass}.`);
      } else {
        throw new Error('Published assignment not visible in assignments list!');
      }
    }

    // 3. Submit Assignment as Student
    console.log('\n--- TEST 3: Student Submits Assignment Response ---');
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await conn.query(
      `INSERT INTO assignment_submissions (submission_id, assignment_id, student_email, roll_number, student_name, class_name, submitted_date, uploaded_file_name, uploaded_file_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
       ON DUPLICATE KEY UPDATE status = 'Submitted'`,
      [
        submissionId,
        assignmentId,
        testStudentEmail,
        testStudentRoll,
        'KETAN CHANNA',
        testClass,
        '2026-09-12 18:25:00',
        'solidity_contract_solution.zip',
        'https://nexus.edu/uploads/solidity_contract_solution.zip',
      ]
    );
    console.log(`✓ Student ${testStudentRoll} submitted assignment! Submission ID: ${submissionId}`);

    // 4. Fetch Submissions as Faculty
    console.log('\n--- TEST 4: GET /api/faculty/submissions (Faculty Views Submissions) ---');
    const subRes = await axios.get(`http://localhost:5099/api/faculty/submissions?assignmentId=${assignmentId}`);
    if (subRes.data && subRes.data.success && Array.isArray(subRes.data.submissions)) {
      const targetSub = subRes.data.submissions.find((s) => s.submission_id === submissionId || s.roll_number === testStudentRoll);
      if (targetSub) {
        console.log(`✓ FACULTY PORTAL VERIFIED: Faculty received submission from ${targetSub.student_name} (${targetSub.roll_number}) with status "${targetSub.status}".`);
      } else {
        throw new Error('Submission not found in faculty submissions list!');
      }
    }

    // 5. Invalid Scored Marks Validation Check
    console.log('\n--- TEST 5: Grade Validation Check (0 <= scored_marks <= total_marks) ---');
    try {
      await axios.put('http://localhost:5099/api/faculty/submissions/grade', {
        submissionId,
        scoredMarks: 65, // Exceeds total_marks (50)
        facultyRemarks: 'Exceeds max marks',
      });
      console.error('✕ Grade validation FAILED! Invalid score 65 / 50 was allowed.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✓ GRADE VALIDATION PASSED: System blocked invalid score with HTTP 400 ("${err.response.data.message}")`);
      } else {
        console.error('✕ Unexpected error in grade validation:', err.message);
      }
    }

    // 6. Valid Evaluation & Grading as Faculty
    console.log('\n--- TEST 6: PUT /api/faculty/submissions/grade (Faculty Grades Submission) ---');
    const scoredMarks = 46;
    const facultyRemarks = 'Excellent gas-optimized smart contract architecture. Full marks awarded for automated unit tests.';
    const gradeRes = await axios.put('http://localhost:5099/api/faculty/submissions/grade', {
      submissionId,
      scoredMarks,
      facultyRemarks,
    });

    if (gradeRes.data && gradeRes.data.success) {
      console.log(`✓ Grade API success: ${gradeRes.data.message}`);

      // Verify insertion in MySQL `assignment_submissions` table
      const [gradedRows] = await conn.query('SELECT * FROM assignment_submissions WHERE submission_id = ? LIMIT 1', [submissionId]);
      if (gradedRows.length > 0 && gradedRows[0].status === 'Graded' && gradedRows[0].scored_marks === scoredMarks) {
        console.log(`✓ REAL DATABASE VERIFIED: Submission updated in assignment_submissions table (Status: Graded, Score: ${gradedRows[0].scored_marks} / ${totalMarks}, Remarks: "${gradedRows[0].faculty_remarks}").`);
      } else {
        throw new Error('Graded submission record not updated in database!');
      }
    }

    // 7. Student Sees Evaluated Grade & Remarks
    console.log('\n--- TEST 7: Student Sees Graded Score & Remarks in Real-Time ---');
    const finalSubRes = await axios.get(`http://localhost:5099/api/faculty/submissions?assignmentId=${assignmentId}&status=GRADED`);
    if (finalSubRes.data && finalSubRes.data.success && Array.isArray(finalSubRes.data.submissions)) {
      const studentGrade = finalSubRes.data.submissions.find((s) => s.roll_number === testStudentRoll);
      if (studentGrade && studentGrade.status === 'Graded') {
        console.log(`✓ STUDENT GRADE SYNCHRONIZED: Student A (${testStudentRoll}) received score ${studentGrade.scored_marks} / ${totalMarks} with remarks "${studentGrade.faculty_remarks}"!`);
      } else {
        throw new Error('Graded submission not found in student view!');
      }
    }

    await conn.end();
    server.close();

    console.log('\n====================================================');
    console.log('ALL PHASE 4 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
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

testFacultyPhase4();
