import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'nexus_campus_db';

const DB_SSL_CA_PATH = process.env.DB_SSL_CA_PATH;

const DB_SSL = {
  minVersion: 'TLSv1.2' as const,
  ...(DB_SSL_CA_PATH
    ? {
      ca: fs.readFileSync(path.resolve(DB_SSL_CA_PATH), 'utf8'),
    }
    : {}),
};

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: DB_SSL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ensureTableColumns = async (conn: any, tableName: string, columnsDef: { name: string; type: string }[]) => {
  try {
    const [existingCols]: any = await conn.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const existingColNames = existingCols.map((c: any) => c.Field);

    for (const col of columnsDef) {
      if (!existingColNames.includes(col.name)) {
        await conn.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${col.name}\` ${col.type}`);
        console.log(`✨ Added missing column \`${col.name}\` to table \`${tableName}\``);
      }
    }
  } catch (err: any) {
    // Ignore if table created fresh
  }
};

export const initializeDatabaseSchema = async () => {
  try {
    const conn = await pool.getConnection();

    // 1. Students table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        admission_number VARCHAR(100),
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        college_name VARCHAR(255),
        class VARCHAR(100) NOT NULL,
        degree_class VARCHAR(100),
        joining_year VARCHAR(10),
        study_year VARCHAR(20),
        semester VARCHAR(50) NOT NULL,
        department VARCHAR(150) NOT NULL,
        dob VARCHAR(50),
        blood_group VARCHAR(10),
        gender ENUM('Male', 'Female', 'Other'),
        photograph_url LONGTEXT,
        email VARCHAR(150) NOT NULL UNIQUE,
        mobile VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        govt_id_number VARCHAR(100),
        govt_id_photo_url LONGTEXT,
        college_doc_url LONGTEXT,
        father_name VARCHAR(150),
        father_phone VARCHAR(20),
        father_email VARCHAR(150),
        father_photo_url LONGTEXT,
        father_govt_id_number VARCHAR(100),
        father_govt_id_photo_url LONGTEXT,
        mother_name VARCHAR(150),
        mother_phone VARCHAR(20),
        mother_email VARCHAR(150),
        mother_photo_url LONGTEXT,
        mother_govt_id_number VARCHAR(100),
        mother_govt_id_photo_url LONGTEXT,
        parent_contact VARCHAR(20),
        parent_occupation VARCHAR(100),
        admission_date VARCHAR(50),
        section VARCHAR(20),
        hobbies TEXT,
        interests TEXT,
        skills TEXT,
        conveyance_mode VARCHAR(50) DEFAULT 'Self',
        bus_route VARCHAR(150),
        bus_charges DECIMAL(10,2) DEFAULT 0.00,
        bus_payment_status VARCHAR(50),
        vehicle_type VARCHAR(20),
        parking_payment_term VARCHAR(50),
        parking_fee DECIMAL(10,2) DEFAULT 0.00,
        parking_payment_status VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. Faculties table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_name VARCHAR(150) NOT NULL,
        employee_id VARCHAR(50) NOT NULL UNIQUE,
        department VARCHAR(150) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        mobile VARCHAR(20) NOT NULL,
        dob VARCHAR(50),
        blood_group VARCHAR(10),
        address TEXT NOT NULL,
        joining_date VARCHAR(50),
        subjects_taught TEXT,
        photograph_url LONGTEXT,
        is_class_incharge VARCHAR(10) DEFAULT 'No',
        incharge_class VARCHAR(100) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await conn.query(`ALTER TABLE students ADD COLUMN is_active INT DEFAULT 1`);
    } catch (e) { }

    const studentMigrations = [
      `ALTER TABLE students ADD COLUMN admission_number VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN college_name VARCHAR(255)`,
      `ALTER TABLE students ADD COLUMN degree_class VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN joining_year VARCHAR(10)`,
      `ALTER TABLE students ADD COLUMN ending_year VARCHAR(10)`,
      `ALTER TABLE students ADD COLUMN study_year VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN govt_id_type VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN govt_id_number VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN govt_id_photo_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN college_doc_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN father_phone VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN father_email VARCHAR(150)`,
      `ALTER TABLE students ADD COLUMN father_photo_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN father_govt_id_type VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN father_govt_id_number VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN father_govt_id_photo_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN mother_phone VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN mother_email VARCHAR(150)`,
      `ALTER TABLE students ADD COLUMN mother_photo_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN mother_govt_id_type VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN mother_govt_id_number VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN mother_govt_id_photo_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN conveyance_mode VARCHAR(50) DEFAULT 'Self'`,
      `ALTER TABLE students ADD COLUMN bus_route VARCHAR(150)`,
      `ALTER TABLE students ADD COLUMN bus_charges DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE students ADD COLUMN bus_payment_status VARCHAR(50)`,
      `ALTER TABLE students ADD COLUMN vehicle_type VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN parking_payment_term VARCHAR(50)`,
      `ALTER TABLE students ADD COLUMN parking_fee DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE students ADD COLUMN parking_payment_status VARCHAR(50)`,
      `ALTER TABLE students ADD COLUMN residence_type VARCHAR(50) DEFAULT 'Day Scholar'`,
      `ALTER TABLE students ADD COLUMN hostel_name VARCHAR(100)`,
      `ALTER TABLE students ADD COLUMN room_number VARCHAR(50)`,
      `ALTER TABLE students ADD COLUMN hostel_payment_term VARCHAR(50)`,
      `ALTER TABLE students ADD COLUMN hostel_fee DECIMAL(10,2) DEFAULT 0.00`,
      `ALTER TABLE students ADD COLUMN hostel_payment_status VARCHAR(50) DEFAULT 'Unpaid'`,
      `ALTER TABLE students ADD COLUMN hostel_doc_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN hostel_card_url LONGTEXT`,
      `ALTER TABLE students ADD COLUMN attendance_criteria DECIMAL(5,2) DEFAULT 75.00`,
      `ALTER TABLE students ADD COLUMN medical_verified VARCHAR(10) DEFAULT 'No'`,
      `ALTER TABLE students ADD COLUMN medical_app_ref VARCHAR(100) DEFAULT NULL`,
    ];
    for (const q of studentMigrations) {
      try { await conn.query(q); } catch (e) { }
    }

    try {
      await conn.query(`ALTER TABLE faculties ADD COLUMN is_class_incharge VARCHAR(10) DEFAULT 'No'`);
    } catch (e) { }
    try {
      await conn.query(`ALTER TABLE faculties ADD COLUMN incharge_class VARCHAR(100) DEFAULT NULL`);
    } catch (e) { }
    try {
      await conn.query(`ALTER TABLE faculties ADD COLUMN section VARCHAR(20) DEFAULT NULL`);
    } catch (e) { }

    // 2b. Classes table (Real Database Relationship Entity)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_code VARCHAR(50) NOT NULL UNIQUE,
        class_name VARCHAR(150) NOT NULL,
        department VARCHAR(150) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        section VARCHAR(20) NOT NULL,
        class_incharge_id INT DEFAULT NULL,
        class_incharge_email VARCHAR(150) DEFAULT NULL,
        class_incharge_name VARCHAR(150) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2c. Class Broadcasts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS class_broadcasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        broadcast_id VARCHAR(100) NOT NULL,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        class_code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        priority VARCHAR(50) DEFAULT 'NORMAL',
        recipient_count INT DEFAULT 0,
        target_type VARCHAR(50) DEFAULT 'ENTIRE_CLASS',
        selected_students TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2d. Faculty Notes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'Personal',
        is_pinned TINYINT(1) DEFAULT 0,
        is_archived TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2e. Faculty Tasks table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        due_date VARCHAR(50) DEFAULT NULL,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        category VARCHAR(50) DEFAULT 'Teaching',
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2e-1. Faculty Templates table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_email VARCHAR(150) NOT NULL,
        template_type VARCHAR(50) NOT NULL DEFAULT 'Email',
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2e-2. Faculty AI Activity History table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_ai_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_email VARCHAR(150) NOT NULL,
        tool_name VARCHAR(100) NOT NULL,
        prompt_category VARCHAR(100) DEFAULT 'General',
        prompt_summary TEXT NOT NULL,
        response_summary TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2f. Faculty Student Remarks table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_student_remarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        student_roll_number VARCHAR(50) DEFAULT NULL,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        remark TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'Academic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2g. Chat Messages table for Faculty <-> Student Messaging
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_email VARCHAR(150) DEFAULT NULL,
        sender_name VARCHAR(150) DEFAULT NULL,
        recipient_email VARCHAR(150) DEFAULT NULL,
        sender_id INT DEFAULT NULL,
        sender_role VARCHAR(50) DEFAULT 'FACULTY',
        receiver_id INT DEFAULT NULL,
        receiver_name VARCHAR(150) DEFAULT NULL,
        receiver_role VARCHAR(50) DEFAULT 'STUDENT',
        message_text TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'MESSAGE',
        category VARCHAR(50) DEFAULT 'Direct',
        priority VARCHAR(50) DEFAULT 'NORMAL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2h. Attendance table (Single Source of Truth)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT DEFAULT NULL,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        department VARCHAR(150) DEFAULT 'Computer Science & Engineering',
        semester VARCHAR(50) DEFAULT '5th Sem',
        section VARCHAR(20) DEFAULT 'A',
        subject VARCHAR(150) NOT NULL,
        subject_code VARCHAR(50) DEFAULT NULL,
        date DATE NOT NULL,
        time_slot VARCHAR(100) DEFAULT '09:00 AM - 10:00 AM',
        status VARCHAR(50) NOT NULL DEFAULT 'Present',
        faculty_name VARCHAR(150) DEFAULT 'Faculty',
        remarks TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    try {
      await conn.query(`ALTER TABLE attendance MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Present'`);
    } catch (e) { }

    // 2i. Attendance Audit Log table (Audit Trail for Modifications & Corrections)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attendance_id INT DEFAULT NULL,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) DEFAULT NULL,
        class_name VARCHAR(100) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        lecture_date DATE NOT NULL,
        time_slot VARCHAR(100) DEFAULT NULL,
        original_status VARCHAR(50) NOT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by_email VARCHAR(150) NOT NULL,
        changed_by_name VARCHAR(150) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure assignments table and columns exist for Phase 4
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) DEFAULT NULL,
        topic_name VARCHAR(255) DEFAULT NULL,
        subject VARCHAR(150) DEFAULT NULL,
        subject_name VARCHAR(150) DEFAULT NULL,
        subject_code VARCHAR(50) DEFAULT NULL,
        class_name VARCHAR(100) DEFAULT NULL,
        description LONGTEXT,
        assignment_type VARCHAR(50) DEFAULT 'Subjective',
        total_marks INT NOT NULL DEFAULT 50,
        deadline_date VARCHAR(50) NOT NULL,
        deadline_time VARCHAR(50) DEFAULT '11:59 PM',
        faculty_email VARCHAR(150) DEFAULT NULL,
        faculty_name VARCHAR(150) DEFAULT NULL,
        attachment_url LONGTEXT,
        status VARCHAR(50) DEFAULT 'Published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await conn.query(`ALTER TABLE assignments ADD COLUMN title VARCHAR(255) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments ADD COLUMN subject VARCHAR(150) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments ADD COLUMN class_name VARCHAR(100) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments ADD COLUMN faculty_email VARCHAR(150) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments ADD COLUMN attachment_url LONGTEXT DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments MODIFY COLUMN topic_name VARCHAR(255) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments MODIFY COLUMN subject_name VARCHAR(150) DEFAULT NULL`); } catch (e) { }
    try { await conn.query(`ALTER TABLE assignments MODIFY COLUMN status VARCHAR(50) DEFAULT 'Published'`); } catch (e) { }

    // assignment_submissions table for Phase 4 Student & Faculty Assignment Submissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(100) NOT NULL UNIQUE,
        assignment_id VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        submitted_date VARCHAR(100) NOT NULL,
        uploaded_file_name VARCHAR(255) DEFAULT NULL,
        uploaded_file_type VARCHAR(50) DEFAULT 'pdf',
        uploaded_file_size VARCHAR(50) DEFAULT '1.5 MB',
        uploaded_file_url LONGTEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Submitted',
        scored_marks INT DEFAULT NULL,
        faculty_remarks TEXT DEFAULT NULL,
        graded_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    try { await conn.query(`ALTER TABLE assignment_submissions ADD UNIQUE KEY uq_asgn_roll (assignment_id, roll_number)`); } catch (e) { }

    // 3. Alumni table (Single Source of Truth)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        username VARCHAR(100),
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20),
        photograph_url LONGTEXT,
        cover_photo_url LONGTEXT,
        graduation_year VARCHAR(10) NOT NULL,
        batch VARCHAR(50),
        degree VARCHAR(100) NOT NULL,
        department VARCHAR(150) NOT NULL,
        section VARCHAR(20),
        student_registration_number VARCHAR(100),
        college_name VARCHAR(255) DEFAULT 'NEXUS Institute of Technology',
        current_city VARCHAR(100),
        current_country VARCHAR(100),
        current_company VARCHAR(150),
        current_designation VARCHAR(150),
        industry VARCHAR(150),
        skills TEXT,
        bio TEXT,
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        other_links TEXT,
        alumni_id VARCHAR(50) UNIQUE,
        verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
        privacy_level ENUM('PUBLIC', 'CAMPUS_ONLY', 'CONNECTIONS_ONLY', 'PRIVATE') DEFAULT 'CAMPUS_ONLY',
        mentorship_available TINYINT(1) DEFAULT 1,
        job_provider TINYINT(1) DEFAULT 0,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 3b. Alumni Experiences
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alumni_email VARCHAR(150) NOT NULL,
        company VARCHAR(150) NOT NULL,
        designation VARCHAR(150) NOT NULL,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        is_current TINYINT(1) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3c. Alumni Achievements
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alumni_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        organization VARCHAR(255),
        achievement_date VARCHAR(50),
        description TEXT,
        media_url LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3d. Alumni Mentorship Requests
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_mentorship_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(100) NOT NULL UNIQUE,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_roll_number VARCHAR(50),
        student_department VARCHAR(150),
        alumni_email VARCHAR(150) NOT NULL,
        alumni_name VARCHAR(150) NOT NULL,
        career_goal VARCHAR(255),
        preferred_topic VARCHAR(150),
        message TEXT NOT NULL,
        resume_url LONGTEXT,
        status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3e. Alumni Job & Internship Posts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_job_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id VARCHAR(100) NOT NULL UNIQUE,
        posted_by_email VARCHAR(150) NOT NULL,
        posted_by_name VARCHAR(150) NOT NULL,
        alumni_id VARCHAR(50),
        job_title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(150) NOT NULL,
        work_mode VARCHAR(50) DEFAULT 'On-site',
        employment_type VARCHAR(50) DEFAULT 'Full-Time',
        experience_level VARCHAR(100),
        required_skills TEXT,
        description TEXT NOT NULL,
        application_link VARCHAR(255),
        deadline VARCHAR(50),
        poster_url LONGTEXT,
        moderation_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED') DEFAULT 'APPROVED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3f. Alumni / Campus Events
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(100) NOT NULL UNIQUE,
        organizer_email VARCHAR(150) NOT NULL,
        organizer_name VARCHAR(150) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_date VARCHAR(50) NOT NULL,
        event_time VARCHAR(50),
        venue VARCHAR(255) NOT NULL,
        event_mode VARCHAR(50) DEFAULT 'Offline',
        target_batch VARCHAR(100) DEFAULT 'All Batches',
        target_department VARCHAR(150) DEFAULT 'All Departments',
        description TEXT NOT NULL,
        registration_link VARCHAR(255),
        poster_url LONGTEXT,
        status ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const eventMigrations = [
      `ALTER TABLE alumni_events ADD COLUMN category VARCHAR(100) DEFAULT 'Cultural Fest'`,
      `ALTER TABLE alumni_events ADD COLUMN target_audience VARCHAR(100) DEFAULT 'All (Student & Faculty)'`,
      `ALTER TABLE alumni_events ADD COLUMN organizer_designation VARCHAR(150) DEFAULT 'Event Coordinator'`,
      `ALTER TABLE alumni_events ADD COLUMN organizer_club VARCHAR(150) DEFAULT 'NEXUS Society'`,
      `ALTER TABLE alumni_events ADD COLUMN start_date VARCHAR(50)`,
      `ALTER TABLE alumni_events ADD COLUMN end_date VARCHAR(50)`,
      `ALTER TABLE alumni_events ADD COLUMN start_time VARCHAR(50)`,
      `ALTER TABLE alumni_events ADD COLUMN end_time VARCHAR(50)`,
      `ALTER TABLE alumni_events ADD COLUMN max_seats INT DEFAULT 200`,
      `ALTER TABLE alumni_events ADD COLUMN registered_count INT DEFAULT 0`,
    ];
    for (const q of eventMigrations) {
      try { await conn.query(q); } catch (e) { }
    }

    // 3g. Alumni Collaborations
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni_collaborations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collab_id VARCHAR(100) NOT NULL UNIQUE,
        inviter_email VARCHAR(150) NOT NULL,
        inviter_name VARCHAR(150) NOT NULL,
        inviter_role VARCHAR(50) NOT NULL,
        invitee_email VARCHAR(150) NOT NULL,
        invitee_name VARCHAR(150) NOT NULL,
        invitee_role VARCHAR(50) NOT NULL,
        project_title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        required_skills TEXT,
        expected_duration VARCHAR(100),
        status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        mobile VARCHAR(20) NOT NULL,
        occupation VARCHAR(100),
        address TEXT NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_roll_number VARCHAR(50) NOT NULL,
        relationship ENUM('Father', 'Mother', 'Guardian') NOT NULL,
        password VARCHAR(255) NOT NULL,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 4. Alumni table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS alumni (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        username VARCHAR(100),
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(20),
        photograph_url LONGTEXT,
        cover_photo_url LONGTEXT,
        graduation_year VARCHAR(10) NOT NULL,
        batch VARCHAR(50),
        degree VARCHAR(100) DEFAULT 'B.Tech',
        department VARCHAR(150) NOT NULL,
        section VARCHAR(20),
        student_registration_number VARCHAR(100),
        college_name VARCHAR(255) DEFAULT 'NEXUS Institute of Technology',
        current_city VARCHAR(100),
        current_country VARCHAR(100),
        current_company VARCHAR(150),
        current_designation VARCHAR(150),
        industry VARCHAR(150),
        skills TEXT,
        bio TEXT,
        linkedin_url VARCHAR(255),
        github_url VARCHAR(255),
        other_links TEXT,
        alumni_id VARCHAR(50) UNIQUE,
        verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
        privacy_level ENUM('PUBLIC', 'CAMPUS_ONLY', 'CONNECTIONS_ONLY', 'PRIVATE') DEFAULT 'CAMPUS_ONLY',
        mentorship_available TINYINT(1) DEFAULT 1,
        job_provider TINYINT(1) DEFAULT 0,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 5. Administrators table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS administrators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_name VARCHAR(150) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        mobile VARCHAR(20),
        department VARCHAR(150) NOT NULL,
        access_level ENUM('Super Admin', 'Admin', 'Moderator') DEFAULT 'Admin',
        address TEXT NOT NULL,
        password VARCHAR(255) NOT NULL,
        q1 TEXT,
        a1 VARCHAR(255),
        q2 TEXT,
        a2 VARCHAR(255),
        q3 TEXT,
        a3 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 6. Login Lockouts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS login_lockouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(150) NOT NULL,
        user_role ENUM('Student', 'Faculty', 'Parent', 'Alumni', 'Administrator') NOT NULL,
        failed_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 6b. Departments table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dept_code VARCHAR(50) NOT NULL UNIQUE,
        dept_name VARCHAR(150) NOT NULL,
        hod_name VARCHAR(150) DEFAULT NULL,
        hod_email VARCHAR(150) DEFAULT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6c. Admin Audit Logs table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_id VARCHAR(100) NOT NULL UNIQUE,
        admin_email VARCHAR(150) NOT NULL,
        admin_name VARCHAR(150) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(150) DEFAULT NULL,
        details TEXT,
        previous_value TEXT DEFAULT NULL,
        new_value TEXT DEFAULT NULL,
        ip_address VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6d. Campus Announcements table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS campus_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        announcement_id VARCHAR(100) NOT NULL UNIQUE,
        publisher_name VARCHAR(150) NOT NULL,
        publisher_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        target_audience VARCHAR(100) DEFAULT 'ALL',
        target_department VARCHAR(150) DEFAULT 'ALL',
        target_class VARCHAR(100) DEFAULT 'ALL',
        priority VARCHAR(20) DEFAULT 'NORMAL',
        is_pinned TINYINT(1) DEFAULT 0,
        is_archived TINYINT(1) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'PUBLISHED',
        attachment_url LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6e. System Settings table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_by VARCHAR(150),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 7. Timetables table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS timetables (
        id VARCHAR(100) PRIMARY KEY,
        timetable_id VARCHAR(100) DEFAULT 'ACTIVE_TT_V1',
        day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        slot_name VARCHAR(100) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        code VARCHAR(50) NOT NULL,
        teacher_code VARCHAR(50) NOT NULL,
        canonical_faculty_key VARCHAR(100),
        class_name VARCHAR(100) NOT NULL,
        canonical_class_key VARCHAR(100),
        room VARCHAR(50) NOT NULL,
        canonical_venue_key VARCHAR(100),
        type ENUM('Lecture', 'Lab', 'Project', 'Seminar', 'Break') DEFAULT 'Lecture',
        slot_type VARCHAR(50) DEFAULT 'LECTURE',
        break_type VARCHAR(50) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timetable_id (timetable_id),
        INDEX idx_canonical_class (canonical_class_key),
        INDEX idx_day_slot (day, start_time),
        INDEX idx_canonical_room (canonical_venue_key),
        INDEX idx_canonical_faculty (canonical_faculty_key)
      );
    `);

    // Dynamic Column Migrations for timetables
    try { await conn.query('ALTER TABLE timetables ADD COLUMN timetable_id VARCHAR(100) DEFAULT "ACTIVE_TT_V1"'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN canonical_class_key VARCHAR(100)'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN canonical_faculty_key VARCHAR(100)'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN canonical_venue_key VARCHAR(100)'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN slot_type VARCHAR(50) DEFAULT "LECTURE"'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN break_type VARCHAR(50) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetables ADD COLUMN is_active TINYINT(1) DEFAULT 1'); } catch (e) { }

    // 8. Timetable Metadata table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS timetable_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timetable_id VARCHAR(100) DEFAULT 'ACTIVE_TT_V1',
        file_name VARCHAR(255) NOT NULL,
        uploaded_at VARCHAR(100) NOT NULL,
        uploader_name VARCHAR(150) DEFAULT 'System Administrator',
        uploader_role VARCHAR(50) DEFAULT 'Administrator',
        total_lectures INT DEFAULT 0,
        selected_class VARCHAR(100) DEFAULT 'BTECH CSE 4A',
        version INT DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await conn.query('ALTER TABLE timetable_metadata ADD COLUMN timetable_id VARCHAR(100) DEFAULT "ACTIVE_TT_V1"'); } catch (e) { }
    try { await conn.query('ALTER TABLE timetable_metadata ADD COLUMN is_active TINYINT(1) DEFAULT 1'); } catch (e) { }



    // 9. Attendance table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT DEFAULT NULL,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        department VARCHAR(150) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        section VARCHAR(20) DEFAULT NULL,
        subject VARCHAR(150) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time_slot VARCHAR(50) DEFAULT NULL,
        status ENUM('Present', 'Absent', 'Medical Leave', 'On Duty (OD)', 'Suspended', 'Fees Not Paid but present (FP)', 'Fees Not Paid and Absent (FA)') NOT NULL DEFAULT 'Present',
        faculty_name VARCHAR(150) DEFAULT NULL,
        remarks TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_roll_class (roll_number, class_name),
        INDEX idx_class_date (class_name, date),
        INDEX idx_student (student_id)
      );
    `);

    // 9b. Medical Certificates Table (Single Source of Truth)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS medical_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_ref VARCHAR(100) NOT NULL UNIQUE,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        department VARCHAR(150) NOT NULL,
        illness VARCHAR(200) NOT NULL,
        cause_details TEXT NOT NULL,
        condition_type VARCHAR(100) NOT NULL DEFAULT 'Serious / Inpatient Hospitalization',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INT NOT NULL,
        doctor_name VARCHAR(150) NOT NULL,
        doctor_reg_no VARCHAR(100) NOT NULL,
        hospital_name VARCHAR(200) NOT NULL,
        prescription_doc_url LONGTEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        verifier_email VARCHAR(150),
        verifier_name VARCHAR(150),
        verification_date DATETIME,
        verification_remarks TEXT,
        rejection_reason TEXT,
        clarification_request TEXT,
        clarification_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    try { await conn.query(`ALTER TABLE medical_certificates ADD COLUMN rejection_reason TEXT`); } catch (e) { }
    try { await conn.query(`ALTER TABLE medical_certificates ADD COLUMN clarification_request TEXT`); } catch (e) { }
    try { await conn.query(`ALTER TABLE medical_certificates ADD COLUMN clarification_response TEXT`); } catch (e) { }
    try { await conn.query(`ALTER TABLE medical_certificates MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING'`); } catch (e) { }

    // 10. Student Safety Reports table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_safety_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id VARCHAR(100) NOT NULL UNIQUE,
        student_name VARCHAR(150) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_roll VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        concern_date VARCHAR(50) NOT NULL,
        concern_time VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL DEFAULT 'Medium',
        person_reported VARCHAR(255),
        student_description TEXT NOT NULL,
        detailed_concern LONGTEXT NOT NULL,
        is_anonymous TINYINT(1) DEFAULT 0,
        reported_to LONGTEXT,
        attachments LONGTEXT,
        status ENUM('Draft', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Submitted',
        timeline LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 11. Safety Feedback Suggestions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS safety_feedback_suggestions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feedback_id VARCHAR(100) NOT NULL UNIQUE,
        student_name VARCHAR(150) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        feedback_type VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        rating INT DEFAULT 5,
        is_anonymous TINYINT(1) DEFAULT 0,
        attachments LONGTEXT,
        status VARCHAR(50) DEFAULT 'Received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Emergency SOS Alerts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS emergency_sos_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id VARCHAR(100) NOT NULL UNIQUE,
        student_name VARCHAR(150) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_mobile VARCHAR(50),
        emergency_type VARCHAR(100) NOT NULL,
        short_description TEXT,
        location_text VARCHAR(255) NOT NULL,
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        status ENUM('Sending', 'Alert Sent', 'Help Response Received', 'Resolved') DEFAULT 'Alert Sent',
        responded_by VARCHAR(255) DEFAULT 'Campus Security & Welfare Cell',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. Connections Profiles Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        full_name VARCHAR(150) NOT NULL,
        college VARCHAR(255) NOT NULL DEFAULT 'PCTE College',
        university VARCHAR(255) DEFAULT 'Punjab Technical University',
        city VARCHAR(100) DEFAULT 'Ludhiana',
        department VARCHAR(150) NOT NULL DEFAULT 'Computer Science',
        course VARCHAR(100) NOT NULL DEFAULT 'B.Tech CSE',
        semester VARCHAR(50) NOT NULL DEFAULT '6th Semester',
        graduation_year VARCHAR(10) DEFAULT '2026',
        bio TEXT,
        skills LONGTEXT,
        interests LONGTEXT,
        achievements LONGTEXT,
        projects LONGTEXT,
        github VARCHAR(255),
        linkedin VARCHAR(255),
        portfolio VARCHAR(255),
        avatar_url LONGTEXT,
        cover_url LONGTEXT,
        is_open_collaboration TINYINT(1) DEFAULT 1,
        profile_visibility ENUM('Public', 'Connections', 'My College') DEFAULT 'Public',
        messaging_permission ENUM('Everyone', 'Connections', 'Nobody') DEFAULT 'Everyone',
        request_permission ENUM('Everyone', 'Same College', 'Nobody') DEFAULT 'Everyone',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 14. Connections Requests Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connection_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(100) NOT NULL UNIQUE,
        sender_email VARCHAR(150) NOT NULL,
        receiver_email VARCHAR(150) NOT NULL,
        message TEXT,
        status ENUM('Pending', 'Accepted', 'Rejected', 'Cancelled') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 15. Connections Friendships Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_friendships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        friendship_id VARCHAR(100) NOT NULL UNIQUE,
        user1_email VARCHAR(150) NOT NULL,
        user2_email VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 16. Connections Blocked Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_blocked_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        block_id VARCHAR(100) NOT NULL UNIQUE,
        blocker_email VARCHAR(150) NOT NULL,
        blocked_email VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 17. Connections Posts Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id VARCHAR(100) NOT NULL UNIQUE,
        author_email VARCHAR(150) NOT NULL,
        author_name VARCHAR(150) NOT NULL,
        author_username VARCHAR(100) NOT NULL,
        author_college VARCHAR(255) NOT NULL,
        author_avatar LONGTEXT,
        content LONGTEXT NOT NULL,
        media LONGTEXT,
        location VARCHAR(255),
        tags LONGTEXT,
        visibility ENUM('Public Network', 'Connections', 'My College', 'Only Me') DEFAULT 'Public Network',
        likes_count INT DEFAULT 0,
        dislikes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 18. Connections Post Reactions Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_post_reactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id VARCHAR(100) NOT NULL,
        user_email VARCHAR(150) NOT NULL,
        reaction_type ENUM('Like', 'Dislike') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_post_reaction (post_id, user_email)
      );
    `);

    // 19. Connections Post Comments Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_post_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id VARCHAR(100) NOT NULL UNIQUE,
        post_id VARCHAR(100) NOT NULL,
        author_email VARCHAR(150) NOT NULL,
        author_name VARCHAR(150) NOT NULL,
        author_username VARCHAR(100) NOT NULL,
        author_avatar LONGTEXT,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 20. Connections Saved Posts Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_saved_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(150) NOT NULL,
        post_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_saved_post (user_email, post_id)
      );
    `);

    // 21. Connections Reels Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_reels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reel_id VARCHAR(100) NOT NULL UNIQUE,
        creator_email VARCHAR(150) NOT NULL,
        creator_name VARCHAR(150) NOT NULL,
        creator_username VARCHAR(100) NOT NULL,
        creator_college VARCHAR(255) NOT NULL,
        creator_avatar LONGTEXT,
        video_url LONGTEXT NOT NULL,
        caption TEXT,
        likes_count INT DEFAULT 0,
        dislikes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 22. Connections Collaborations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_collaborations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collab_id VARCHAR(100) NOT NULL UNIQUE,
        creator_email VARCHAR(150) NOT NULL,
        creator_name VARCHAR(150) NOT NULL,
        creator_username VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description LONGTEXT NOT NULL,
        skills_required LONGTEXT,
        role_offered VARCHAR(150),
        expected_contribution TEXT,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        college VARCHAR(255) NOT NULL,
        department VARCHAR(150),
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 23. Connections Conversations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conv_id VARCHAR(100) NOT NULL UNIQUE,
        participant1_email VARCHAR(150) NOT NULL,
        participant2_email VARCHAR(150) NOT NULL,
        last_message TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 24. Connections Messages Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id VARCHAR(100) NOT NULL UNIQUE,
        conv_id VARCHAR(100) NOT NULL,
        sender_email VARCHAR(150) NOT NULL,
        receiver_email VARCHAR(150) NOT NULL,
        content LONGTEXT,
        media_url LONGTEXT,
        media_type VARCHAR(50),
        voice_note_url LONGTEXT,
        reactions LONGTEXT,
        status VARCHAR(50) DEFAULT 'Sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 24b. Connections Notifications Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connection_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notif_id VARCHAR(100) NOT NULL UNIQUE,
        recipient_email VARCHAR(150) NOT NULL,
        sender_email VARCHAR(150),
        sender_name VARCHAR(150),
        sender_avatar LONGTEXT,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient_email)
      );
    `);


    // 25. Connections User Reports Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS connections_user_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id VARCHAR(100) NOT NULL UNIQUE,
        reporter_email VARCHAR(150) NOT NULL,
        target_type ENUM('User', 'Post', 'Comment', 'Message') NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Under Review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 26. Student Utilities Notes Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id VARCHAR(100) NOT NULL UNIQUE,
        student_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        tags LONGTEXT,
        content LONGTEXT,
        is_pinned TINYINT(1) DEFAULT 0,
        is_archived TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 27. Student Self Tests Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_self_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id VARCHAR(100) NOT NULL UNIQUE,
        student_email VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        source_material_name VARCHAR(255),
        test_type ENUM('Objective', 'Subjective') NOT NULL,
        questions_count INT NOT NULL,
        duration_minutes INT NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'Medium',
        questions_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 28. Student Test Attempts Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_test_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id VARCHAR(100) NOT NULL UNIQUE,
        test_id VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP NULL,
        submitted_at TIMESTAMP NULL,
        answers_json LONGTEXT,
        score DECIMAL(5, 2) DEFAULT 0.00,
        max_score DECIMAL(5, 2) DEFAULT 100.00,
        accuracy_percent DECIMAL(5, 2) DEFAULT 0.00,
        violations_json LONGTEXT,
        status ENUM('In Progress', 'Completed', 'Auto Submitted') DEFAULT 'In Progress',
        ai_report_json LONGTEXT
      );
    `);

    // 29. Assignments Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        subject_code VARCHAR(50),
        class_name VARCHAR(100) NOT NULL,
        description LONGTEXT,
        assignment_type ENUM('Objective', 'Subjective') NOT NULL DEFAULT 'Subjective',
        total_marks INT NOT NULL DEFAULT 50,
        deadline_date VARCHAR(50) NOT NULL,
        deadline_time VARCHAR(50) DEFAULT '11:59 PM',
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        attachment_url LONGTEXT,
        status ENUM('Published', 'Archived') DEFAULT 'Published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 30. Assignment Submissions Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(100) NOT NULL UNIQUE,
        assignment_id VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        submitted_date VARCHAR(100) NOT NULL,
        uploaded_file_name VARCHAR(255),
        uploaded_file_type VARCHAR(50),
        uploaded_file_size VARCHAR(50),
        uploaded_file_url LONGTEXT,
        status ENUM('Pending', 'Submitted', 'Incomplete but Submitted', 'Graded') DEFAULT 'Submitted',
        scored_marks INT DEFAULT NULL,
        faculty_remarks TEXT DEFAULT NULL,
        graded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 31. Student Leaves Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leave_id VARCHAR(100) NOT NULL UNIQUE,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        roll_number VARCHAR(50) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        leave_type ENUM('Medical', 'On Duty (OD)', 'Casual') NOT NULL DEFAULT 'Medical',
        start_date VARCHAR(50) NOT NULL,
        end_date VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        certificate_url LONGTEXT,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        approver_email VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 32. Announcements Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        announcement_id VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Academic',
        target_audience VARCHAR(100) DEFAULT 'Class',
        target_class VARCHAR(100) DEFAULT 'BTECH CSE 4A',
        target_type VARCHAR(50) DEFAULT 'ENTIRE_CLASS',
        target_department VARCHAR(150) DEFAULT NULL,
        target_student_email VARCHAR(150) DEFAULT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        faculty_email VARCHAR(150) NOT NULL,
        attachment_url LONGTEXT,
        priority VARCHAR(50) DEFAULT 'Normal',
        requires_acknowledgement TINYINT(1) DEFAULT 0,
        expires_at DATETIME DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'PUBLISHED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Column Migrations for announcements table
    try { await conn.query('ALTER TABLE announcements ADD COLUMN target_type VARCHAR(50) DEFAULT "ENTIRE_CLASS"'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN target_department VARCHAR(150) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN target_student_email VARCHAR(150) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN requires_acknowledgement TINYINT(1) DEFAULT 0'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN expires_at DATETIME DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN status VARCHAR(50) DEFAULT "PUBLISHED"'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements MODIFY COLUMN priority VARCHAR(50) DEFAULT "Normal"'); } catch (e) { }
    try { await conn.query('ALTER TABLE announcements MODIFY COLUMN target_audience VARCHAR(100) DEFAULT "Class"'); } catch (e) { }

    // 33. Announcement Acknowledgements Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS announcement_acknowledgements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        announcement_id VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_anc_stu (announcement_id, student_email)
      );
    `);

    // 34. Announcement Questions & Clarifications Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS announcement_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id VARCHAR(100) NOT NULL UNIQUE,
        announcement_id VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        question_text TEXT NOT NULL,
        response_text TEXT DEFAULT NULL,
        faculty_email VARCHAR(150) DEFAULT NULL,
        faculty_name VARCHAR(150) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL DEFAULT NULL
      );
    `);

    // 35. Assessment Schemes Table (Configurable evaluation structures per subject & class)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assessment_schemes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scheme_id VARCHAR(100) NOT NULL UNIQUE,
        academic_session VARCHAR(50) NOT NULL DEFAULT '2025-2026',
        department VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        subject_name VARCHAR(150) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        faculty_email VARCHAR(150) NOT NULL,
        components_json LONGTEXT NOT NULL,
        attendance_policy_json LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_scheme_class (class_name),
        INDEX idx_scheme_subj (subject_code)
      );
    `);

    // 36. Student Assessment Marks Table (Authoritative individual student component scores & grades)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_assessment_marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mark_id VARCHAR(100) NOT NULL UNIQUE,
        scheme_id VARCHAR(100) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(150) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        student_email VARCHAR(150) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        marks_obtained DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        max_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
        attendance_percent DECIMAL(5, 2) DEFAULT NULL,
        attendance_marks DECIMAL(5, 2) DEFAULT NULL,
        total_score DECIMAL(5, 2) DEFAULT NULL,
        grade VARCHAR(10) DEFAULT NULL,
        status ENUM('Draft', 'Saved', 'Published', 'Corrected') DEFAULT 'Draft',
        faculty_email VARCHAR(150) NOT NULL,
        faculty_remarks TEXT DEFAULT NULL,
        published_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_sch_stu_comp (scheme_id, student_roll, component_name),
        INDEX idx_mark_student (student_roll),
        INDEX idx_mark_subj (subject_code)
      );
    `);

    // 37. Marks Audit Log Table (Full traceability of score changes)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS marks_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_id VARCHAR(100) NOT NULL UNIQUE,
        mark_id VARCHAR(100) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        previous_marks DECIMAL(5, 2) DEFAULT NULL,
        new_marks DECIMAL(5, 2) NOT NULL,
        reason TEXT NOT NULL,
        corrected_by VARCHAR(150) NOT NULL,
        corrected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 38. Faculty Leaves Table (Faculty leave applications and approval pipeline)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leave_id VARCHAR(100) NOT NULL UNIQUE,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        employee_id VARCHAR(50),
        department VARCHAR(150) NOT NULL,
        leave_type ENUM('Casual', 'Earned', 'Medical', 'On Duty (OD)', 'Maternity/Paternity', 'Compensatory') NOT NULL DEFAULT 'Casual',
        start_date VARCHAR(50) NOT NULL,
        end_date VARCHAR(50) NOT NULL,
        days_count INT NOT NULL DEFAULT 1,
        reason TEXT NOT NULL,
        attachment_url LONGTEXT,
        substitute_faculty VARCHAR(150),
        status ENUM('Pending', 'Approved', 'Rejected', 'Clarification Requested') DEFAULT 'Pending',
        approver_email VARCHAR(150),
        approver_name VARCHAR(150),
        approver_remarks TEXT,
        decision_date TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_fac_leave_email (faculty_email)
      );
    `);

    // 39. Faculty Research Projects Table (Intra & Inter-College Research Collaborations)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_research_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(100) NOT NULL UNIQUE,
        creator_email VARCHAR(150) NOT NULL,
        creator_name VARCHAR(150) NOT NULL,
        department VARCHAR(150) NOT NULL,
        institution VARCHAR(255) DEFAULT 'NEXUS Institute of Technology',
        title VARCHAR(255) NOT NULL,
        research_domain VARCHAR(150) NOT NULL,
        description LONGTEXT NOT NULL,
        required_expertise TEXT,
        visibility ENUM('Intra-College', 'Inter-College', 'Public') DEFAULT 'Intra-College',
        project_stage ENUM('Proposal / Ideation', 'Active / Ongoing', 'Review / Submission', 'Published / Completed') DEFAULT 'Proposal / Ideation',
        milestones_json LONGTEXT,
        status ENUM('Draft', 'Published', 'Active', 'Completed', 'Archived') DEFAULT 'Published',
        members_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_res_proj_creator (creator_email)
      );
    `);

    // 40. Faculty Research Collaboration Requests Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS faculty_research_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id VARCHAR(100) NOT NULL UNIQUE,
        project_id VARCHAR(100) NOT NULL,
        applicant_email VARCHAR(150) NOT NULL,
        applicant_name VARCHAR(150) NOT NULL,
        applicant_department VARCHAR(150) NOT NULL,
        applicant_institution VARCHAR(255) DEFAULT 'NEXUS Institute of Technology',
        message TEXT NOT NULL,
        proposed_role VARCHAR(150),
        status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_res_req_proj (project_id)
      );
    `);

    // 41. Emergency SOS Responders Table (Transactional First-5 Faculty Responders)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS emergency_sos_responders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id VARCHAR(100) NOT NULL,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        faculty_department VARCHAR(150),
        assigned_slot INT NOT NULL,
        response_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action_notes TEXT,
        status ENUM('Responding', 'On Scene', 'Resolved') DEFAULT 'Responding',
        UNIQUE KEY uq_alert_fac (alert_id, faculty_email),
        INDEX idx_sos_alert (alert_id)
      );
    `);

    // Column Migrations for Emergency SOS Alerts table
    try { await conn.query('ALTER TABLE emergency_sos_alerts ADD COLUMN responders_count INT DEFAULT 0'); } catch (e) { }
    try { await conn.query('ALTER TABLE emergency_sos_alerts ADD COLUMN max_responders INT DEFAULT 5'); } catch (e) { }
    try { await conn.query('ALTER TABLE emergency_sos_alerts ADD COLUMN resolved_by VARCHAR(150) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE emergency_sos_alerts ADD COLUMN resolution_notes TEXT DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE emergency_sos_alerts ADD COLUMN resolved_at TIMESTAMP NULL DEFAULT NULL'); } catch (e) { }

    // Column Migrations for Canteen Orders table (Cabin Delivery support)
    try { await conn.query("ALTER TABLE canteen_orders ADD COLUMN delivery_type ENUM('Pickup', 'Cabin Delivery') DEFAULT 'Pickup'"); } catch (e) { }
    try { await conn.query('ALTER TABLE canteen_orders ADD COLUMN cabin_building VARCHAR(100) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE canteen_orders ADD COLUMN cabin_department VARCHAR(100) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE canteen_orders ADD COLUMN cabin_number VARCHAR(50) DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE canteen_orders ADD COLUMN delivery_notes TEXT DEFAULT NULL'); } catch (e) { }

    // Column Migrations for Faculties table (Research and Professional fields)
    try { await conn.query('ALTER TABLE faculties ADD COLUMN research_interests TEXT DEFAULT NULL'); } catch (e) { }
    try { await conn.query('ALTER TABLE faculties ADD COLUMN professional_links TEXT DEFAULT NULL'); } catch (e) { }

    // 42. Parent Meetings Table (Parent Connect Module)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS parent_meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meeting_id VARCHAR(100) NOT NULL UNIQUE,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        parent_name VARCHAR(150) NOT NULL,
        parent_email VARCHAR(150),
        parent_phone VARCHAR(50),
        relationship VARCHAR(50) DEFAULT 'Parent',
        meeting_title VARCHAR(255) NOT NULL,
        meeting_purpose VARCHAR(100) NOT NULL,
        description TEXT,
        meeting_date VARCHAR(50) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL,
        meeting_type ENUM('In-Person', 'Online') DEFAULT 'In-Person',
        meeting_location VARCHAR(255) DEFAULT 'Faculty Block A • Room 304',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        status ENUM('Scheduled', 'Pending Request', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled') DEFAULT 'Scheduled',
        initiator ENUM('Faculty', 'Parent') DEFAULT 'Faculty',
        follow_up_notes TEXT,
        attachment_url LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_meet_fac (faculty_email),
        INDEX idx_meet_roll (student_roll)
      );
    `);

    // 43. Parent Invitations Table (PTM, Academic Reviews, Events)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS parent_invitations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invitation_id VARCHAR(100) NOT NULL UNIQUE,
        faculty_email VARCHAR(150) NOT NULL,
        faculty_name VARCHAR(150) NOT NULL,
        event_id VARCHAR(100),
        event_title VARCHAR(255) NOT NULL,
        student_roll VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        parent_name VARCHAR(150) NOT NULL,
        parent_email VARCHAR(150),
        event_date VARCHAR(50) NOT NULL,
        event_time VARCHAR(50),
        venue VARCHAR(255) NOT NULL,
        message TEXT,
        rsvp_deadline VARCHAR(50),
        rsvp_status ENUM('Pending', 'Accepted', 'Declined', 'Tentative') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_inv_fac (faculty_email),
        INDEX idx_inv_roll (student_roll)
      );
    `);

    // 44. Parent Feedback Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS parent_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feedback_id VARCHAR(100) NOT NULL UNIQUE,
        student_roll VARCHAR(50) NOT NULL,
        student_name VARCHAR(150) NOT NULL,
        parent_name VARCHAR(150) NOT NULL,
        parent_email VARCHAR(150),
        faculty_email VARCHAR(150),
        feedback_category VARCHAR(100) DEFAULT 'Academic',
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('Pending', 'In Review', 'Responded', 'Closed') DEFAULT 'Pending',
        response_text TEXT,
        responded_by VARCHAR(150),
        responded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fb_fac (faculty_email),
        INDEX idx_fb_roll (student_roll)
      );
    `);

    // 45. Parent Student Links Table (Multi-Child Linking & Verification)
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

    // Column Migrations for Parents
    try { await conn.query('ALTER TABLE parents ADD COLUMN photo_url LONGTEXT DEFAULT NULL'); } catch (e) { }
    try { await conn.query("ALTER TABLE parents ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English'"); } catch (e) { }
    try { await conn.query("ALTER TABLE parents ADD COLUMN verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'VERIFIED'"); } catch (e) { }
    try { await conn.query("ALTER TABLE parents ADD COLUMN is_active TINYINT(1) DEFAULT 1"); } catch (e) { }

    // Column Migrations for Unified Student Approvals
    try { await conn.query("ALTER TABLE digital_cards MODIFY COLUMN card_type VARCHAR(100) NOT NULL"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending Approval'"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN student_name VARCHAR(150)"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN class_name VARCHAR(100)"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN department VARCHAR(150)"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN rejection_reason TEXT"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN clarification_request TEXT"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN clarification_response TEXT"); } catch (e) { }
    try { await conn.query("ALTER TABLE digital_cards ADD COLUMN internal_notes TEXT"); } catch (e) { }

    try { await conn.query("ALTER TABLE student_documents ADD COLUMN student_name VARCHAR(150)"); } catch (e) { }
    try { await conn.query("ALTER TABLE student_documents ADD COLUMN class_name VARCHAR(100)"); } catch (e) { }
    try { await conn.query("ALTER TABLE student_documents ADD COLUMN department VARCHAR(150)"); } catch (e) { }
    try { await conn.query("ALTER TABLE student_documents ADD COLUMN verified_by VARCHAR(150)"); } catch (e) { }
    try { await conn.query("ALTER TABLE student_documents ADD COLUMN rejection_reason TEXT"); } catch (e) { }
    try { await conn.query("ALTER TABLE student_documents ADD COLUMN clarification_request TEXT"); } catch (e) { }

    // Ensure missing columns exist in case tables were created under old schema
    const requiredColumns = [
      { name: 'password', type: "VARCHAR(255) NOT NULL DEFAULT ''" },
      { name: 'q1', type: 'TEXT' },
      { name: 'a1', type: 'VARCHAR(255)' },
      { name: 'q2', type: 'TEXT' },
      { name: 'a2', type: 'VARCHAR(255)' },
      { name: 'q3', type: 'TEXT' },
      { name: 'a3', type: 'VARCHAR(255)' },
    ];

    const studentExtraColumns = [
      { name: 'section', type: "VARCHAR(20) DEFAULT '4A'" },
      { name: 'class', type: "VARCHAR(100) NOT NULL DEFAULT 'BTECH CSE 4A'" },
      { name: 'semester', type: "VARCHAR(50) NOT NULL DEFAULT 'Semester 7'" },
      { name: 'department', type: "VARCHAR(150) NOT NULL DEFAULT 'Computer Science & Engineering'" },
    ];

    const alumniExtraColumns = [
      { name: 'username', type: 'VARCHAR(100)' },
      { name: 'cover_photo_url', type: 'LONGTEXT' },
      { name: 'batch', type: 'VARCHAR(50)' },
      { name: 'degree', type: "VARCHAR(100) DEFAULT 'B.Tech'" },
      { name: 'section', type: 'VARCHAR(20)' },
      { name: 'student_registration_number', type: 'VARCHAR(100)' },
      { name: 'college_name', type: "VARCHAR(255) DEFAULT 'NEXUS Institute of Technology'" },
      { name: 'current_city', type: 'VARCHAR(100)' },
      { name: 'current_country', type: 'VARCHAR(100)' },
      { name: 'current_company', type: 'VARCHAR(150)' },
      { name: 'current_designation', type: 'VARCHAR(150)' },
      { name: 'industry', type: 'VARCHAR(150)' },
      { name: 'skills', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'linkedin_url', type: 'VARCHAR(255)' },
      { name: 'github_url', type: 'VARCHAR(255)' },
      { name: 'other_links', type: 'TEXT' },
      { name: 'alumni_id', type: 'VARCHAR(50)' },
      { name: 'verification_status', type: "ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING'" },
      { name: 'privacy_level', type: "ENUM('PUBLIC', 'CAMPUS_ONLY', 'CONNECTIONS_ONLY', 'PRIVATE') DEFAULT 'CAMPUS_ONLY'" },
      { name: 'mentorship_available', type: 'TINYINT(1) DEFAULT 1' },
      { name: 'job_provider', type: 'TINYINT(1) DEFAULT 0' },
    ];

    const roleTables = ['students', 'faculties', 'parents', 'alumni', 'administrators'];
    for (const tbl of roleTables) {
      await ensureTableColumns(conn, tbl, requiredColumns);
    }

    await ensureTableColumns(conn, 'students', studentExtraColumns);
    await ensureTableColumns(conn, 'alumni', alumniExtraColumns);

    try {
      await conn.query("ALTER TABLE alumni MODIFY COLUMN roll_number VARCHAR(50) NULL DEFAULT NULL;");
    } catch (err: any) {
      // Ignore if column already nullable
    }

    // Seed Demo Faculty User if not present
    try {
      const [facs]: any = await conn.query("SELECT id FROM faculties WHERE email = 'faculty@nexus.edu' OR employee_id = 'EMP-CSE-101'");
      if (!Array.isArray(facs) || facs.length === 0) {
        await conn.query(`
          INSERT INTO faculties (faculty_name, employee_id, department, designation, email, mobile, address, joining_date, subjects_taught, password, q1, a1, q2, a2, q3, a3)
          VALUES (
            'Dr. SMB',
            'EMP-CSE-101',
            'Computer Science & Engineering',
            'Associate Professor',
            'faculty@nexus.edu',
            '9876543210',
            'Campus Faculty Block A',
            '2020-07-15',
            'Blockchain Technologies, Agile Software Development, Database Management Systems',
            'faculty123',
            'What is your first pet name?',
            'nexus',
            'What is your birthplace?',
            'campus',
            'What is your favorite subject?',
            'computer'
          )
        `);
        console.log('✅ Seeded default demo Faculty user: faculty@nexus.edu / faculty123');
      }
    } catch (seedErr: any) {
      console.warn('⚠️ Faculty seed notice:', seedErr.message);
    }

    conn.release();
    console.log('✅ MySQL Database Schema Initialized & Auto-Migrated (nexus_campus_db)!');
    return true;
  } catch (error: any) {
    console.warn(`⚠️ MySQL Connection Warning: ${error.message}`);
    return false;
  }
};

