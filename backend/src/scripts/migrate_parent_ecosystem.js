const mysql = require('mysql2/promise');

async function migrate() {
  console.log('--- Starting Parent Ecosystem Migration ---');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kets.8865',
    database: 'nexus_campus_db',
  });

  try {
    // 1. Create parent_student_links table
    console.log('Creating parent_student_links table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        link_id VARCHAR(100) NOT NULL UNIQUE,
        parent_email VARCHAR(150) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        relationship VARCHAR(50) DEFAULT 'Parent',
        verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'REVOKED') DEFAULT 'VERIFIED',
        verified_by VARCHAR(150) DEFAULT 'Admin Office',
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_psl_parent (parent_email),
        INDEX idx_psl_student (student_roll)
      );
    `);

    // 2. Add columns to parents table
    console.log('Adding columns to parents table if missing...');
    try { await conn.query('ALTER TABLE parents ADD COLUMN photo_url LONGTEXT DEFAULT NULL'); } catch (e) {}
    try { await conn.query("ALTER TABLE parents ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English'"); } catch (e) {}
    try { await conn.query("ALTER TABLE parents ADD COLUMN verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'VERIFIED'"); } catch (e) {}
    try { await conn.query("ALTER TABLE parents ADD COLUMN is_active TINYINT(1) DEFAULT 1"); } catch (e) {}

    // 3. Migrate existing parents into parent_student_links
    console.log('Migrating existing parents into parent_student_links...');
    const [existingParents] = await conn.query('SELECT * FROM parents WHERE student_roll_number IS NOT NULL AND student_roll_number != ""');
    for (const p of existingParents) {
      // Find student name if blank
      let stuName = p.student_name;
      if (!stuName) {
        const [st] = await conn.query('SELECT full_name FROM students WHERE roll_number = ?', [p.student_roll_number]);
        if (st.length > 0) stuName = st[0].full_name;
        else stuName = 'Student ' + p.student_roll_number;
      }
      const linkId = `LNK-${p.id}-${p.student_roll_number}`;
      await conn.query(`
        INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status)
        VALUES (?, ?, ?, ?, ?, 'VERIFIED')
        ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)
      `, [linkId, p.email, p.student_roll_number, stuName, p.relationship || 'Father']);
    }

    // Also link student 2329362 to Ravi@gmail.com for multi-child testing
    const [secondChild] = await conn.query('SELECT full_name FROM students WHERE roll_number = "2329362"');
    if (secondChild.length > 0) {
      await conn.query(`
        INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status)
        VALUES ('LNK-RAVI-2329362', 'Ravi@gmail.com', '2329362', ?, 'Father', 'VERIFIED')
        ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)
      `, [secondChild[0].full_name]);
      console.log('Linked second child 2329362 to Ravi@gmail.com for multi-child support verification.');
    }

    // 4. Ensure sample published marks exist for student 2329300 and 2329362
    console.log('Checking student assessment marks...');
    const [marks2329300] = await conn.query('SELECT COUNT(*) as c FROM student_assessment_marks WHERE student_roll = "2329300"');
    if (marks2329300[0].c === 0) {
      console.log('Seeding published assessment marks for student 2329300...');
      await conn.query(`
        INSERT INTO student_assessment_marks (mark_id, scheme_id, student_roll, student_name, student_email, subject_code, subject_name, class_name, semester, faculty_email, component_name, max_marks, marks_obtained, status, faculty_remarks)
        VALUES 
        ('MRK-2329300-1', 'SCH-2026-CSE401', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-401', 'Database Management Systems', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Mid Semester Exam 1', 30, 27.5, 'Published', 'Excellent analytical understanding of normalization and query indexing.'),
        ('MRK-2329300-2', 'SCH-2026-CSE401', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-401', 'Database Management Systems', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Class Test 1', 20, 18, 'Published', 'Well drafted ER schemas.'),
        ('MRK-2329300-3', 'SCH-2026-CSE401', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-401', 'Database Management Systems', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Lab Practical', 50, 48, 'Published', 'Proficient execution of complex SQL transactions.'),
        ('MRK-2329300-4', 'SCH-2026-CSE402', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-402', 'Operating Systems', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Mid Semester Exam 1', 30, 25, 'Published', 'Good understanding of concurrency & semaphore synchronization.'),
        ('MRK-2329300-5', 'SCH-2026-CSE402', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-402', 'Operating Systems', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Class Test 1', 20, 17, 'Published', 'Process scheduling logic clear.'),
        ('MRK-2329300-6', 'SCH-2026-CSE403', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-403', 'Computer Networks', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Mid Semester Exam 1', 30, 28, 'Published', 'Strong grasp of OSI model, TCP/IP handshake and congestion control.'),
        ('MRK-2329300-7', 'SCH-2026-CSE403', '2329300', 'JATIN SINGH', 'jatin@gmail.com', 'CSE-403', 'Computer Networks', 'B.TECH CSE 2023 A', 'Semester 4', 'faculty@nexus.edu', 'Draft Quiz', 15, 14, 'Draft', 'Unpublished test mark')
      `);
    }

    // 5. Ensure fee_payments has records for student 2329300
    const [fees] = await conn.query('SELECT COUNT(*) as c FROM fee_payments WHERE student_roll_number = "2329300"');
    if (fees[0].c === 0) {
      console.log('Seeding fee payments for student 2329300...');
      await conn.query(`
        INSERT INTO fee_payments (student_roll_number, fee_type, semester, amount, due_date, payment_status, receipt_no, paid_on)
        VALUES 
        ('2329300', 'Semester 4 Tuition Fee', 'Semester 4', 45000.00, '2026-11-15', 'Paid', 'REC-2026-4401', NOW()),
        ('2329300', 'Campus Hostel & Mess Fee', 'Semester 4', 28000.00, '2026-11-20', 'Paid', 'REC-2026-4402', NOW()),
        ('2329300', 'Annual Campus Transport Fee', 'Annual 2026-27', 12000.00, '2026-12-01', 'Pending', NULL, NULL)
      `);
    }

    // 6. Ensure attendance records exist for 2329300
    const [att] = await conn.query('SELECT COUNT(*) as c FROM attendance WHERE roll_number = "2329300"');
    if (att[0].c === 0) {
      console.log('Seeding attendance for student 2329300...');
      await conn.query(`
        INSERT INTO attendance (roll_number, date, status, subject, class_name)
        VALUES 
        ('2329300', '2026-10-20', 'Present', 'Database Management Systems', 'B.TECH CSE 2023 A'),
        ('2329300', '2026-10-21', 'Present', 'Database Management Systems', 'B.TECH CSE 2023 A'),
        ('2329300', '2026-10-22', 'Present', 'Operating Systems', 'B.TECH CSE 2023 A'),
        ('2329300', '2026-10-23', 'Absent', 'Computer Networks', 'B.TECH CSE 2023 A'),
        ('2329300', '2026-10-24', 'Present', 'Database Management Systems', 'B.TECH CSE 2023 A'),
        ('2329300', '2026-10-25', 'Present', 'Operating Systems', 'B.TECH CSE 2023 A')
      `);
    }

    console.log('--- Parent Ecosystem Migration Finished Successfully ---');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await conn.end();
  }
}

migrate();
