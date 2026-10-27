const { pool } = require('./dist/config/database');

(async () => {
  try {
    const userEmail = 'jatinsingh@gmail.com';
    const [rows] = await pool.query(
      `SELECT r.request_id, r.sender_email, r.receiver_email, r.message, r.created_at,
              COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
              COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as photograph_url,
              COALESCE(s.department, f.department, a.department, p.department, 'Department') as department,
              COALESCE(f.college, a.current_company, p.college, 'NEXUS Network') as current_company,
              COALESCE(f.designation, a.current_designation, p.course, 'Member') as current_designation,
              COALESCE(a.graduation_year, '2023') as graduation_year
       FROM connection_requests r
       LEFT JOIN students s ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(s.email))
       LEFT JOIN faculties f ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(f.email))
       LEFT JOIN alumni a ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(a.email))
       LEFT JOIN connections_profiles p ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(p.email))
       WHERE LOWER(TRIM(r.receiver_email)) = ? AND r.status = 'Pending'
       ORDER BY r.id DESC`,
      [userEmail]
    );
    console.log('POOL QUERY INCOMING FOR JATIN:', JSON.stringify(rows, null, 2));

    const [rowsKetan] = await pool.query(
      `SELECT r.request_id, r.sender_email, r.receiver_email, r.message, r.created_at,
              COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
              COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as photograph_url,
              COALESCE(s.department, f.department, a.department, p.department, 'Department') as department,
              COALESCE(f.college, a.current_company, p.college, 'NEXUS Network') as current_company,
              COALESCE(f.designation, a.current_designation, p.course, 'Member') as current_designation,
              COALESCE(a.graduation_year, '2023') as graduation_year
       FROM connection_requests r
       LEFT JOIN students s ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(s.email))
       LEFT JOIN faculties f ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(f.email))
       LEFT JOIN alumni a ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(a.email))
       LEFT JOIN connections_profiles p ON LOWER(TRIM(r.sender_email)) = LOWER(TRIM(p.email))
       WHERE LOWER(TRIM(r.receiver_email)) = ? AND r.status = 'Pending'
       ORDER BY r.id DESC`,
      ['ketan@gmail.com']
    );
    console.log('POOL QUERY INCOMING FOR KETAN:', JSON.stringify(rowsKetan, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('POOL ERROR:', err);
    process.exit(1);
  }
})();
