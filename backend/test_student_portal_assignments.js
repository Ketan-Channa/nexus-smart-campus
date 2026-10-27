const axios = require('axios');
const express = require('express');
const facultyRoutes = require('./dist/routes/facultyRoutes').default;
const { initializeDatabaseSchema } = require('./dist/config/database');

async function testStudentPortalAssignments() {
  console.log('====================================================');
  console.log('NEXUS SMART CAMPUS — STUDENT PORTAL ASSIGNMENTS E2E');
  console.log('====================================================\n');

  await initializeDatabaseSchema();

  const app = express();
  app.use(express.json());
  app.use('/api/faculty', facultyRoutes);
  const server = app.listen(5099);

  try {
    // Test 1: Query with dot-formatted class name "B.TECH CSE 2023 A"
    console.log('--- TEST 1: Query className="B.TECH CSE 2023 A" ---');
    const res1 = await axios.get('http://localhost:5099/api/faculty/assignments?className=B.TECH%20CSE%202023%20A');
    console.log(`✓ Retried ${res1.data.assignments.length} assignments.`);

    // Test 2: Query with non-dot class name "BTECH CSE 2023 A"
    console.log('\n--- TEST 2: Query className="BTECH CSE 2023 A" ---');
    const res2 = await axios.get('http://localhost:5099/api/faculty/assignments?className=BTECH%20CSE%202023%20A');
    console.log(`✓ Retried ${res2.data.assignments.length} assignments.`);

    // Test 3: Fallback overall query
    console.log('\n--- TEST 3: Overall Fallback (No params) ---');
    const res3 = await axios.get('http://localhost:5099/api/faculty/assignments');
    console.log(`✓ Overall assignments in MySQL database: ${res3.data.assignments.length}`);

    server.close();
    console.log('\n====================================================');
    console.log('STUDENT PORTAL ASSIGNMENTS E2E TEST PASSED! 🎉');
    console.log('====================================================');
  } catch (err) {
    server.close();
    console.error('✕ Test Failed:', err.message);
    if (err.response) console.error('Data:', err.response.data);
    process.exit(1);
  }
}

testStudentPortalAssignments();
