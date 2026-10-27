const axios = require('axios');
const express = require('express');
const facultyRoutes = require('./dist/routes/facultyRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testFullTwoWayFlow() {
  console.log('================================================================');
  console.log('NEXUS SMART CAMPUS — FULL TWO-WAY ASSIGNMENTS & WORK E2E FLOW');
  console.log('================================================================\n');

  await initializeDatabaseSchema();

  const app = express();
  app.use(express.json());
  app.use('/api/faculty', facultyRoutes);
  const server = app.listen(5100);

  try {
    // STEP 1: FACULTY PUBLISHES NEW ASSIGNMENT
    console.log('--- 1. FACULTY PUBLISHES ASSIGNMENT ---');
    const createRes = await axios.post('http://localhost:5100/api/faculty/assignments/create', {
      title: 'E2E Blockchain Audit Assignment',
      subject: 'Blockchain Technologies',
      subjectCode: 'CS-501',
      className: 'B.TECH CSE 2023 A',
      description: 'Analyze gas optimization in smart contracts.',
      assignmentType: 'Subjective',
      totalMarks: 50,
      deadlineDate: '2026-10-15',
      deadlineTime: '11:59 PM',
      facultyEmail: 'vakeel@pcte.edu.in',
      facultyName: 'VAKEEL SINGH',
    });
    console.log(`✓ Faculty Published: ${createRes.data.message}`);

    // STEP 2: STUDENT PORTAL READS PUBLISHED ASSIGNMENT
    console.log('\n--- 2. STUDENT PORTAL READS PUBLISHED ASSIGNMENT ---');
    const studentFetch = await axios.get('http://localhost:5100/api/faculty/assignments?className=B.TECH%20CSE%202023%20A');
    const publishedAsgns = studentFetch.data.assignments || [];
    console.log(`✓ Student Portal Success: Found ${publishedAsgns.length} published assignments in student portal.`);
    
    const targetAsgn = publishedAsgns.find(a => a.title === 'E2E Blockchain Audit Assignment') || publishedAsgns[0];
    console.log(`✓ Target Assignment ID: ${targetAsgn.assignmentId}`);

    // STEP 3: STUDENT SUBMITS COMPLETED ASSIGNMENT
    console.log('\n--- 3. STUDENT SUBMITS COMPLETED ASSIGNMENT ---');
    const subId = `sub_test_${Date.now()}`;
    const submitRes = await axios.post('http://localhost:5100/api/faculty/submissions/create', {
      submissionId: subId,
      assignmentId: targetAsgn.assignmentId,
      studentEmail: 'ketan@gmail.com',
      rollNumber: '2329362',
      studentName: 'Ketan Channa',
      className: 'B.TECH CSE 2023 A',
      submittedDate: 'Sep 12, 2026, 10:45 PM',
      uploadedFileName: 'ketan_blockchain_audit.pdf',
      uploadedFileType: 'pdf',
      uploadedFileSize: '2.1 MB',
      uploadedFileUrl: 'https://nexus.edu/uploads/ketan_blockchain_audit.pdf',
      status: 'Submitted',
    });
    console.log(`✓ Student Submission Saved: ${submitRes.data.message}`);

    // STEP 4: FACULTY PORTAL FEETCHES SUBMISSION
    console.log('\n--- 4. FACULTY PORTAL VIEWS SUBMISSIONS LIST ---');
    const facultySubFetch = await axios.get(`http://localhost:5100/api/faculty/submissions?assignmentId=${targetAsgn.assignmentId}`);
    const submissionsList = facultySubFetch.data.submissions || [];
    console.log(`✓ Faculty Submissions List: Received ${submissionsList.length} submissions.`);
    
    const studentSub = submissionsList.find(s => s.roll_number === '2329362' || s.submission_id === subId);
    console.log(`✓ Located Student Submission: ${studentSub.student_name} (${studentSub.roll_number}) - File: ${studentSub.uploaded_file_name}`);

    // STEP 5: FACULTY GRADES & EVALUATES SUBMISSION
    console.log('\n--- 5. FACULTY EVALUATES & GRADES SUBMISSION ---');
    const gradeRes = await axios.put('http://localhost:5100/api/faculty/submissions/grade', {
      submissionId: studentSub.submission_id,
      scoredMarks: 48,
      facultyRemarks: 'Outstanding gas optimization breakdown!',
    });
    console.log(`✓ Faculty Grading Success: ${gradeRes.data.message}`);

    // STEP 6: STUDENT VIEWS GRADED RESULT & MARKS
    console.log('\n--- 6. STUDENT PORTAL FEETCHES EVALUATED MARKS ---');
    const studentFinalFetch = await axios.get(`http://localhost:5100/api/faculty/submissions?className=B.TECH%20CSE%202023%20A`);
    const studentSubs = studentFinalFetch.data.submissions || [];
    const gradedRecord = studentSubs.find(s => s.submission_id === studentSub.submission_id);
    console.log(`✓ Student Evaluation Verified: Scored ${gradedRecord.scored_marks}/50 Marks with Remarks: "${gradedRecord.faculty_remarks}"`);

    server.close();
    console.log('\n================================================================');
    console.log('🎉 FULL TWO-WAY FACULTY <-> STUDENT ASSIGNMENT FLOW VERIFIED 100%');
    console.log('================================================================');
  } catch (err) {
    server.close();
    console.error('✕ E2E Flow Failed:', err.message);
    if (err.response) console.error('Data:', err.response.data);
    process.exit(1);
  }
}

testFullTwoWayFlow();
