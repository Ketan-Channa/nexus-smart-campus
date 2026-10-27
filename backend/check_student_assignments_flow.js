const mysql = require('mysql2/promise');
const axios = require('axios');

async function testStudentAssignmentsFlow() {
  console.log('=== CHECKING STUDENT ASSIGNMENTS FLOW ===');
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    const [assignments] = await conn.query('SELECT id, assignment_id, title, topic_name, subject, class_name, status FROM assignments');
    console.log(`Direct MySQL Query: Found ${assignments.length} assignments:`);
    console.log(JSON.stringify(assignments, null, 2));

    const [students] = await conn.query('SELECT id, full_name, roll_number, email, class, section, semester FROM students');
    console.log(`\nStudents in database (${students.length}):`);
    console.log(JSON.stringify(students, null, 2));

    await conn.end();

    console.log('\n--- Testing API Endpoints on localhost:5000 ---');
    const api1 = await axios.get('http://localhost:5000/api/faculty/assignments');
    console.log(`GET /api/faculty/assignments: ${api1.data.assignments ? api1.data.assignments.length : 0} items returned.`);

    const api2 = await axios.get('http://localhost:5000/api/faculty/assignments?className=B.TECH%20CSE%202023%20A');
    console.log(`GET /api/faculty/assignments?className=B.TECH CSE 2023 A: ${api2.data.assignments ? api2.data.assignments.length : 0} items returned.`);

    const api3 = await axios.get('http://localhost:5000/api/faculty/assignments?className=BTECH%20CSE%204A');
    console.log(`GET /api/faculty/assignments?className=BTECH CSE 4A: ${api3.data.assignments ? api3.data.assignments.length : 0} items returned.`);

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.error('Response:', err.response.data);
  }
}

testStudentAssignmentsFlow();
