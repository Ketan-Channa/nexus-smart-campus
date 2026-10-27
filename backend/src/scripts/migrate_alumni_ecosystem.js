const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function migrateAlumniEcosystem() {
  console.log('🚀 Starting NEXUS Alumni Ecosystem Database Migration...');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Kets.8865',
    database: process.env.DB_NAME || 'nexus_campus_db',
  });

  const conn = await pool.getConnection();

  try {
    // 1. Ensure columns in alumni table
    console.log('1. Checking and updating `alumni` table...');
    const alumniCols = [
      { name: 'verification_notes', type: 'TEXT DEFAULT NULL' },
      { name: 'clarification_message', type: 'TEXT DEFAULT NULL' },
      { name: 'suspended_reason', type: 'TEXT DEFAULT NULL' },
      { name: 'preferred_mentoring_topics', type: 'TEXT DEFAULT NULL' },
      { name: 'mentorship_format', type: 'VARCHAR(50) DEFAULT "Virtual (Video Call)"' },
      { name: 'max_mentees', type: 'INT DEFAULT 5' },
      { name: 'volunteering_interests', type: 'TEXT DEFAULT NULL' },
      { name: 'guest_lecture_topics', type: 'TEXT DEFAULT NULL' },
      { name: 'is_active', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'dob', type: 'VARCHAR(50) DEFAULT NULL' },
      { name: 'blood_group', type: 'VARCHAR(10) DEFAULT "O+"' },
      { name: 'gender', type: 'VARCHAR(20) DEFAULT "Male"' },
      { name: 'address', type: 'TEXT DEFAULT NULL' },
    ];

    const [existingAlumniCols] = await conn.query('SHOW COLUMNS FROM alumni');
    const existingAlumniColNames = existingAlumniCols.map(c => c.Field);

    for (const col of alumniCols) {
      if (!existingAlumniColNames.includes(col.name)) {
        await conn.query(`ALTER TABLE alumni ADD COLUMN \`${col.name}\` ${col.type}`);
        console.log(`   ✨ Added column \`${col.name}\` to alumni`);
      }
    }

    // 2. Table: alumni_referrals
    console.log('2. Creating or updating `alumni_referrals` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referral_id VARCHAR(100) NOT NULL UNIQUE,
        job_id VARCHAR(100) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_roll_number VARCHAR(50),
        student_department VARCHAR(100),
        alumni_email VARCHAR(150) NOT NULL,
        alumni_name VARCHAR(150) NOT NULL,
        resume_url LONGTEXT,
        portfolio_url VARCHAR(255),
        cover_note TEXT,
        status ENUM('PENDING', 'REFERRED', 'DECLINED', 'IN_REVIEW') DEFAULT 'PENDING',
        referral_reference_code VARCHAR(100) DEFAULT NULL,
        alumni_feedback TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_job (job_id),
        INDEX idx_student (student_email),
        INDEX idx_alumni (alumni_email)
      );
    `);

    // 3. Table: alumni_mentorship_sessions
    console.log('3. Creating or updating `alumni_mentorship_sessions` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_mentorship_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL UNIQUE,
        request_id VARCHAR(100) NOT NULL,
        alumni_email VARCHAR(150) NOT NULL,
        alumni_name VARCHAR(150) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        scheduled_date VARCHAR(50) NOT NULL,
        scheduled_time VARCHAR(50) NOT NULL,
        meeting_mode ENUM('Online (Google Meet)', 'Online (Zoom)', 'In-Person (Campus)', 'Phone Call') DEFAULT 'Online (Google Meet)',
        meeting_link_or_venue VARCHAR(255),
        agenda TEXT,
        session_notes TEXT,
        mentor_feedback TEXT,
        mentee_feedback TEXT,
        status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') DEFAULT 'SCHEDULED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alumni_session (alumni_email),
        INDEX idx_student_session (student_email)
      );
    `);

    // 4. Table: alumni_guest_lectures
    console.log('4. Creating or updating `alumni_guest_lectures` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_guest_lectures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lecture_id VARCHAR(100) NOT NULL UNIQUE,
        alumni_email VARCHAR(150) NOT NULL,
        alumni_name VARCHAR(150) NOT NULL,
        alumni_designation VARCHAR(150),
        alumni_company VARCHAR(150),
        topic VARCHAR(255) NOT NULL,
        abstract_desc TEXT NOT NULL,
        target_department VARCHAR(100) DEFAULT 'All Departments',
        proposed_date VARCHAR(50) NOT NULL,
        proposed_time VARCHAR(50) NOT NULL,
        mode ENUM('Online Webinar', 'Offline Campus Session', 'Workshop') DEFAULT 'Online Webinar',
        venue_or_link VARCHAR(255) DEFAULT 'Campus Auditorium / Video Link',
        status ENUM('PROPOSED', 'APPROVED', 'SCHEDULED', 'COMPLETED', 'DECLINED') DEFAULT 'PROPOSED',
        faculty_coordinator_name VARCHAR(150) DEFAULT NULL,
        faculty_coordinator_email VARCHAR(150) DEFAULT NULL,
        expected_attendees INT DEFAULT 100,
        feedback_summary TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alumni_lecture (alumni_email)
      );
    `);

    // 5. Table: alumni_contributions
    console.log('5. Creating or updating `alumni_contributions` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_contributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contribution_id VARCHAR(100) NOT NULL UNIQUE,
        alumni_email VARCHAR(150) NOT NULL,
        alumni_name VARCHAR(150) NOT NULL,
        contribution_type ENUM('Guest Lecture', 'Mentorship', 'Student Project Evaluation', 'Campus Workshop', 'Mock Interviews', 'Curriculum Advisory', 'Career Guidance') NOT NULL,
        details TEXT NOT NULL,
        availability_period VARCHAR(100),
        status ENUM('OFFERED', 'ACCEPTED', 'ACTIVE', 'COMPLETED') DEFAULT 'OFFERED',
        institutional_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alumni_contrib (alumni_email)
      );
    `);

    // 6. Table: alumni_event_rsvps
    console.log('6. Creating or updating `alumni_event_rsvps` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_event_rsvps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(100) NOT NULL,
        user_email VARCHAR(150) NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        user_role ENUM('Alumni', 'Faculty', 'Student', 'Guest') NOT NULL,
        rsvp_status ENUM('GOING', 'MAYBE', 'DECLINED') DEFAULT 'GOING',
        guests_count INT DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_event_user (event_id, user_email),
        INDEX idx_event (event_id),
        INDEX idx_user (user_email)
      );
    `);

    // 7. Table: alumni_documents
    console.log('7. Creating or updating `alumni_documents` table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doc_id VARCHAR(100) NOT NULL UNIQUE,
        alumni_email VARCHAR(150) NOT NULL,
        document_title VARCHAR(255) NOT NULL,
        document_type ENUM('Degree Certificate', 'Experience Letter', 'Achievement / Award', 'Publication', 'Patent', 'Identity Proof', 'Other') NOT NULL,
        file_url LONGTEXT NOT NULL,
        is_verified_by_admin TINYINT(1) DEFAULT 0,
        verification_status ENUM('SELF_REPORTED', 'VERIFIED', 'UNDER_REVIEW') DEFAULT 'SELF_REPORTED',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alumni_docs (alumni_email)
      );
    `);

    // 8. Ensure alumni_job_posts columns
    console.log('8. Checking `alumni_job_posts` table columns...');
    const jobCols = [
      { name: 'allow_referrals', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'salary_range', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'category', type: 'VARCHAR(100) DEFAULT "Software & Technology"' },
      { name: 'applicant_count', type: 'INT DEFAULT 0' },
      { name: 'referral_count', type: 'INT DEFAULT 0' },
      { name: 'status', type: 'ENUM("ACTIVE", "CLOSED", "ARCHIVED") DEFAULT "ACTIVE"' },
    ];
    const [existingJobCols] = await conn.query('SHOW COLUMNS FROM alumni_job_posts');
    const existingJobColNames = existingJobCols.map(c => c.Field);
    for (const col of jobCols) {
      if (!existingJobColNames.includes(col.name)) {
        await conn.query(`ALTER TABLE alumni_job_posts ADD COLUMN \`${col.name}\` ${col.type}`);
        console.log(`   ✨ Added column \`${col.name}\` to alumni_job_posts`);
      }
    }

    console.log('✅ NEXUS Alumni Ecosystem Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

migrateAlumniEcosystem().then(() => process.exit(0)).catch(() => process.exit(1));
