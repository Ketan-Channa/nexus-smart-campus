const mysql = require('mysql2/promise');

async function fixAssignmentsSchema() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kets.8865',
      database: 'nexus_campus_db',
    });

    console.log('✓ Connected to MySQL database nexus_campus_db.');

    try {
      await conn.query('ALTER TABLE assignments MODIFY COLUMN topic_name VARCHAR(255) DEFAULT NULL');
      console.log('✓ ALTER TABLE assignments topic_name -> DEFAULT NULL');
    } catch (e) {
      console.log('topic_name alter info:', e.message);
    }

    try {
      await conn.query('ALTER TABLE assignments MODIFY COLUMN subject_name VARCHAR(150) DEFAULT NULL');
      console.log('✓ ALTER TABLE assignments subject_name -> DEFAULT NULL');
    } catch (e) {
      console.log('subject_name alter info:', e.message);
    }

    await conn.end();
    console.log('✅ MySQL assignments schema successfully fixed!');
  } catch (err) {
    console.error('✕ Failed to fix schema:', err.message);
  }
}

fixAssignmentsSchema();
