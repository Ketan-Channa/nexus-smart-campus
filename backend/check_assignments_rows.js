const mysql = require('mysql2/promise');

async function checkAssignmentsRows() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    console.log('✓ Connected to MySQL database nexus_campus_db.');

    const [rows] = await conn.query('SELECT * FROM assignments');
    console.log(`Total assignments in table: ${rows.length}`);
    console.log('Rows:', JSON.stringify(rows, null, 2));

    const [facs] = await conn.query('SELECT faculty_name, email, is_class_incharge, incharge_class FROM faculties');
    console.log('\nFaculties in database:', JSON.stringify(facs, null, 2));

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkAssignmentsRows();
