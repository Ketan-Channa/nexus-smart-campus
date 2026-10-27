const axios = require('axios');

async function testAttendancePort5000() {
  try {
    const email = 'vakeel@pcte.edu.in';
    const className = 'B.TECH CSE 2023 A';
    const subject = 'Blockchain Technologies';
    const date = '2026-09-12';
    const timeSlot = '09:00 AM - 10:00 AM (Period 1)';

    console.log('--- TESTING GET /api/attendance?className=... on PORT 5000 ---');
    const url = `http://localhost:5000/api/attendance?className=${encodeURIComponent(className)}`;
    const res = await axios.get(url);
    console.log('Response Status:', res.status);
    console.log('Records count:', res.data.data?.length);
  } catch (err) {
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    console.error('Error msg:', err.message);
  }
}

testAttendancePort5000();
