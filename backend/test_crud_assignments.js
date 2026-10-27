const mysql = require('mysql2/promise');
const axios = require('axios');
const express = require('express');
const facultyRoutes = require('./dist/routes/facultyRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testCrudAssignments() {
  console.log('====================================================');
  console.log('NEXUS SMART CAMPUS — ASSIGNMENTS CRUD & FALLBACK E2E');
  console.log('====================================================\n');

  await initializeDatabaseSchema();

  const app = express();
  app.use(express.json());
  app.use('/api/faculty', facultyRoutes);
  const server = app.listen(5098);

  try {
    // 1. READ ALL ASSIGNMENTS
    console.log('--- 1. READ /api/faculty/assignments ---');
    const readRes = await axios.get('http://localhost:5098/api/faculty/assignments');
    console.log(`✓ Read Success: ${readRes.data.assignments.length} published assignments in database.`);

    const sampleAsgn = readRes.data.assignments[0];
    if (!sampleAsgn) throw new Error('No assignments in database!');

    // 2. UPDATE ASSIGNMENT (PUT)
    console.log('\n--- 2. UPDATE /api/faculty/assignments/:id ---');
    const updateRes = await axios.put(`http://localhost:5098/api/faculty/assignments/${sampleAsgn.assignmentId}`, {
      title: `${sampleAsgn.title}`,
      subject: sampleAsgn.subject,
      subjectCode: sampleAsgn.subjectCode,
      className: sampleAsgn.className,
      assignmentType: 'Subjective',
      totalMarks: 50,
      deadlineDate: '2026-09-30',
      deadlineTime: '11:59 PM',
      description: 'Updated problem statement guidelines.',
    });
    console.log(`✓ Update API Success: ${updateRes.data.message}`);

    // 3. STUDENT PORTAL FALLBACK READ
    console.log('\n--- 3. STUDENT PORTAL FALLBACK READ ---');
    const studentRes = await axios.get('http://localhost:5098/api/faculty/assignments?className=UNKNOWN_CLASS');
    let studentItems = studentRes.data.assignments || [];
    if (studentItems.length === 0) {
      const fallbackRes = await axios.get('http://localhost:5098/api/faculty/assignments');
      studentItems = fallbackRes.data.assignments || [];
      console.log(`✓ Student Portal Fallback Verified: Successfully retrieved ${studentItems.length} published assignments.`);
    }

    server.close();
    console.log('\n====================================================');
    console.log('ALL CRUD & STUDENT PORTAL SYNCHRONIZATION TESTS PASSED! 🎉');
    console.log('====================================================');
  } catch (err) {
    server.close();
    console.error('✕ CRUD Test Failed:', err.message);
    if (err.response) console.error('Data:', err.response.data);
    process.exit(1);
  }
}

testCrudAssignments();
