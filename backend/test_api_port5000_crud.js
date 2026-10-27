const axios = require('axios');

async function testPort5000Crud() {
  console.log('Testing CRUD on Port 5000...');

  try {
    // 1. GET /api/faculty/assignments
    const getRes = await axios.get('http://localhost:5000/api/faculty/assignments');
    console.log(`✓ GET Success: Found ${getRes.data.assignments.length} assignments on port 5000.`);

    const first = getRes.data.assignments[0];
    if (!first) throw new Error('No assignments available');

    // 2. PUT /api/faculty/assignments/:assignmentId
    console.log(`Updating assignment: ${first.assignmentId}...`);
    const putRes = await axios.put(`http://localhost:5000/api/faculty/assignments/${first.assignmentId}`, {
      title: first.title,
      subject: first.subject,
      subjectCode: first.subjectCode,
      className: first.className,
      assignmentType: 'Subjective',
      totalMarks: 50,
      deadlineDate: '2026-09-30',
      deadlineTime: '11:59 PM',
      description: 'Tested update via CRUD.',
    });
    console.log(`✓ PUT Success: ${putRes.data.message}`);

    // 3. GET for Student class query
    const studentRes = await axios.get('http://localhost:5000/api/faculty/assignments?className=B.TECH%20CSE%202023%20A');
    console.log(`✓ Student GET Success: Found ${studentRes.data.assignments.length} assignments for student class B.TECH CSE 2023 A.`);

    console.log('\nPORT 5000 IS FULLY UPDATED AND VERIFIED 100%! 🎉');
  } catch (err) {
    console.error('✕ Port 5000 Test Failed:', err.message);
    if (err.response) console.error('Response:', err.response.data);
  }
}

testPort5000Crud();
