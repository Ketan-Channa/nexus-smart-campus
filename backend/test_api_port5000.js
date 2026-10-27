const axios = require('axios');

async function testPort5000() {
  try {
    const res1 = await axios.get('http://localhost:5000/api/faculty/assignments?email=vakeel@pcte.edu.in');
    console.log('GET /api/faculty/assignments (vakeel@pcte.edu.in):', JSON.stringify(res1.data, null, 2));

    const res2 = await axios.get('http://localhost:5000/api/faculty/assignments?className=B.TECH%20CSE%202023%20A');
    console.log('\nGET /api/faculty/assignments (className=B.TECH CSE 2023 A):', JSON.stringify(res2.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.error('Response data:', err.response.data);
  }
}

testPort5000();
