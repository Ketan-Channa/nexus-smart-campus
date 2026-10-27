const mysql = require('mysql2/promise');

async function checkStudents() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    const [rows] = await conn.query('SELECT id, full_name, roll_number, class, section, department, email, is_active FROM students');
    console.log('--- ALL STUDENTS IN DATABASE ---');
    console.table(rows);

    const [facs] = await conn.query('SELECT id, faculty_name, email, is_class_incharge, incharge_class FROM faculties');
    console.log('--- ALL FACULTIES IN DATABASE ---');
    console.table(facs);

    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkStudents();
