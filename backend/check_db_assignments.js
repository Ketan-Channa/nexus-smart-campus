const mysql = require('mysql2/promise');

async function checkDb() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    const [rows] = await conn.query('SELECT * FROM assignments');
    console.log('Assignments in DB:', rows.length);
    console.log(JSON.stringify(rows, null, 2));

    await conn.end();
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

checkDb();
