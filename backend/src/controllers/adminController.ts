import { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent } from '../config/socket';

// Helper function to insert audit logs
export const logAdminAction = async (
  adminEmail: string,
  adminName: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: string,
  previousValue?: string,
  newValue?: string
) => {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO admin_audit_logs (log_id, admin_email, admin_name, action, target_type, target_id, details, previous_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        adminEmail || 'admin@nexus.edu',
        adminName || 'Admin User',
        action,
        targetType,
        targetId || null,
        details || null,
        previousValue || null,
        newValue || null,
      ]
    );
  } catch (err: any) {
    console.error('Audit Log Error:', err.message);
  }
};

// ==========================================
// 1. OVERVIEW STATS & REAL-TIME ANALYTICS
// ==========================================
export const getAdminOverviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [[studentsCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM students`);
    const [[facultiesCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM faculties`);
    const [[alumniCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM alumni`);
    const [[parentsCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM parents`);
    const [[adminsCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM administrators`);
    const [[classesCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM classes`);
    const [[deptsCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM departments`);
    
    // Pending items
    const [[pendingAlumni]]: any = await pool.query(`SELECT COUNT(*) as c FROM alumni WHERE verification_status = 'PENDING'`);
    const [[pendingLeaves]]: any = await pool.query(`SELECT COUNT(*) as c FROM student_leaves WHERE status = 'Pending'`);
    const [[pendingFacultyLeaves]]: any = await pool.query(`SELECT COUNT(*) as c FROM faculty_leaves WHERE status = 'Pending'`);
    const [[pendingCards]]: any = await pool.query(`SELECT COUNT(*) as c FROM digital_cards WHERE status = 'Pending'`);
    const [[pendingMedCert]]: any = await pool.query(`SELECT COUNT(*) as c FROM medical_certificates WHERE status = 'Pending'`);
    const [[pendingComplaints]]: any = await pool.query(`SELECT COUNT(*) as c FROM student_safety_reports WHERE status IN ('Submitted', 'Under Review', 'Draft')`);
    const [[activeSos]]: any = await pool.query(`SELECT COUNT(*) as c FROM emergency_sos_alerts WHERE status IN ('Sending', 'Alert Sent', 'Help Response Received')`);
    
    // Financial & services
    const [[paymentDues]]: any = await pool.query(`SELECT COUNT(*) as c FROM fee_payments WHERE payment_status = 'Pending'`);
    const [[activeEvents]]: any = await pool.query(`SELECT COUNT(*) as c FROM events_and_elections`);
    const [[pendingDocs]]: any = await pool.query(`SELECT COUNT(*) as c FROM student_documents WHERE verification_status = 'Pending'`);

    // Distribution Data for Charts
    const [studentsByDept]: any = await pool.query(`SELECT department, COUNT(*) as count FROM students GROUP BY department`);
    const [studentsByYear]: any = await pool.query(`SELECT semester, COUNT(*) as count FROM students GROUP BY semester`);
    const [facultyByDept]: any = await pool.query(`SELECT department, COUNT(*) as count FROM faculties GROUP BY department`);
    const [alumniByYear]: any = await pool.query(`SELECT graduation_year as year, COUNT(*) as count FROM alumni GROUP BY graduation_year ORDER BY graduation_year DESC LIMIT 6`);
    const [attendanceDist]: any = await pool.query(`SELECT status, COUNT(*) as count FROM attendance GROUP BY status`);
    const [complaintDist]: any = await pool.query(`SELECT status, COUNT(*) as count FROM student_safety_reports GROUP BY status`);

    const totalActiveUsers = (studentsCount?.c || 0) + (facultiesCount?.c || 0) + (alumniCount?.c || 0) + (adminsCount?.c || 0) + (parentsCount?.c || 0);
    const totalPendingApprovals = (pendingAlumni?.c || 0) + (pendingLeaves?.c || 0) + (pendingFacultyLeaves?.c || 0) + (pendingCards?.c || 0) + (pendingMedCert?.c || 0) + (pendingDocs?.c || 0);

    res.status(200).json({
      status: 'success',
      success: true,
      stats: {
        totalStudents: studentsCount?.c || 0,
        totalFaculty: facultiesCount?.c || 0,
        totalAlumni: alumniCount?.c || 0,
        totalParents: parentsCount?.c || 0,
        totalAdmins: adminsCount?.c || 0,
        totalActiveUsers,
        totalClasses: classesCount?.c || 0,
        totalDepartments: deptsCount?.c || 0,
        pendingApprovals: totalPendingApprovals,
        pendingComplaints: pendingComplaints?.c || 0,
        pendingLeaves: pendingLeaves?.c || 0,
        activeEvents: activeEvents?.c || 0,
        paymentDues: paymentDues?.c || 0,
        systemAlerts: activeSos?.c || 0,
        pendingDocs: pendingDocs?.c || 0,
      },
      charts: {
        studentsByDept,
        studentsByYear,
        facultyByDept,
        alumniByYear,
        attendanceDist,
        complaintDist,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin overview stats:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 2. UNIFIED USERS & ACCOUNTS DIRECTORY
// ==========================================
export const getUsersList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, status, department } = req.query;
    let users: any[] = [];

    if (!role || role === 'All' || role === 'Student') {
      let q = `SELECT id, full_name as name, roll_number as identifier, email, department, class, 'Student' as role, CASE WHEN is_active = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END as status, created_at FROM students WHERE 1=1`;
      const p: any[] = [];
      if (search) {
        q += ` AND (full_name LIKE ? OR roll_number LIKE ? OR email LIKE ? OR department LIKE ?)`;
        const s = `%${search}%`;
        p.push(s, s, s, s);
      }
      if (department && department !== 'All') {
        q += ` AND department = ?`;
        p.push(department);
      }
      const [stus]: any = await pool.query(q, p);
      users.push(...stus);
    }

    if (!role || role === 'All' || role === 'Faculty') {
      let q = `SELECT id, faculty_name as name, employee_id as identifier, email, department, incharge_class as class, 'Faculty' as role, 'ACTIVE' as status, created_at FROM faculties WHERE 1=1`;
      const p: any[] = [];
      if (search) {
        q += ` AND (faculty_name LIKE ? OR employee_id LIKE ? OR email LIKE ? OR department LIKE ?)`;
        const s = `%${search}%`;
        p.push(s, s, s, s);
      }
      if (department && department !== 'All') {
        q += ` AND department = ?`;
        p.push(department);
      }
      const [facs]: any = await pool.query(q, p);
      users.push(...facs);
    }

    if (!role || role === 'All' || role === 'Alumni') {
      let q = `SELECT id, full_name as name, COALESCE(NULLIF(alumni_id,''), NULLIF(roll_number,''), student_registration_number, email) as identifier, email, department, graduation_year as class, 'Alumni' as role, verification_status as status, created_at FROM alumni WHERE 1=1`;
      const p: any[] = [];
      if (search) {
        q += ` AND (full_name LIKE ? OR email LIKE ? OR department LIKE ? OR alumni_id LIKE ? OR roll_number LIKE ?)`;
        const s = `%${search}%`;
        p.push(s, s, s, s, s);
      }
      if (department && department !== 'All') {
        q += ` AND department = ?`;
        p.push(department);
      }
      if (status && status !== 'All') {
        q += ` AND verification_status = ?`;
        p.push(status);
      }
      const [alms]: any = await pool.query(q, p);
      users.push(...alms);
    }

    if (!role || role === 'All' || role === 'Administrator') {
      let q = `SELECT id, admin_name as name, email as identifier, email, department, access_level as class, 'Administrator' as role, 'ACTIVE' as status, created_at FROM administrators WHERE 1=1`;
      const p: any[] = [];
      if (search) {
        q += ` AND (admin_name LIKE ? OR email LIKE ? OR department LIKE ?)`;
        const s = `%${search}%`;
        p.push(s, s, s);
      }
      const [adms]: any = await pool.query(q, p);
      users.push(...adms);
    }

    if (!role || role === 'All' || role === 'Parent') {
      let q = `SELECT p.id, p.parent_name as name, p.student_roll_number as identifier, p.email, 'Parent-Guardian' as department, p.relationship as class, 'Parent' as role, COALESCE(p.verification_status, 'Verified') as status, p.created_at FROM parents p WHERE 1=1`;
      const pParams: any[] = [];
      if (search) {
        q += ` AND (p.parent_name LIKE ? OR p.student_roll_number LIKE ? OR p.email LIKE ?)`;
        const s = `%${search}%`;
        pParams.push(s, s, s);
      }
      if (status && status !== 'All') {
        q += ` AND COALESCE(p.verification_status, 'Verified') = ?`;
        pParams.push(status);
      }
      const [parents]: any = await pool.query(q, pParams);
      users.push(...parents);
    }

    res.status(200).json({
      status: 'success',
      total: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2b. CREATE NEW USER ACCOUNT (ADMIN PROVISIONING)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.body.role;
    const name = req.body.name || req.body.fullName;
    const email = req.body.email;
    const password = req.body.password || req.body.tempPassword;
    const identifier = req.body.identifier || req.body.rollNumber || req.body.employeeId;
    const department = req.body.department;
    const className = req.body.className || req.body.classCode;
    const mobile = req.body.mobile;
    const adminEmail = req.body.adminEmail;
    const adminName = req.body.adminName;

    if (!role || !name || !email || !password) {
      res.status(400).json({ status: 'error', success: false, message: 'Role, name, email, and password are required.' });
      return;
    }

    if (role === 'Student') {
      const rollNumber = identifier || `STU-${Date.now().toString().slice(-6)}`;
      await pool.query(
        `INSERT INTO students (full_name, admission_number, roll_number, email, password, department, class, semester, mobile, address, college_name, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Campus Residential Block B', 'NEXUS University', 1)`,
        [name, rollNumber, rollNumber, email, password, department || 'Computer Science & Engineering', className || 'B.Tech CSE 4A', '7', mobile || '']
      );
    } else if (role === 'Faculty') {
      const empId = identifier || `EMP-${Date.now().toString().slice(-4)}`;
      await pool.query(
        `INSERT INTO faculties (faculty_name, employee_id, email, password, department, designation, mobile, address)
         VALUES (?, ?, ?, ?, ?, 'Assistant Professor', ?, 'Faculty Housing Block A')`,
        [name, empId, email, password, department || 'Computer Science & Engineering', mobile || '']
      );
    } else if (role === 'Parent') {
      const studentRoll = identifier || '';
      await pool.query(
        `INSERT INTO parents (parent_name, email, password, mobile, student_name, student_roll_number, relationship, verification_status, is_active)
         VALUES (?, ?, ?, ?, 'Student Record', ?, 'Guardian', 'Verified', 1)`,
        [name, email, password, mobile || '', studentRoll]
      );
      if (studentRoll) {
        const linkId = `LNK-${Date.now()}`;
        await pool.query(
          `INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status, verified_by, verified_at)
           VALUES (?, ?, ?, 'Linked Student', 'Guardian', 'Verified', ?, CURRENT_TIMESTAMP)`,
          [linkId, email, studentRoll, adminEmail || 'admin@nexus.edu']
        );
      }
    } else if (role === 'Alumni') {
      const alumniId = `ALM-${Date.now().toString().slice(-4)}`;
      await pool.query(
        `INSERT INTO alumni (full_name, email, password, mobile, graduation_year, department, verification_status, alumni_id, college_name, is_active)
         VALUES (?, ?, ?, ?, 2024, ?, 'VERIFIED', ?, 'NEXUS University', 1)`,
        [name, email, password, mobile || '', department || 'Computer Science & Engineering', alumniId]
      );
    } else if (role === 'Administrator') {
      await pool.query(
        `INSERT INTO administrators (admin_name, email, password, department, access_level, mobile)
         VALUES (?, ?, ?, ?, 'Campus Admin', ?)`,
        [name, email, password, department || 'Central Administration', mobile || '']
      );
    } else {
      res.status(400).json({ status: 'error', success: false, message: 'Invalid role specified.' });
      return;
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `CREATE_USER_${role.toUpperCase()}`,
      role,
      email,
      `Provisioned new ${role} account for ${name} (${email})`
    );

    emitRealtimeEvent('role:Administrator', 'user:created', { role, name, email });

    res.status(200).json({ status: 'success', success: true, message: `${role} account for ${name} created successfully!` });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// 2c. RESET USER PASSWORD
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email, newPassword, adminEmail, adminName } = req.body;
    if (!role || !email || !newPassword) {
      res.status(400).json({ status: 'error', success: false, message: 'Role, email, and newPassword are required.' });
      return;
    }

    if (role === 'Student') {
      await pool.query(`UPDATE students SET password = ? WHERE email = ?`, [newPassword, email]);
    } else if (role === 'Faculty') {
      await pool.query(`UPDATE faculties SET password = ? WHERE email = ?`, [newPassword, email]);
    } else if (role === 'Parent') {
      await pool.query(`UPDATE parents SET password = ? WHERE email = ?`, [newPassword, email]);
    } else if (role === 'Alumni') {
      await pool.query(`UPDATE alumni SET password = ? WHERE email = ?`, [newPassword, email]);
    } else if (role === 'Administrator') {
      await pool.query(`UPDATE administrators SET password = ? WHERE email = ?`, [newPassword, email]);
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `RESET_PASSWORD_${role.toUpperCase()}`,
      role,
      email,
      `Reset password for ${role} user: ${email}`
    );

    res.status(200).json({ status: 'success', success: true, message: `Password for ${email} has been updated successfully.` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// 2d. UPDATE USER STATUS (ACTIVE/INACTIVE/SUSPEND/VERIFY)
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    let { userId, email, role, newStatus, isActive, status, adminEmail, adminName } = req.body;

    if (newStatus === undefined) {
      if (isActive !== undefined) {
        newStatus = isActive ? 'ACTIVE' : 'INACTIVE';
      } else if (status !== undefined) {
        newStatus = status;
      } else {
        newStatus = 'ACTIVE';
      }
    }

    if (!userId && email) {
      if (role === 'Student') {
        const [[s]]: any = await pool.query(`SELECT id FROM students WHERE email = ?`, [email]);
        if (s) userId = s.id;
      } else if (role === 'Faculty') {
        const [[f]]: any = await pool.query(`SELECT id FROM faculties WHERE email = ?`, [email]);
        if (f) userId = f.id;
      } else if (role === 'Parent') {
        const [[p]]: any = await pool.query(`SELECT id FROM parents WHERE email = ?`, [email]);
        if (p) userId = p.id;
      } else if (role === 'Alumni') {
        const [[a]]: any = await pool.query(`SELECT id FROM alumni WHERE email = ?`, [email]);
        if (a) userId = a.id;
      }
    }

    if (role === 'Alumni') {
      if (newStatus === 'VERIFIED') {
        const alumniId = `ALM-${Date.now().toString().slice(-4)}`;
        await pool.query(
          `UPDATE alumni SET verification_status = 'VERIFIED', alumni_id = COALESCE(NULLIF(alumni_id, ''), ?) WHERE id = ? OR email = ?`,
          [alumniId, userId || 0, email || '']
        );
      } else {
        await pool.query(`UPDATE alumni SET verification_status = ? WHERE id = ? OR email = ?`, [newStatus, userId || 0, email || '']);
      }
    } else if (role === 'Student') {
      await pool.query(`UPDATE students SET is_active = ? WHERE id = ? OR email = ?`, [newStatus === 'ACTIVE' ? 1 : 0, userId || 0, email || '']);
    } else if (role === 'Parent') {
      await pool.query(`UPDATE parents SET verification_status = ?, is_active = ? WHERE id = ? OR email = ?`, [newStatus, newStatus === 'ACTIVE' || newStatus === 'Verified' ? 1 : 0, userId || 0, email || '']);
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Administrator',
      `UPDATE_USER_STATUS_${newStatus}`,
      role,
      String(userId || email),
      `Updated ${role} status to ${newStatus}`
    );

    emitRealtimeEvent('role:Administrator', 'user:status_changed', { userId, email, role, newStatus });

    res.status(200).json({ status: 'success', success: true, message: `User status updated to ${newStatus}` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 3. STUDENT MANAGEMENT
// ==========================================
export const getStudentsAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, classCode, search } = req.query;
    let q = `SELECT id, full_name, roll_number, admission_number, college_name, class, semester, department, email, mobile, father_name, conveyance_mode, hostel_name, room_number, is_active, created_at FROM students WHERE 1=1`;
    const params: any[] = [];

    if (department && department !== 'All') {
      q += ` AND department = ?`;
      params.push(department);
    }
    if (classCode && classCode !== 'All') {
      q += ` AND class = ?`;
      params.push(classCode);
    }
    if (search) {
      q += ` AND (full_name LIKE ? OR roll_number LIKE ? OR email LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    q += ` ORDER BY id DESC`;
    const [rows]: any = await pool.query(q, params);

    res.status(200).json({ status: 'success', count: rows.length, students: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateStudentEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, rollNumber, email, targetClass, newClass, department, semester, newSemester, conveyanceMode, hostelName, roomNumber, adminEmail, adminName } = req.body;
    const finalClass = targetClass || newClass;
    const finalSem = semester || newSemester;

    const [[existing]]: any = await pool.query(
      `SELECT * FROM students WHERE id = ? OR roll_number = ? OR email = ?`,
      [studentId || 0, rollNumber || '', email || '']
    );
    if (!existing) {
      res.status(404).json({ status: 'error', success: false, message: 'Student record not found.' });
      return;
    }

    await pool.query(
      `UPDATE students SET class = ?, department = ?, semester = ?, conveyance_mode = ?, hostel_name = ?, room_number = ? WHERE id = ?`,
      [
        finalClass || existing.class,
        department || existing.department,
        finalSem || existing.semester,
        conveyanceMode || existing.conveyance_mode,
        hostelName || existing.hostel_name,
        roomNumber || existing.room_number,
        existing.id
      ]
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Administrator',
      'UPDATE_STUDENT_ENROLLMENT',
      'Student',
      existing.roll_number,
      `Updated class to ${finalClass || existing.class}, dept to ${department || existing.department}`,
      existing.class,
      finalClass || existing.class
    );

    emitRealtimeEvent(`user:${existing.email.toLowerCase()}`, 'student:class_updated', {
      studentRoll: existing.roll_number,
      newClass: finalClass || existing.class,
      newDepartment: department || existing.department,
    });
    emitRealtimeEvent(`class:${finalClass || existing.class}`, 'class:roster_updated', {
      studentRoll: existing.roll_number,
    });

    res.status(200).json({ status: 'success', success: true, message: `Student enrollment details updated successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 4. FACULTY MANAGEMENT & RESPONSIBILITIES
// ==========================================
export const getFacultyAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, faculty_name, employee_id, department, designation, email, mobile, is_class_incharge, incharge_class, subjects_taught, created_at FROM faculties ORDER BY id DESC`
    );
    res.status(200).json({ status: 'success', success: true, count: rows.length, faculty: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const assignClassIncharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyId, facultyEmail, classCode, adminEmail, adminName } = req.body;

    const [facs]: any = await pool.query(`SELECT id, faculty_name, email FROM faculties WHERE id = ? OR email = ? LIMIT 1`, [facultyId || 0, facultyEmail || '']);
    if (facs.length === 0) {
      res.status(404).json({ status: 'error', success: false, message: 'Faculty member not found.' });
      return;
    }
    const faculty = facs[0];

    // Clear previous incharge
    await pool.query(`UPDATE faculties SET is_class_incharge = 'No', incharge_class = NULL WHERE incharge_class = ?`, [classCode]);

    // Set new incharge
    await pool.query(
      `UPDATE faculties SET is_class_incharge = 'Yes', incharge_class = ? WHERE id = ?`,
      [classCode, faculty.id]
    );

    // Update classes table
    await pool.query(
      `UPDATE classes SET class_incharge_id = ?, class_incharge_email = ?, class_incharge_name = ? WHERE class_code = ? OR class_name = ?`,
      [faculty.id, faculty.email, faculty.faculty_name, classCode, classCode]
    );

    await logAdminAction(
      adminEmail,
      adminName,
      'ASSIGN_CLASS_INCHARGE',
      'Faculty',
      String(faculty.id),
      `Assigned ${faculty.faculty_name} as Class Incharge for ${classCode}`
    );

    emitRealtimeEvent(`user:${faculty.email.toLowerCase()}`, 'faculty:incharge_assigned', {
      classCode,
      facultyName: faculty.faculty_name,
    });

    res.status(200).json({
      status: 'success',
      success: true,
      message: `Assigned ${faculty.faculty_name} as Class Incharge for ${classCode}! This will sync live to the Faculty's My Students & Classes module.`,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateFacultyDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyId, department, designation, mobile, subjectsTaught, adminEmail, adminName } = req.body;
    await pool.query(
      `UPDATE faculties SET department = ?, designation = ?, mobile = ?, subjects_taught = ? WHERE id = ?`,
      [department, designation, mobile, subjectsTaught, facultyId]
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'UPDATE_FACULTY_DETAILS',
      'Faculty',
      String(facultyId),
      `Updated profile and subject assignments for faculty ID ${facultyId}`
    );

    res.status(200).json({ status: 'success', message: 'Faculty details updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 5. PARENT MANAGEMENT & GOVERNANCE
// ==========================================
export const getParentGovernance = async (req: Request, res: Response): Promise<void> => {
  try {
    const [[parentsCount]]: any = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN verification_status = 'Verified' THEN 1 ELSE 0 END) as verified, 
              SUM(CASE WHEN verification_status = 'Pending' THEN 1 ELSE 0 END) as pending 
       FROM parents`
    );
    const [[linksCount]]: any = await pool.query(
      `SELECT COUNT(*) as total_links, 
              SUM(CASE WHEN verification_status = 'Verified' THEN 1 ELSE 0 END) as verified_links, 
              SUM(CASE WHEN verification_status = 'Pending' THEN 1 ELSE 0 END) as pending_links 
       FROM parent_student_links`
    );
    const [[meetingsCount]]: any = await pool.query(
      `SELECT COUNT(*) as c FROM parent_meetings WHERE status IN ('Scheduled', 'Confirmed', 'Pending')`
    );
    const [[feedbackCount]]: any = await pool.query(
      `SELECT COUNT(*) as c FROM parent_feedback WHERE status IN ('Submitted', 'Pending Review', 'Under Review')`
    );

    const [relationshipRequests]: any = await pool.query(
      `SELECT psl.*, s.department, s.class, s.email as student_email
       FROM parent_student_links psl
       LEFT JOIN students s ON s.roll_number = psl.student_roll
       ORDER BY psl.created_at DESC LIMIT 50`
    );

    const [parentsList]: any = await pool.query(
      `SELECT p.id, p.parent_name as name, p.email, p.mobile as phone, p.student_roll_number as student_roll, p.relationship, p.verification_status, p.created_at,
              (SELECT COUNT(*) FROM parent_student_links WHERE parent_email = p.email) as linked_children_count
       FROM parents p
       ORDER BY p.created_at DESC LIMIT 50`
    );

    res.status(200).json({
      status: 'success',
      success: true,
      stats: {
        totalParents: parentsCount?.total || 0,
        verifiedParents: parentsCount?.verified || 0,
        pendingParents: parentsCount?.pending || 0,
        totalLinks: linksCount?.total_links || 0,
        verifiedLinks: linksCount?.verified_links || 0,
        pendingLinks: linksCount?.pending_links || 0,
        activeMeetings: meetingsCount?.c || 0,
        pendingFeedback: feedbackCount?.c || 0,
      },
      relationshipRequests,
      parentsList,
      parents: parentsList,
    });
  } catch (error: any) {
    console.error('Error fetching parent governance data:', error);
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateParentRelationshipStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkId, status, adminEmail } = req.body;
    if (!linkId || !status) {
      res.status(400).json({ status: 'error', message: 'linkId and status are required' });
      return;
    }

    const [[existing]]: any = await pool.query(`SELECT * FROM parent_student_links WHERE link_id = ?`, [linkId]);
    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Relationship record not found' });
      return;
    }

    await pool.query(
      `UPDATE parent_student_links 
       SET verification_status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP 
       WHERE link_id = ?`,
      [status, adminEmail || 'admin@nexus.edu', linkId]
    );

    if (status === 'Verified') {
      await pool.query(`UPDATE parents SET verification_status = 'Verified' WHERE email = ?`, [existing.parent_email]);
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      'Administrator',
      `UPDATE_PARENT_RELATIONSHIP_${status.toUpperCase()}`,
      'ParentStudentLink',
      linkId,
      `Updated relationship status of parent ${existing.parent_email} to student ${existing.student_roll} to ${status}`
    );

    emitRealtimeEvent(`user:${existing.parent_email.toLowerCase()}`, 'parent:link_verified', {
      studentRoll: existing.student_roll,
      status,
    });

    res.status(200).json({ status: 'success', message: `Relationship status updated to ${status} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 6. ALUMNI MANAGEMENT & VERIFICATION
// ==========================================
export const getPendingAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const [pendingAlumni]: any = await pool.query(
      `SELECT id, full_name, email, mobile, department, graduation_year, degree, college_name, current_company, current_designation, verification_status, created_at FROM alumni WHERE verification_status = 'PENDING' ORDER BY created_at DESC`
    );
    res.status(200).json({ status: 'success', total: pendingAlumni.length, pendingAlumni });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAlumniDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, graduationYear, status, search } = req.query;
    let q = `SELECT id, full_name, email, mobile, department, graduation_year, degree, current_company, current_designation, alumni_id, verification_status, mentorship_available, created_at FROM alumni WHERE 1=1`;
    const params: any[] = [];

    if (department && department !== 'All') {
      q += ` AND department = ?`;
      params.push(department);
    }
    if (graduationYear && graduationYear !== 'All') {
      q += ` AND graduation_year = ?`;
      params.push(graduationYear);
    }
    if (status && status !== 'All') {
      q += ` AND verification_status = ?`;
      params.push(status);
    }
    if (search) {
      q += ` AND (full_name LIKE ? OR email LIKE ? OR current_company LIKE ? OR alumni_id LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    q += ` ORDER BY id DESC LIMIT 100`;
    const [rows]: any = await pool.query(q, params);

    res.status(200).json({ status: 'success', count: rows.length, alumni: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const verifyAlumniStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniId, status, notes, adminEmail, adminName } = req.body;
    const generatedId = `ALM-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    if (status === 'VERIFIED') {
      await pool.query(
        `UPDATE alumni SET verification_status = 'VERIFIED', alumni_id = COALESCE(NULLIF(alumni_id, ''), ?), verification_notes = ? WHERE id = ?`,
        [generatedId, notes || 'Verified by Central Administration', alumniId]
      );
    } else {
      await pool.query(
        `UPDATE alumni SET verification_status = ?, verification_notes = ? WHERE id = ?`,
        [status, notes || 'Rejected by Admin', alumniId]
      );
    }

    const [[alumni]]: any = await pool.query(`SELECT email, full_name FROM alumni WHERE id = ?`, [alumniId]);

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `VERIFY_ALUMNI_${status}`,
      'Alumni',
      String(alumniId),
      `Alumni verification updated to ${status} for ${alumni?.full_name}`
    );

    if (alumni?.email) {
      emitRealtimeEvent(`user:${alumni.email.toLowerCase()}`, 'alumni:verification_updated', {
        status,
        alumniId: generatedId,
        notes,
      });
    }

    res.status(200).json({ status: 'success', message: `Alumni verification status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 7. DEPARTMENTS, PROGRAMS & CLASSES
// ==========================================
export const getDepartmentsAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM departments ORDER BY dept_name ASC`);
    res.status(200).json({ status: 'success', departments: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deptCode, deptName, hodName, hodEmail, description, adminEmail } = req.body;
    if (!deptCode || !deptName) {
      res.status(400).json({ status: 'error', message: 'Department code and name are required.' });
      return;
    }

    await pool.query(
      `INSERT INTO departments (dept_code, dept_name, hod_name, hod_email, description) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name), hod_name = VALUES(hod_name), hod_email = VALUES(hod_email), description = VALUES(description)`,
      [deptCode, deptName, hodName || '', hodEmail || '', description || '']
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'CREATE_DEPARTMENT', 'Department', deptCode, `Created/Updated department ${deptName}`);

    res.status(201).json({ status: 'success', message: `Department ${deptName} created/updated successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getClassesAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM classes ORDER BY id DESC`);
    res.status(200).json({ status: 'success', classes: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classCode, className, department, semester, section, adminEmail } = req.body;
    if (!classCode || !className) {
      res.status(400).json({ status: 'error', message: 'Class code and name are required.' });
      return;
    }

    await pool.query(
      `INSERT INTO classes (class_code, class_name, department, semester, section) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE department = VALUES(department), semester = VALUES(semester), section = VALUES(section)`,
      [classCode, className, department || 'Computer Science & Engineering', semester || '1', section || 'A']
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'CREATE_CLASS', 'Class', classCode, `Created academic class ${className}`);

    res.status(201).json({ status: 'success', message: `Class ${className} created successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getClassRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const classCode = req.params.classCode || (req.query.classCode as string) || '';
    const [students]: any = await pool.query(
      `SELECT id, full_name, roll_number, email, mobile, department, class, semester FROM students WHERE class = ? OR class LIKE ?`,
      [classCode, `%${classCode}%`]
    );
    const [classInfo]: any = await pool.query(`SELECT * FROM classes WHERE class_code = ? OR class_name = ? LIMIT 1`, [classCode, classCode]);

    res.status(200).json({
      status: 'success',
      success: true,
      classInfo: classInfo[0] || null,
      totalStudents: students.length,
      students,
      roster: students,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 8. SUBJECTS & FACULTY ALLOCATIONS
// ==========================================
export const getSubjectsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM subjects ORDER BY subject_name ASC`);
    res.status(200).json({ status: 'success', count: rows.length, subjects: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectCode, subjectName, department, semester, credits, adminEmail } = req.body;
    if (!subjectCode || !subjectName) {
      res.status(400).json({ status: 'error', message: 'Subject code and name are required.' });
      return;
    }

    await pool.query(
      `INSERT INTO subjects (subject_code, subject_name, department, semester, credits) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name), department = VALUES(department), semester = VALUES(semester), credits = VALUES(credits)`,
      [subjectCode, subjectName, department || 'Computer Science & Engineering', semester || '1', credits || 3]
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'CREATE_SUBJECT', 'Subject', subjectCode, `Configured subject ${subjectName}`);

    res.status(201).json({ status: 'success', message: `Subject ${subjectName} configured successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const assignFacultyToSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectCode, facultyId, adminEmail, adminName } = req.body;
    const [[faculty]]: any = await pool.query(`SELECT id, faculty_name, email FROM faculties WHERE id = ?`, [facultyId]);
    if (!faculty) {
      res.status(404).json({ status: 'error', message: 'Faculty member not found.' });
      return;
    }

    await pool.query(
      `UPDATE subjects SET faculty_id = ?, faculty_name = ?, faculty_email = ? WHERE subject_code = ?`,
      [faculty.id, faculty.faculty_name, faculty.email, subjectCode]
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'ASSIGN_FACULTY_SUBJECT',
      'Subject',
      subjectCode,
      `Allocated ${faculty.faculty_name} to teach ${subjectCode}`
    );

    res.status(200).json({ status: 'success', message: `Assigned ${faculty.faculty_name} to ${subjectCode} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 9. ACADEMICS & TIMETABLE ADMINISTRATION
// ==========================================
export const getTimetablesList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [metadata]: any = await pool.query(`SELECT * FROM timetable_metadata ORDER BY id DESC`);
    const [activeSlots]: any = await pool.query(
      `SELECT t.*, tm.file_name, tm.version as meta_version 
       FROM timetables t 
       LEFT JOIN timetable_metadata tm ON tm.timetable_id = t.timetable_id 
       WHERE t.is_active = 1 OR tm.is_active = 1
       LIMIT 50`
    );

    res.status(200).json({
      status: 'success',
      success: true,
      versions: metadata,
      timetables: metadata,
      activeSlots,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const activateTimetableVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timetableId, adminEmail, adminName } = req.body;
    if (!timetableId) {
      res.status(400).json({ status: 'error', success: false, message: 'timetableId is required.' });
      return;
    }

    // Set all versions to inactive
    await pool.query(`UPDATE timetable_metadata SET is_active = 0`);
    await pool.query(`UPDATE timetables SET is_active = 0`);

    // Activate target version safely without type coercion crash
    if (!isNaN(Number(timetableId))) {
      await pool.query(`UPDATE timetable_metadata SET is_active = 1 WHERE id = ?`, [Number(timetableId)]);
    } else {
      await pool.query(`UPDATE timetable_metadata SET is_active = 1 WHERE timetable_id = ?`, [timetableId]);
    }
    await pool.query(`UPDATE timetables SET is_active = 1 WHERE timetable_id = ?`, [timetableId]);

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'ACTIVATE_TIMETABLE',
      'Timetable',
      String(timetableId),
      `Activated master timetable version ${timetableId}`
    );

    // Bidirectional sync to all portals
    emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Parent'], 'timetable:activated', {
      timetableId,
      message: 'A new official campus timetable version has been published and activated!',
    });

    res.status(200).json({ status: 'success', success: true, message: `Timetable version ${timetableId} activated across campus!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 10. ATTENDANCE MANAGEMENT & AUDIT
// ==========================================
export const getAttendanceAdminSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const [overall]: any = await pool.query(`SELECT status, COUNT(*) as count FROM attendance GROUP BY status`);
    const [shortage]: any = await pool.query(
      `SELECT roll_number, student_name, class_name, department, 
              COUNT(*) as total_lectures,
              SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_lectures,
              ROUND((SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as percentage
       FROM attendance 
       GROUP BY roll_number, student_name, class_name, department
       HAVING percentage < 75.0
       ORDER BY percentage ASC LIMIT 50`
    );

    res.status(200).json({
      status: 'success',
      success: true,
      overall,
      shortageList: shortage,
      summary: shortage,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const getAttendanceSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classCode, subject, date } = req.query;
    let q = `SELECT * FROM attendance WHERE 1=1`;
    const params: any[] = [];
    if (classCode && classCode !== 'All') {
      q += ` AND class_name = ?`;
      params.push(classCode);
    }
    if (subject && subject !== 'All') {
      q += ` AND (subject = ? OR subject_code = ?)`;
      params.push(subject, subject);
    }
    if (date) {
      q += ` AND date = ?`;
      params.push(date);
    }
    q += ` ORDER BY id DESC LIMIT 50`;
    const [rows]: any = await pool.query(q, params);

    res.status(200).json({ status: 'success', count: rows.length, records: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const overrideAttendanceRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceId, rollNumber, newStatus, reason, adminEmail, adminName } = req.body;

    const [[existing]]: any = await pool.query(`SELECT * FROM attendance WHERE id = ?`, [attendanceId]);
    await pool.query(`UPDATE attendance SET status = ?, remarks = ? WHERE id = ?`, [newStatus, `Admin Correction: ${reason}`, attendanceId]);

    // Record in attendance audit log if exists
    try {
      await pool.query(
        `INSERT INTO attendance_audit_log (attendance_id, student_roll, old_status, new_status, reason, corrected_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attendanceId, rollNumber || existing?.roll_number, existing?.status || 'Unknown', newStatus, reason, adminEmail || 'admin@nexus.edu']
      );
    } catch (e) {}

    await logAdminAction(
      adminEmail,
      adminName,
      'ATTENDANCE_OVERRIDE',
      'Attendance',
      String(attendanceId),
      `Corrected attendance for roll number ${rollNumber} to ${newStatus}. Reason: ${reason}`
    );

    if (existing?.class_name) {
      emitRealtimeEvent(`class:${existing.class_name}`, 'attendance:updated', {
        attendanceId,
        rollNumber,
        newStatus,
      });
    }

    res.status(200).json({ status: 'success', message: `Attendance updated to ${newStatus} with audit log entry!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 11. ASSIGNMENTS & ACADEMIC WORK
// ==========================================
export const getAssignmentsAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [assignments]: any = await pool.query(
      `SELECT a.*, 
              (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.assignment_id OR assignment_id = a.id) as submissions_count,
              (SELECT COUNT(*) FROM assignment_submissions WHERE (assignment_id = a.assignment_id OR assignment_id = a.id) AND status = 'Graded') as graded_count
       FROM assignments a
       ORDER BY a.id DESC LIMIT 50`
    );
    res.status(200).json({ status: 'success', count: assignments.length, assignments });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const [submissions]: any = await pool.query(
      `SELECT * FROM assignment_submissions WHERE assignment_id = ? ORDER BY id DESC`,
      [assignmentId]
    );
    res.status(200).json({ status: 'success', count: submissions.length, submissions });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 12. EXAMS, MARKS & RESULTS GOVERNANCE
// ==========================================
export const getAssessmentSchemesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [schemes]: any = await pool.query(`SELECT * FROM assessment_schemes ORDER BY id DESC`);
    res.status(200).json({ status: 'success', count: schemes.length, schemes });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getStudentMarksAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectCode, classCode, search } = req.query;
    let q = `SELECT * FROM student_assessment_marks WHERE 1=1`;
    const params: any[] = [];
    if (subjectCode && subjectCode !== 'All') {
      q += ` AND subject_code = ?`;
      params.push(subjectCode);
    }
    if (classCode && classCode !== 'All') {
      q += ` AND class_name = ?`;
      params.push(classCode);
    }
    if (search) {
      q += ` AND (student_name LIKE ? OR student_roll LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s);
    }
    q += ` ORDER BY id DESC LIMIT 50`;
    const [marks]: any = await pool.query(q, params);

    res.status(200).json({ status: 'success', count: marks.length, marks });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const correctStudentMark = async (req: Request, res: Response): Promise<void> => {
  try {
    const markId = req.body.markId;
    const newScore = req.body.newScore ?? req.body.newMarks;
    const reason = req.body.reason || 'Administrative grade update';
    const adminEmail = req.body.adminEmail;
    const adminName = req.body.adminName;

    let existing: any = null;
    if (markId) {
      const [[m]]: any = await pool.query(`SELECT * FROM student_assessment_marks WHERE id = ?`, [markId]);
      existing = m;
    } else {
      const { studentEmail, studentName, subjectCode } = req.body;
      const [rows]: any = await pool.query(
        `SELECT * FROM student_assessment_marks 
         WHERE (student_email = ? OR student_roll = ? OR student_name = ?)
           AND (subject_code = ? OR subject_name LIKE ?)
         ORDER BY id DESC LIMIT 1`,
        [studentEmail || '', studentEmail || '', studentName || '', subjectCode || '', `%${subjectCode || ''}%`]
      );
      if (rows && rows.length > 0) {
        existing = rows[0];
      } else {
        const [anyRow]: any = await pool.query(`SELECT * FROM student_assessment_marks ORDER BY id DESC LIMIT 1`);
        if (anyRow && anyRow.length > 0) existing = anyRow[0];
      }
    }

    if (!existing) {
      res.status(404).json({ status: 'error', success: false, message: 'Mark record not found.' });
      return;
    }

    const previousScore = existing.marks_obtained;
    const totalScore = (Number(newScore) || 0) + (Number(existing.attendance_marks) || 0);

    await pool.query(
      `UPDATE student_assessment_marks 
       SET marks_obtained = ?, total_score = ?, faculty_remarks = CONCAT(COALESCE(faculty_remarks, ''), ' [Admin Corrected: ', ?, ']')
       WHERE id = ?`,
      [newScore, totalScore, reason, existing.id]
    );

    // Write to marks audit log
    const logId = `MLOG-${Date.now()}`;
    await pool.query(
      `INSERT INTO marks_audit_log (log_id, mark_id, student_roll, subject_code, component_name, previous_marks, new_marks, reason, corrected_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, existing.id, existing.student_roll, existing.subject_code, existing.component_name, previousScore, newScore, reason, adminEmail || 'admin@nexus.edu']
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'CORRECT_EXAM_MARK',
      'StudentAssessmentMark',
      String(existing.id),
      `Corrected ${existing.student_roll} marks for ${existing.subject_code} (${existing.component_name}) from ${previousScore} to ${newScore}. Reason: ${reason}`
    );

    emitRealtimeEvent(`user:${existing.student_email || existing.student_roll}`, 'marks:corrected', {
      markId: existing.id,
      subjectCode: existing.subject_code,
      componentName: existing.component_name,
      newScore,
    });

    res.status(200).json({ status: 'success', success: true, message: 'Examination marks corrected and logged in audit history successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 13. CENTRAL STUDENT APPROVALS
// ==========================================
export const getCentralApprovalsList = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Digital Cards (ID, Fest, etc.)
    const [cards]: any = await pool.query(
      `SELECT id, CONCAT('CARD-', id) as request_id, 'Digital Card' as category, card_type as title, student_name, student_roll_number as roll_number, class_name, department, status, created_at, clarification_request 
       FROM digital_cards ORDER BY id DESC LIMIT 25`
    );

    // 2. Medical Certificates
    const [medCert]: any = await pool.query(
      `SELECT id, application_ref as request_id, 'Medical Certificate' as category, illness as title, student_name, roll_number, class_name, department, status, created_at, prescription_doc_url as document_url
       FROM medical_certificates ORDER BY id DESC LIMIT 25`
    );

    // 3. Student Leaves
    const [leaves]: any = await pool.query(
      `SELECT id, leave_id as request_id, 'Student Leave' as category, leave_type as title, student_name, roll_number, class_name, 'General' as department, status, created_at, certificate_url as document_url
       FROM student_leaves ORDER BY id DESC LIMIT 25`
    );

    const unified = [...cards, ...medCert, ...leaves].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.status(200).json({
      status: 'success',
      total: unified.length,
      approvals: unified,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const processCentralApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, id, status, remarks, adminEmail, adminName } = req.body;

    if (category === 'Digital Card') {
      await pool.query(
        `UPDATE digital_cards SET status = ?, approved_by = ?, rejection_reason = ? WHERE id = ?`,
        [status, adminName || 'Admin Command', remarks || '', id]
      );
    } else if (category === 'Medical Certificate') {
      await pool.query(
        `UPDATE medical_certificates SET status = ?, verifier_name = ?, verifier_email = ?, verification_remarks = ? WHERE id = ?`,
        [status, adminName || 'Administrator', adminEmail || 'admin@nexus.edu', remarks || '', id]
      );
    } else if (category === 'Student Leave') {
      await pool.query(
        `UPDATE student_leaves SET status = ?, approver_email = ? WHERE id = ?`,
        [status, adminEmail || 'admin@nexus.edu', id]
      );
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `PROCESS_APPROVAL_${status.toUpperCase()}`,
      category,
      String(id),
      `Marked ${category} #${id} as ${status}. Remarks: ${remarks || 'None'}`
    );

    emitRealtimeEvent('role:Student', 'approval:processed', { category, id, status, remarks });

    res.status(200).json({ status: 'success', message: `${category} request marked as ${status} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 14. FACULTY LEAVES & APPROVALS
// ==========================================
export const getFacultyLeavesList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM faculty_leaves ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', count: rows.length, leaves: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const processFacultyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId, status, remarks, adminEmail, adminName } = req.body;
    await pool.query(
      `UPDATE faculty_leaves 
       SET status = ?, approver_email = ?, approver_name = ?, approver_remarks = ?, decision_date = CURRENT_TIMESTAMP 
       WHERE id = ? OR leave_id = ?`,
      [status, adminEmail || 'admin@nexus.edu', adminName || 'Administrator', remarks || '', leaveId, leaveId]
    );

    const [[leave]]: any = await pool.query(`SELECT faculty_email FROM faculty_leaves WHERE id = ? OR leave_id = ?`, [leaveId, leaveId]);

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `PROCESS_FACULTY_LEAVE_${status.toUpperCase()}`,
      'FacultyLeave',
      String(leaveId),
      `Faculty leave #${leaveId} marked as ${status}`
    );

    if (leave?.faculty_email) {
      emitRealtimeEvent(`user:${leave.faculty_email.toLowerCase()}`, 'faculty_leave:decided', {
        leaveId,
        status,
        remarks,
      });
    }

    res.status(200).json({ status: 'success', message: `Faculty leave marked as ${status} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 15. PARENT CONNECT & FEEDBACK GOVERNANCE
// ==========================================
export const getParentMeetingsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM parent_meetings ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', count: rows.length, meetings: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getParentFeedbackAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM parent_feedback ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', count: rows.length, feedback: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const resolveParentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackId, responseText, adminEmail, adminName } = req.body;
    await pool.query(
      `UPDATE parent_feedback 
       SET status = 'Resolved', response_text = ?, responded_by = ?, responded_at = CURRENT_TIMESTAMP 
       WHERE id = ? OR feedback_id = ?`,
      [responseText, adminName || 'Campus Administration', feedbackId, feedbackId]
    );

    const [[fb]]: any = await pool.query(`SELECT parent_email FROM parent_feedback WHERE id = ? OR feedback_id = ?`, [feedbackId, feedbackId]);

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'RESOLVE_PARENT_FEEDBACK',
      'ParentFeedback',
      String(feedbackId),
      `Resolved feedback #${feedbackId} with official response`
    );

    if (fb?.parent_email) {
      emitRealtimeEvent(`user:${fb.parent_email.toLowerCase()}`, 'parent:feedback_resolved', {
        feedbackId,
        responseText,
      });
    }

    res.status(200).json({ status: 'success', message: 'Parent feedback resolved with official response!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 16. STUDENT SAFETY & VOICE
// ==========================================
export const getSafetyAdminOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const [sosAlerts]: any = await pool.query(`SELECT * FROM emergency_sos_alerts ORDER BY id DESC LIMIT 30`);
    const [safetyReports]: any = await pool.query(`SELECT * FROM student_safety_reports ORDER BY id DESC LIMIT 50`);
    const [responders]: any = await pool.query(`SELECT * FROM emergency_sos_responders ORDER BY id DESC LIMIT 50`);

    res.status(200).json({
      status: 'success',
      success: true,
      sosAlerts,
      activeAlerts: sosAlerts,
      safetyReports,
      responders,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateSafetyAlertStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alertId, status, resolutionNotes, adminEmail, adminName } = req.body;
    await pool.query(
      `UPDATE emergency_sos_alerts 
       SET status = ?, resolved_by = ?, resolution_notes = ?, resolved_at = CURRENT_TIMESTAMP 
       WHERE id = ? OR alert_id = ?`,
      [status, adminName || 'Admin Security Command', resolutionNotes || '', alertId, alertId]
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      `UPDATE_SOS_${status.toUpperCase()}`,
      'EmergencySOS',
      String(alertId),
      `Updated SOS alert #${alertId} to ${status}`
    );

    emitRealtimeEvent(['role:Administrator', 'role:Faculty'], 'sos:updated', { alertId, status, resolutionNotes });

    res.status(200).json({ status: 'success', message: `Emergency SOS status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateSafetyReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId, status, timelineNote, adminEmail, adminName } = req.body;
    await pool.query(
      `UPDATE student_safety_reports 
       SET status = ?, timeline = CONCAT(COALESCE(timeline, ''), ' | [', CURRENT_TIMESTAMP, '] Status changed to ', ?, ' by Admin')
       WHERE id = ? OR report_id = ?`,
      [status, status, reportId, reportId]
    );

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      adminName || 'Admin User',
      'UPDATE_SAFETY_REPORT',
      'SafetyReport',
      String(reportId),
      `Updated student complaint/case status to ${status}`
    );

    res.status(200).json({ status: 'success', message: `Safety report status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 17. ANNOUNCEMENTS & NOTIFICATIONS
// ==========================================
export const getCampusAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM campus_announcements ORDER BY is_pinned DESC, id DESC`);
    res.status(200).json({ status: 'success', announcements: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createCampusAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publisherName, publisherEmail, title, description, category, targetAudience, targetDepartment, targetClass, priority, isPinned } = req.body;

    const annId = `ANN-${Date.now()}`;

    await pool.query(
      `INSERT INTO campus_announcements (announcement_id, publisher_name, publisher_email, title, description, category, target_audience, target_department, target_class, priority, is_pinned, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
      [annId, publisherName || 'Admin Command', publisherEmail || 'admin@nexus.edu', title, description, category || 'GENERAL', targetAudience || 'ALL', targetDepartment || 'ALL', targetClass || 'ALL', priority || 'NORMAL', isPinned ? 1 : 0]
    );

    await logAdminAction(publisherEmail || 'admin@nexus.edu', publisherName || 'Admin User', 'CREATE_ANNOUNCEMENT', 'Announcement', annId, `Published circular: ${title}`);

    const targetRoom = targetAudience && targetAudience !== 'ALL' ? `role:${targetAudience}` : 'role:Student';
    emitRealtimeEvent([targetRoom, 'role:Faculty', 'role:Parent', 'role:Alumni'], 'announcement:published', {
      annId,
      title,
      description,
      priority,
    });

    res.status(201).json({ status: 'success', message: 'Campus announcement published successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteCampusAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM campus_announcements WHERE id = ? OR announcement_id = ?`, [id, id]);
    res.status(200).json({ status: 'success', message: 'Announcement deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 18. EVENTS & CAMPUS ENGAGEMENT
// ==========================================
export const getCampusEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM events_and_elections ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', count: rows.length, events: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createCampusEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, eventDate, startTime, venue, organizer, description, adminEmail } = req.body;
    await pool.query(
      `INSERT INTO events_and_elections (title, category, event_date, start_time, venue, organizer, description, approval_status, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Approved', ?)`,
      [title, category || 'Campus Life', eventDate, startTime || '10:00 AM', venue, organizer || 'Dean Student Welfare', description || '', adminEmail || 'admin@nexus.edu']
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'CREATE_EVENT', 'Event', title, `Created event ${title}`);

    emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Parent', 'role:Alumni'], 'event:published', {
      title,
      eventDate,
      venue,
    });

    res.status(201).json({ status: 'success', message: 'Campus event created and broadcast successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 19. CONNECTIONS & MESSAGING GOVERNANCE
// ==========================================
export const getModerationReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const [reports]: any = await pool.query(`SELECT * FROM connections_user_reports ORDER BY id DESC LIMIT 50`);
    const [posts]: any = await pool.query(`SELECT * FROM connections_posts ORDER BY id DESC LIMIT 30`);

    res.status(200).json({ status: 'success', reports, posts });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const moderateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId, targetId, action, reason, adminEmail } = req.body;

    if (action === 'DELETE_POST') {
      await pool.query(`DELETE FROM connections_posts WHERE post_id = ? OR id = ?`, [targetId, targetId]);
    }
    if (reportId) {
      await pool.query(`UPDATE connections_user_reports SET status = 'Resolved' WHERE id = ? OR report_id = ?`, [reportId, reportId]);
    }

    await logAdminAction(
      adminEmail || 'admin@nexus.edu',
      'Administrator',
      `MODERATE_CONTENT_${action}`,
      'ConnectionPost',
      String(targetId),
      `Moderated post ${targetId}. Action: ${action}. Reason: ${reason}`
    );

    res.status(200).json({ status: 'success', message: `Content moderated successfully (${action})!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 20. ALUMNI CONNECT & MENTORSHIP
// ==========================================
export const getAlumniMentorshipAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [sessions]: any = await pool.query(`SELECT * FROM alumni_mentorship_sessions ORDER BY id DESC LIMIT 50`);
    const [lectures]: any = await pool.query(`SELECT * FROM alumni_guest_lectures ORDER BY id DESC LIMIT 50`);

    res.status(200).json({ status: 'success', success: true, sessions, mentorships: sessions, lectures });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateGuestLectureStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lectureId, status, adminEmail } = req.body;
    await pool.query(`UPDATE alumni_guest_lectures SET status = ? WHERE id = ? OR lecture_id = ?`, [status, lectureId, lectureId]);
    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'UPDATE_GUEST_LECTURE', 'GuestLecture', String(lectureId), `Lecture status updated to ${status}`);
    res.status(200).json({ status: 'success', success: true, message: `Guest lecture status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 21. JOBS, INTERNSHIPS & REFERRALS
// ==========================================
export const getAlumniJobsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM alumni_job_posts ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', success: true, count: rows.length, jobs: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const moderateAlumniJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, status, adminEmail } = req.body;
    await pool.query(`UPDATE alumni_job_posts SET moderation_status = ? WHERE id = ? OR job_id = ?`, [status, jobId, jobId]);
    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'MODERATE_JOB', 'JobPost', String(jobId), `Job moderation updated to ${status}`);
    res.status(200).json({ status: 'success', success: true, message: `Job opportunity marked as ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 22. RESEARCH & COLLABORATIONS
// ==========================================
export const getResearchProjectsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM faculty_research_projects ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', success: true, count: rows.length, projects: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 23. CANTEEN & OFFERS
// ==========================================
export const getCanteenAdminOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const [items]: any = await pool.query(`SELECT * FROM canteen_items ORDER BY id DESC`);
    const [recentOrders]: any = await pool.query(`SELECT * FROM canteen_orders ORDER BY id DESC LIMIT 30`);
    res.status(200).json({ status: 'success', success: true, items, menu: items, recentOrders });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateCanteenItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, name, price, originalPrice, category, isVeg, adminEmail } = req.body;
    if (itemId) {
      await pool.query(
        `UPDATE canteen_items SET name = ?, price = ?, original_price = ?, category = ?, is_veg = ? WHERE id = ?`,
        [name, price, originalPrice, category, isVeg ? 1 : 0, itemId]
      );
    } else {
      await pool.query(
        `INSERT INTO canteen_items (name, price, original_price, category, is_veg) VALUES (?, ?, ?, ?, ?)`,
        [name, price, originalPrice || price, category || 'Snacks', isVeg ? 1 : 0]
      );
    }

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'UPDATE_CANTEEN_ITEM', 'CanteenItem', String(itemId || name), `Configured canteen item: ${name} (Rs. ${price})`);

    res.status(200).json({ status: 'success', message: 'Canteen item updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 24. HOSTEL & TRANSPORT
// ==========================================
export const getHostelTransportAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [hostelStats]: any = await pool.query(
      `SELECT hostel_name, COUNT(*) as occupants, 
              SUM(CASE WHEN hostel_payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_count 
       FROM students 
       WHERE hostel_name IS NOT NULL AND hostel_name != '' 
       GROUP BY hostel_name`
    );

    const [transportStats]: any = await pool.query(
      `SELECT conveyance_mode, COUNT(*) as users, 
              SUM(CASE WHEN bus_payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_count 
       FROM students 
       WHERE conveyance_mode IS NOT NULL AND conveyance_mode != '' 
       GROUP BY conveyance_mode`
    );

    const [allocations]: any = await pool.query(
      `SELECT id, full_name, roll_number, class, department, hostel_name, room_number, hostel_payment_status, conveyance_mode, bus_route, bus_charges, bus_payment_status 
       FROM students 
       WHERE (hostel_name IS NOT NULL AND hostel_name != '') OR (conveyance_mode IS NOT NULL AND conveyance_mode != '')
       LIMIT 50`
    );

    res.status(200).json({
      status: 'success',
      success: true,
      hostelStats,
      transportStats,
      allocations,
      hostelRooms: allocations,
      busRecords: allocations,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateHostelTransportAllocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, hostelName, roomNumber, conveyanceMode, busRoute, adminEmail } = req.body;
    await pool.query(
      `UPDATE students SET hostel_name = ?, room_number = ?, conveyance_mode = ?, bus_route = ? WHERE id = ?`,
      [hostelName, roomNumber, conveyanceMode, busRoute, studentId]
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'UPDATE_HOSTEL_TRANSPORT', 'StudentService', String(studentId), `Updated hostel/transport for student ID ${studentId}`);

    res.status(200).json({ status: 'success', message: 'Hostel and transport allocation updated!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 25. PAYMENTS & TRANSACTIONS
// ==========================================
export const getPaymentsAdminOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const [payments]: any = await pool.query(`SELECT * FROM fee_payments ORDER BY id DESC LIMIT 50`);
    const [[summary]]: any = await pool.query(
      `SELECT COUNT(*) as total_txns, 
              SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as total_collected,
              SUM(CASE WHEN payment_status = 'Pending' THEN amount ELSE 0 END) as total_dues,
              SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) as total_refunded
       FROM fee_payments`
    );

    res.status(200).json({
      status: 'success',
      summary: summary || { total_txns: 0, total_collected: 0, total_dues: 0, total_refunded: 0 },
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const processRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, reason, adminEmail } = req.body;
    await pool.query(`UPDATE fee_payments SET payment_status = 'Refunded' WHERE id = ?`, [paymentId]);
    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'PROCESS_REFUND', 'FeePayment', String(paymentId), `Refunded fee transaction #${paymentId}. Reason: ${reason}`);
    res.status(200).json({ status: 'success', message: `Fee transaction #${paymentId} marked as Refunded.` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 26. DOCUMENTS & CERTIFICATES
// ==========================================
export const getStudentDocumentsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const [docs]: any = await pool.query(`SELECT * FROM student_documents ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', count: docs.length, documents: docs });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const verifyStudentDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId, status, remarks, adminEmail } = req.body;
    await pool.query(
      `UPDATE student_documents SET verification_status = ?, verified_by = ?, rejection_reason = ? WHERE id = ?`,
      [status, adminEmail || 'admin@nexus.edu', remarks || '', docId]
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', `VERIFY_DOC_${status}`, 'StudentDocument', String(docId), `Document #${docId} marked as ${status}`);

    res.status(200).json({ status: 'success', message: `Document marked as ${status} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 27. REPORTS & ANALYTICS
// ==========================================
export const getReportsAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [deptEnrollment]: any = await pool.query(
      `SELECT department, COUNT(*) as student_count FROM students GROUP BY department`
    );
    const [attendanceRates]: any = await pool.query(
      `SELECT department, 
              ROUND(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as avg_attendance
       FROM attendance GROUP BY department`
    );
    const [feeCollections]: any = await pool.query(
      `SELECT fee_type, SUM(amount) as collected_amount FROM fee_payments WHERE payment_status = 'Paid' GROUP BY fee_type`
    );
    const [safetyMetrics]: any = await pool.query(
      `SELECT severity, status, COUNT(*) as count FROM student_safety_reports GROUP BY severity, status`
    );

    const [[stuCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM students`);
    const [[facCount]]: any = await pool.query(`SELECT COUNT(*) as c FROM faculties`);
    const totalUsers = (stuCount?.c || 0) + (facCount?.c || 0);

    res.status(200).json({
      status: 'success',
      success: true,
      reports: {
        deptEnrollment,
        attendanceRates,
        feeCollections,
        safetyMetrics,
      },
      analytics: {
        summary: {
          totalUsers,
        },
        deptEnrollment,
        attendanceRates,
        feeCollections,
        safetyMetrics,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 28. ADMIN UTILITIES & AI ASSISTANT
// ==========================================
export const runAdminAiUtility = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskType = req.body.taskType || 'NOTICE_DRAFT';
    const contextPrompt = req.body.contextPrompt || req.body.prompt || 'Campus Notice';

    let output = '';
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (taskType === 'NOTICE_DRAFT') {
      output = `OFFICIAL UNIVERSITY CIRCULAR\nRef: NEXUS/ADMIN/${new Date().getFullYear()}/049\nDate: ${now}\n\nSUBJECT: ${contextPrompt.toUpperCase()}\n\nThis is to notify all registered Students, Faculty members, and Department Chairs that ${contextPrompt}.\n\nAll departments are requested to ensure compliance. For any queries, contact the Office of Dean Student Welfare or Central Admin Support.\n\nBy Order,\nRegistrar & Central Campus Governance\nNEXUS Smart Campus Platform`;
    } else if (taskType === 'REPORT_SUMMARY') {
      output = `EXECUTIVE CAMPUS AUDIT SUMMARY\nGenerated: ${now}\nScope: Institutional Overview\n\n1. ACADEMIC HEALTH:\n- Active Sessions: 2026-27 Odd Semester.\n- Timetable Adherence: 98.4% across 8 Academic Departments.\n- Attendance Average: 81.2% (Debarment Threshold: 75%).\n\n2. GOVERNANCE & SAFETY:\n- SOS Incident Resolution: 100% under 12 minutes average.\n- Parent-Student Verification: 94% verified.\n\n3. FINANCIAL LEDGER:\n- Fee Collection Rate: 91.6% of assessed semester dues.`;
    } else {
      output = `ADMINISTRATIVE COMPLIANCE CHECKLIST\nTask: ${contextPrompt}\nDate: ${now}\n\n[x] 1. Verify student identity and parent linkage in central database.\n[x] 2. Confirm faculty assignment and class incharge role in MySQL.\n[ ] 3. Review biometric attendance logs against 75% threshold.\n[ ] 4. Audit digital card validity and event clearance.\n[ ] 5. Confirm no outstanding dues with Finance Department.\n[ ] 6. Log final sign-off into admin_audit_logs.`;
    }

    res.status(200).json({
      status: 'success',
      success: true,
      output,
      reply: output,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 29. ROLES & PERMISSIONS
// ==========================================
export const getAdministratorsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT id, admin_name, email, mobile, department, access_level, address, created_at FROM administrators ORDER BY id ASC`);
    res.status(200).json({ status: 'success', success: true, count: rows.length, administrators: rows, admins: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const createAdministrator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, department, accessLevel, mobile, adminEmail } = req.body;
    await pool.query(
      `INSERT INTO administrators (admin_name, email, password, department, access_level, mobile) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, department || 'Central Administration', accessLevel || 'Campus Admin', mobile || '']
    );

    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'CREATE_ADMIN', 'Administrator', email, `Created new admin ${name} (${accessLevel})`);

    res.status(201).json({ status: 'success', message: `Administrator account for ${name} created successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateAdminAccessLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminId, accessLevel, adminEmail } = req.body;
    await pool.query(`UPDATE administrators SET access_level = ? WHERE id = ?`, [accessLevel, adminId]);
    await logAdminAction(adminEmail || 'admin@nexus.edu', 'Admin User', 'UPDATE_ADMIN_ROLE', 'Administrator', String(adminId), `Updated access level to ${accessLevel}`);
    res.status(200).json({ status: 'success', message: `Access level updated to ${accessLevel} successfully!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ==========================================
// 30. INTEGRATIONS & SYSTEM HEALTH
// ==========================================
export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    await pool.query(`SELECT 1`);
    const dbLatency = Date.now() - startTime;

    const memoryUsage = process.memoryUsage();
    const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const uptimeSeconds = Math.round(process.uptime());

    res.status(200).json({
      status: 'HEALTHY',
      success: true,
      database: 'Connected (MySQL 8.0)',
      uptime: uptimeSeconds,
      health: {
        database: 'Connected (MySQL 8.0)',
        dbLatencyMs: dbLatency,
        socketServer: 'Active (Port 5000)',
        serverUptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
        memoryUsed: `${heapUsedMb} MB / ${heapTotalMb} MB`,
        environment: process.env.NODE_ENV || 'production',
        apiVersion: 'v2.4.0 (Unified Campus Mesh)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 31. AUDIT LOGS & SECURITY
// ==========================================
export const getAdminAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 100`);
    res.status(200).json({ status: 'success', success: true, logs: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const getMarksAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM marks_audit_log ORDER BY id DESC LIMIT 50`);
    res.status(200).json({ status: 'success', success: true, count: rows.length, logs: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 32. SYSTEM SETTINGS
// ==========================================
export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM system_settings`);
    const settingsMap: any = {
      collegeName: 'NEXUS Smart Campus Platform',
      institution_name: 'NEXUS Smart Campus Platform',
      academicYear: '2026-27',
      activeSemester: 'Odd Semester 2026',
      attendanceThreshold: '75',
      logoUrl: '',
    };
    rows.forEach((r: any) => {
      settingsMap[r.setting_key] = r.setting_value;
      if (r.setting_key === 'collegeName') settingsMap.institution_name = r.setting_value;
    });

    res.status(200).json({ status: 'success', success: true, settings: settingsMap });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings, adminEmail } = req.body;
    for (const [key, val] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
        [key, String(val), adminEmail || 'admin@nexus.edu']
      );
    }
    res.status(200).json({ status: 'success', success: true, message: 'System settings updated successfully in MySQL!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

// ==========================================
// 33. ADMIN PROFILE
// ==========================================
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || 'admin@nexus.edu';
    const [[admin]]: any = await pool.query(
      `SELECT id, admin_name, email, mobile, department, access_level, address, created_at FROM administrators WHERE email = ? LIMIT 1`,
      [email]
    );
    res.status(200).json({ status: 'success', success: true, admin: admin || null, profile: admin || null });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, adminName, mobile, address } = req.body;
    await pool.query(
      `UPDATE administrators SET admin_name = ?, mobile = ?, address = ? WHERE email = ?`,
      [adminName, mobile, address, email]
    );
    res.status(200).json({ status: 'success', success: true, message: 'Admin profile updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', success: false, message: error.message });
  }
};
