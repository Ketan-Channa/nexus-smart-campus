const axios = require('axios');

async function testApi() {
  try {
    const email = 'vakeel@pcte.edu.in';
    const className = 'B.TECH CSE 2023 A';

    console.log('--- TESTING GET /api/faculty/my-students-classes/my-class ---');
    const res1 = await axios.get(`http://localhost:5000/api/faculty/my-students-classes/my-class?email=${encodeURIComponent(email)}&className=${encodeURIComponent(className)}`);
    console.log('My Class Overview Data:', JSON.stringify(res1.data, null, 2));

    console.log('\n--- TESTING GET /api/faculty/students?className=... ---');
    const res2 = await axios.get(`http://localhost:5000/api/faculty/students?className=${encodeURIComponent(className)}&email=${encodeURIComponent(email)}`);
    console.log('Students Query Data:', JSON.stringify(res2.data, null, 2));
  } catch (err) {
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    console.error('Error msg:', err.message);
  }
}

testApi();
