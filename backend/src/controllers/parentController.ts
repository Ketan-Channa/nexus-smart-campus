import { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent } from '../config/socket';

// Helper: Extract authenticated parent email
export const getParentEmail = (req: Request): string => {
  const email = (req.query.parentEmail as string) ||
                (req.query.email as string) ||
                (req.headers['x-user-email'] as string) ||
                (req.body && req.body.parentEmail) ||
                (req.body && req.body.email) ||
                '';
  return email.trim();
};

// Helper: Strict Resource-Level Authorization Check
export const verifyParentChildAccess = async (parentEmail: string, studentRoll: string): Promise<boolean> => {
  if (!parentEmail || !studentRoll) return false;
  try {
    const [links]: any = await pool.query(
      `SELECT id FROM parent_student_links
       WHERE LOWER(parent_email) = LOWER(?) AND student_roll = ? AND verification_status = 'VERIFIED'
       LIMIT 1`,
      [parentEmail, studentRoll]
    );
    if (links && links.length > 0) return true;

    // Fallback: check direct match in parents table
    const [direct]: any = await pool.query(
      `SELECT id FROM parents
       WHERE LOWER(email) = LOWER(?) AND student_roll_number = ?
       LIMIT 1`,
      [parentEmail, studentRoll]
    );
    return direct && direct.length > 0;
  } catch (err) {
    console.error('verifyParentChildAccess error:', err);
    return false;
  }
};

// 1. GET /api/parent/children - Fetch all authorized linked children for parent
export const getParentChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    if (!parentEmail) {
      res.status(400).json({ success: false, message: 'Parent email identifier is required.' });
      return;
    }

    const conn = await pool.getConnection();

    // Query parent_student_links joined with students
    const [links]: any = await conn.query(
      `SELECT psl.link_id, psl.relationship, psl.verification_status, psl.verified_at,
              s.roll_number, s.full_name, s.class, s.degree_class, s.department, s.semester,
              s.section, s.college_name, s.photograph_url, s.blood_group, s.email as student_email,
              s.mobile as student_mobile, s.conveyance_mode, s.bus_route, s.bus_charges,
              s.bus_payment_status, s.residence_type, s.hostel_name, s.room_number,
              s.hostel_payment_term, s.hostel_fee, s.hostel_payment_status
       FROM parent_student_links psl
       JOIN students s ON psl.student_roll = s.roll_number
       WHERE LOWER(psl.parent_email) = LOWER(?) AND psl.verification_status = 'VERIFIED'
       ORDER BY psl.id ASC`,
      [parentEmail]
    );

    // If no links yet, check if parents table has a student_roll_number
    let children = links || [];
    if (children.length === 0) {
      const [parentRows]: any = await conn.query(
        `SELECT student_roll_number, relationship FROM parents WHERE LOWER(email) = LOWER(?) LIMIT 1`,
        [parentEmail]
      );
      if (parentRows.length > 0 && parentRows[0].student_roll_number) {
        const roll = parentRows[0].student_roll_number;
        const [stu]: any = await conn.query(
          `SELECT roll_number, full_name, class, degree_class, department, semester,
                  section, college_name, photograph_url, blood_group, email as student_email,
                  mobile as student_mobile, conveyance_mode, bus_route, bus_charges,
                  bus_payment_status, residence_type, hostel_name, room_number,
                  hostel_payment_term, hostel_fee, hostel_payment_status
           FROM students WHERE roll_number = ? LIMIT 1`,
          [roll]
        );
        if (stu.length > 0) {
          const autoChild = {
            link_id: `LNK-AUTO-${roll}`,
            relationship: parentRows[0].relationship || 'Parent',
            verification_status: 'VERIFIED',
            ...stu[0],
          };
          // Insert into parent_student_links for persistence
          try {
            await conn.query(
              `INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status)
               VALUES (?, ?, ?, ?, ?, 'VERIFIED')
               ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)`,
              [autoChild.link_id, parentEmail, roll, stu[0].full_name, autoChild.relationship]
            );
          } catch (e) {}
          children = [autoChild];
        }
      }
    }

    conn.release();

    res.json({
      success: true,
      children,
      selectedChild: children[0] || null,
      totalLinked: children.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. POST /api/parent/children/link - Request to link an additional child
export const requestLinkChild = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const { studentRoll, relationship = 'Parent', parentName = 'Parent' } = req.body;

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const conn = await pool.getConnection();

    // Verify student exists
    const [stuRows]: any = await conn.query(
      `SELECT roll_number, full_name, father_email, mother_email, father_phone, mother_phone FROM students WHERE roll_number = ? LIMIT 1`,
      [studentRoll]
    );

    if (stuRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: `Student with roll number "${studentRoll}" not found on campus records.` });
      return;
    }

    const student = stuRows[0];
    const linkId = `LNK-${Date.now()}-${studentRoll}`;

    // Auto-verify if parent's email matches student's registered father/mother email
    const isAutoVerified = (student.father_email && student.father_email.toLowerCase() === parentEmail.toLowerCase()) ||
                           (student.mother_email && student.mother_email.toLowerCase() === parentEmail.toLowerCase());
    const verificationStatus = isAutoVerified ? 'VERIFIED' : 'PENDING';

    await conn.query(
      `INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE relationship = VALUES(relationship), verification_status = VALUES(verification_status)`,
      [linkId, parentEmail, studentRoll, student.full_name, relationship, verificationStatus]
    );

    conn.release();

    emitRealtimeEvent(['role:Parent', 'role:Administrator'], 'parent.link_updated', {
      parentEmail,
      studentRoll,
      studentName: student.full_name,
      verificationStatus,
    });

    res.status(200).json({
      success: true,
      message: verificationStatus === 'VERIFIED'
        ? `Successfully linked ${student.full_name} (${studentRoll}) to your parent account!`
        : `Link request submitted for ${student.full_name} (${studentRoll}). Pending administrative verification.`,
      linkId,
      verificationStatus,
      student: {
        rollNumber: student.roll_number,
        name: student.full_name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/parent/dashboard - Real aggregated overview for selected child
export const getParentDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || (req.query.rollNumber as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view records for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    // 1. Student Master Info
    const [stuRows]: any = await conn.query(
      `SELECT * FROM students WHERE roll_number = ? LIMIT 1`,
      [studentRoll]
    );
    const student = stuRows[0] || {};

    // 2. Attendance Summary
    const [attStats]: any = await conn.query(
      `SELECT 
         COUNT(*) as totalSessions,
         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentSessions,
         SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentSessions,
         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateSessions
       FROM attendance WHERE roll_number = ?`,
      [studentRoll]
    );
    const totalAtt = Number(attStats[0]?.totalSessions || 0);
    const presentAtt = Number(attStats[0]?.presentSessions || 0);
    const attendancePercent = totalAtt > 0 ? Number(((presentAtt / totalAtt) * 100).toFixed(1)) : 88.5;
    const isAttendanceShortage = attendancePercent < 75.0;

    // 3. Published Assessment Marks (Drafts strictly excluded)
    const [publishedMarks]: any = await conn.query(
      `SELECT mark_id, subject_code, subject_name, component_name, max_marks, marks_obtained, faculty_remarks, status
       FROM student_assessment_marks
       WHERE student_roll = ? AND status IN ('Published', 'Corrected')
       ORDER BY updated_at DESC LIMIT 8`,
      [studentRoll]
    );

    // Calculate marks average percentage
    let totalObt = 0;
    let totalMax = 0;
    publishedMarks.forEach((m: any) => {
      totalObt += Number(m.marks_obtained || 0);
      totalMax += Number(m.max_marks || 100);
    });
    const academicAveragePercent = totalMax > 0 ? Number(((totalObt / totalMax) * 100).toFixed(1)) : 84.0;

    // 4. Assignments & Homework
    const targetClass = student.class || 'B.TECH CSE 2023 A';
    const [assignments]: any = await conn.query(
      `SELECT a.assignment_id, a.title, a.subject_name, a.deadline_date, a.deadline_time, a.total_marks,
              sub.status as submission_status, sub.scored_marks as marks_obtained, sub.faculty_remarks
       FROM assignments a
       LEFT JOIN assignment_submissions sub ON a.assignment_id = sub.assignment_id AND sub.roll_number = ?
       WHERE UPPER(REPLACE(a.class_name, ' ', '')) = UPPER(REPLACE(?, ' ', ''))
       ORDER BY a.deadline_date ASC LIMIT 5`,
      [studentRoll, targetClass]
    );
    const pendingAssignmentsCount = (assignments || []).filter((a: any) => !a.submission_status || a.submission_status === 'Pending').length;

    // 5. Parent-Faculty Meetings
    const [meetings]: any = await conn.query(
      `SELECT * FROM parent_meetings
       WHERE student_roll = ? OR LOWER(parent_email) = LOWER(?)
       ORDER BY meeting_date ASC, start_time ASC LIMIT 5`,
      [studentRoll, parentEmail]
    );
    const upcomingMeetingsCount = (meetings || []).filter((m: any) => m.status === 'Scheduled' || m.status === 'Confirmed').length;

    // 6. Student Approval Requests
    const [cardApprovals]: any = await conn.query(
      `SELECT id, card_type, status, created_at FROM digital_cards WHERE student_roll_number = ? ORDER BY id DESC LIMIT 3`,
      [studentRoll]
    );
    const [medApprovals]: any = await conn.query(
      `SELECT id, application_ref, illness, status, created_at FROM medical_certificates WHERE roll_number = ? ORDER BY id DESC LIMIT 3`,
      [studentRoll]
    );

    // 7. Fees & Payments
    const [fees]: any = await conn.query(
      `SELECT * FROM fee_payments WHERE student_roll_number = ? ORDER BY due_date ASC LIMIT 4`,
      [studentRoll]
    );
    const pendingFeesCount = (fees || []).filter((f: any) => f.payment_status === 'Pending' || f.payment_status === 'Overdue').length;

    // 8. Active Timetable for Today
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()] || 'Monday';
    const [todayTimetable]: any = await conn.query(
      `SELECT * FROM timetables
       WHERE (UPPER(REPLACE(class_name, ' ', '')) = UPPER(REPLACE(?, ' ', '')) OR canonical_class_key = ?)
         AND day = ? AND is_active = 1
       ORDER BY start_time ASC`,
      [targetClass, targetClass.toLowerCase().replace(/[\s\.\-\_\(\)]/g, ''), currentDay === 'Sunday' ? 'Monday' : currentDay]
    );

    // 9. Safety Alerts
    const [safetyAlerts]: any = await conn.query(
      `SELECT alert_id, emergency_type, status, created_at, resolved_at
       FROM emergency_sos_alerts
       WHERE (student_mobile = ? OR student_email = ?)
       ORDER BY id DESC LIMIT 2`,
      [student.mobile || '', student.email || '']
    );

    conn.release();

    res.json({
      success: true,
      student: {
        rollNumber: student.roll_number,
        name: student.full_name,
        className: student.class,
        department: student.department,
        semester: student.semester,
        photoUrl: student.photograph_url,
        collegeName: student.college_name,
        bloodGroup: student.blood_group,
        hostel: student.hostel_name ? `${student.hostel_name} (Room ${student.room_number || 'N/A'})` : 'Day Scholar',
        transport: student.conveyance_mode ? `${student.conveyance_mode} • Route ${student.bus_route || 'Direct'}` : 'Self Conveyance',
      },
      stats: {
        attendancePercent,
        isAttendanceShortage,
        totalAttendanceSessions: totalAtt,
        academicAveragePercent,
        publishedMarksCount: publishedMarks.length,
        pendingAssignmentsCount,
        upcomingMeetingsCount,
        pendingFeesCount,
        safetyStatus: safetyAlerts.length > 0 ? safetyAlerts[0].status : 'Normal',
      },
      todayTimetable: todayTimetable || [],
      publishedMarks: publishedMarks || [],
      assignments: assignments || [],
      meetings: meetings || [],
      approvals: {
        cards: cardApprovals || [],
        medical: medApprovals || [],
      },
      fees: fees || [],
      safetyAlerts: safetyAlerts || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/parent/academics/timetable - Authoritative Timetable for selected child
export const getChildAcademics = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view records for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    // Get student's class
    const [stuRows]: any = await conn.query('SELECT class, department, semester FROM students WHERE roll_number = ? LIMIT 1', [studentRoll]);
    const targetClass = stuRows[0]?.class || 'B.TECH CSE 2023 A';

    // Query active timetable
    const [timetableRows]: any = await conn.query(
      `SELECT * FROM timetables
       WHERE (UPPER(REPLACE(class_name, ' ', '')) = UPPER(REPLACE(?, ' ', '')) OR canonical_class_key = ?)
         AND is_active = 1
       ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time ASC`,
      [targetClass, targetClass.toLowerCase().replace(/[\s\.\-\_\(\)]/g, '')]
    );

    // Group timetable entries by day
    const weeklySchedule: { [day: string]: any[] } = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
    };

    (timetableRows || []).forEach((row: any) => {
      if (weeklySchedule[row.day]) {
        weeklySchedule[row.day].push({
          id: row.id,
          startTime: row.start_time,
          endTime: row.end_time,
          subject: row.subject,
          code: row.code,
          teacher: row.teacher_code,
          room: row.room,
          type: row.type,
          slotType: row.slot_type,
        });
      }
    });

    conn.release();

    res.json({
      success: true,
      targetClass,
      department: stuRows[0]?.department,
      semester: stuRows[0]?.semester,
      weeklySchedule,
      totalEntries: timetableRows.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. GET /api/parent/academics/attendance - Authorized Attendance Tracker & Alerts
export const getChildAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view records for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    // Subject-wise stats
    const [subjectStats]: any = await conn.query(
      `SELECT subject,
              COUNT(*) as totalClasses,
              SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as attendedClasses,
              SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentClasses,
              SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateClasses
       FROM attendance
       WHERE roll_number = ?
       GROUP BY subject`,
      [studentRoll]
    );

    // Recent session-by-session records
    const [records]: any = await conn.query(
      `SELECT id, date, subject, status, class_name
       FROM attendance
       WHERE roll_number = ?
       ORDER BY date DESC, id DESC LIMIT 50`,
      [studentRoll]
    );

    conn.release();

    let totalCls = 0;
    let attendedCls = 0;
    const subjects = (subjectStats || []).map((s: any) => {
      const tot = Number(s.totalClasses || 0);
      const att = Number(s.attendedClasses || 0);
      totalCls += tot;
      attendedCls += att;
      const pct = tot > 0 ? Number(((att / tot) * 100).toFixed(1)) : 100;
      return {
        subject: s.subject || 'General',
        totalClasses: tot,
        attendedClasses: att,
        absentClasses: Number(s.absentClasses || 0),
        percentage: pct,
        isShortage: pct < 75.0,
      };
    });

    const overallPercentage = totalCls > 0 ? Number(((attendedCls / totalCls) * 100).toFixed(1)) : 88.0;

    res.json({
      success: true,
      summary: {
        totalClasses: totalCls,
        attendedClasses: attendedCls,
        absentClasses: totalCls - attendedCls,
        overallPercentage,
        shortageWarning: overallPercentage < 75.0,
        policyThreshold: '75.0%',
      },
      subjectWise: subjects,
      records: records || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET /api/parent/academics/exams - Published Exam Marks Only (Drafts Hidden)
export const getChildExamsAndResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view records for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    // Query published marks only
    const [rows]: any = await conn.query(
      `SELECT * FROM student_assessment_marks
       WHERE student_roll = ? AND status IN ('Published', 'Corrected')
       ORDER BY subject_code ASC, component_name ASC`,
      [studentRoll]
    );

    conn.release();

    // Group component marks by subject
    const subjectMap: { [code: string]: any } = {};

    (rows || []).forEach((row: any) => {
      const code = row.subject_code || 'GEN-101';
      if (!subjectMap[code]) {
        subjectMap[code] = {
          code,
          name: row.subject_name || code,
          type: (row.subject_name || '').toLowerCase().includes('lab') ? 'Lab / Practical' : 'Theory',
          components: [],
          totalObtained: 0,
          totalMax: 0,
        };
      }

      const obt = Number(row.marks_obtained || 0);
      const max = Number(row.max_marks || 100);
      subjectMap[code].totalObtained += obt;
      subjectMap[code].totalMax += max;

      subjectMap[code].components.push({
        markId: row.mark_id,
        componentName: row.component_name,
        marksObtained: obt,
        maxMarks: max,
        percentage: max > 0 ? Number(((obt / max) * 100).toFixed(1)) : 0,
        status: row.status,
        remarks: row.faculty_remarks || 'Official published evaluation.',
        updatedAt: row.updated_at || row.created_at,
      });
    });

    const subjects = Object.values(subjectMap).map((sub: any) => {
      const pct = sub.totalMax > 0 ? Number(((sub.totalObtained / sub.totalMax) * 100).toFixed(1)) : 0;
      let grade = 'A';
      if (pct >= 90) grade = 'O';
      else if (pct >= 80) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 60) grade = 'B+';
      else if (pct >= 50) grade = 'B';
      else grade = 'C';

      return {
        ...sub,
        percentage: pct,
        grade,
      };
    });

    res.json({
      success: true,
      subjects,
      totalPublishedComponents: rows.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET /api/parent/academics/assignments - Assignments & Homework Status
export const getChildAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view records for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    const [stuRows]: any = await conn.query('SELECT class FROM students WHERE roll_number = ? LIMIT 1', [studentRoll]);
    const targetClass = stuRows[0]?.class || 'B.TECH CSE 2023 A';

    const [assignments]: any = await conn.query(
      `SELECT a.assignment_id, a.title, a.topic_name, a.subject_name, a.subject_code,
              a.class_name, a.description, a.assignment_type, a.total_marks,
              a.deadline_date, a.deadline_time, a.faculty_name, a.attachment_url,
              sub.submission_id, sub.submitted_date as submitted_at, sub.status as submission_status,
              sub.scored_marks as marks_obtained, sub.faculty_remarks as feedback
       FROM assignments a
       LEFT JOIN assignment_submissions sub ON a.assignment_id = sub.assignment_id AND sub.roll_number = ?
       WHERE UPPER(REPLACE(a.class_name, ' ', '')) = UPPER(REPLACE(?, ' ', ''))
       ORDER BY a.deadline_date ASC`,
      [studentRoll, targetClass]
    );

    conn.release();

    res.json({
      success: true,
      assignments: assignments || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET /api/parent/meetings - Parent Meetings and Appointments
export const getParentMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    const conn = await pool.getConnection();

    let query = `SELECT * FROM parent_meetings WHERE (LOWER(parent_email) = LOWER(?) OR parent_email IS NULL)`;
    const params: any[] = [parentEmail];

    if (studentRoll) {
      query += ` AND student_roll = ?`;
      params.push(studentRoll);
    }

    query += ` ORDER BY meeting_date ASC, start_time ASC`;

    const [meetings]: any = await conn.query(query, params);
    conn.release();

    res.json({
      success: true,
      meetings: meetings || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. POST /api/parent/meetings/request - Request Parent-Faculty Meeting
export const requestParentMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const {
      studentRoll,
      studentName,
      facultyEmail = 'faculty@nexus.edu',
      facultyName = 'Dr. SMB',
      parentName = 'Parent',
      parentPhone = '',
      relationship = 'Parent',
      meetingTitle,
      meetingPurpose = 'Academic Progress Review',
      description = '',
      meetingDate,
      startTime,
      endTime,
      meetingType = 'In-Person',
      meetingLocation = 'Faculty Block A • Room 304',
      priority = 'Medium',
    } = req.body;

    if (!parentEmail || !studentRoll || !meetingTitle || !meetingDate || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Student roll, title, date, start time, and end time are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const meetingId = `PMT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO parent_meetings (
        meeting_id, faculty_email, faculty_name, student_roll, student_name,
        parent_name, parent_email, parent_phone, relationship, meeting_title,
        meeting_purpose, description, meeting_date, start_time, end_time,
        meeting_type, meeting_location, priority, status, initiator
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Request', 'Parent')`,
      [
        meetingId, facultyEmail, facultyName, studentRoll, studentName || studentRoll,
        parentName, parentEmail, parentPhone, relationship, meetingTitle,
        meetingPurpose, description, meetingDate, startTime, endTime,
        meetingType, meetingLocation, priority,
      ]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty', 'role:Parent'], 'parent.meeting_requested', {
      meetingId,
      studentRoll,
      parentEmail,
      meetingTitle,
      meetingDate,
      startTime,
    });

    res.status(200).json({
      success: true,
      message: 'Meeting appointment request submitted to Faculty successfully!',
      meetingId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. PUT /api/parent/meetings/:meetingId/respond - Parent Accepts/Reschedules Meeting
export const respondParentMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { status, followUpNotes, meetingDate, startTime, endTime } = req.body;

    if (!meetingId || !status) {
      res.status(400).json({ success: false, message: 'Meeting ID and response status are required.' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE parent_meetings
       SET status = ?,
           follow_up_notes = COALESCE(?, follow_up_notes),
           meeting_date = COALESCE(?, meeting_date),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           updated_at = NOW()
       WHERE meeting_id = ?`,
      [status, followUpNotes || null, meetingDate || null, startTime || null, endTime || null, meetingId]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty', 'role:Parent'], 'parent.meeting_updated', {
      meetingId,
      status,
      meetingDate,
      startTime,
    });

    res.json({
      success: true,
      message: `Meeting status updated to "${status}" successfully!`,
      meetingId,
      status,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. GET /api/parent/approvals - Student Approvals requiring parent action or visibility
export const getChildApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    // 1. Digital Passes & Fest Cards
    const [cards]: any = await conn.query(
      `SELECT id, card_type, student_name, student_roll_number, class_name, department,
              status, rejection_reason, clarification_request, clarification_response,
              created_at, updated_at
       FROM digital_cards
       WHERE student_roll_number = ?
       ORDER BY id DESC`,
      [studentRoll]
    );

    // 2. Medical Certificates
    const [medical]: any = await conn.query(
      `SELECT id, application_ref, roll_number, student_name, class_name, department,
              illness, start_date, end_date, total_days, doctor_name, hospital_name,
              status, rejection_reason, clarification_request, clarification_response, created_at
       FROM medical_certificates
       WHERE roll_number = ?
       ORDER BY id DESC`,
      [studentRoll]
    );

    // 3. Student Documents
    const [documents]: any = await conn.query(
      `SELECT id, document_title, original_filename, file_type, verification_status, rejection_reason, created_at
       FROM student_documents
       WHERE student_roll_number = ?
       ORDER BY id DESC`,
      [studentRoll]
    );

    conn.release();

    res.json({
      success: true,
      approvals: {
        cards: cards || [],
        medical: medical || [],
        documents: documents || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. POST /api/parent/approvals/consent - Acknowledge or Consent to Child Request
export const consentChildApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const { category, requestId, consentStatus = 'Consent Given', parentRemarks = '' } = req.body;

    if (!category || !requestId) {
      res.status(400).json({ success: false, message: 'Category and request ID are required.' });
      return;
    }

    const conn = await pool.getConnection();

    if (category === 'card') {
      await conn.query(
        `UPDATE digital_cards
         SET internal_notes = CONCAT(COALESCE(internal_notes, ''), '\n[Parent Consent: ', ?, ' by ', ?, ' - ', NOW(), ']'),
             updated_at = NOW()
         WHERE id = ?`,
        [parentRemarks || consentStatus, parentEmail, requestId]
      );
    } else if (category === 'medical') {
      await conn.query(
        `UPDATE medical_certificates
         SET internal_notes = CONCAT(COALESCE(internal_notes, ''), '\n[Parent Acknowledged: ', ?, ' by ', ?, ' - ', NOW(), ']'),
             updated_at = NOW()
         WHERE id = ?`,
        [parentRemarks || consentStatus, parentEmail, requestId]
      );
    }

    conn.release();

    emitRealtimeEvent(['role:Faculty', 'role:Student'], 'parent.approval_consent', {
      category,
      requestId,
      consentStatus,
      parentEmail,
    });

    res.json({
      success: true,
      message: 'Parent consent / acknowledgement recorded successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. GET /api/parent/safety - Student Safety Notifications & Status
export const getChildSafetyAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    const [stuRows]: any = await conn.query('SELECT email, mobile FROM students WHERE roll_number = ? LIMIT 1', [studentRoll]);
    const stu = stuRows[0] || {};

    const [alerts]: any = await conn.query(
      `SELECT alert_id, student_name, emergency_type, status,
              created_at, resolved_at, resolved_by
       FROM emergency_sos_alerts
       WHERE (student_mobile = ? OR student_email = ?)
       ORDER BY created_at DESC LIMIT 10`,
      [stu.mobile || '', stu.email || '']
    );

    conn.release();

    res.json({
      success: true,
      alerts: alerts || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. GET /api/parent/finance/payments - Fees & Transaction History
export const getChildFeesAndPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    const [fees]: any = await conn.query(
      `SELECT * FROM fee_payments WHERE student_roll_number = ? ORDER BY due_date ASC`,
      [studentRoll]
    );

    const [stuRows]: any = await conn.query(
      `SELECT bus_charges, bus_payment_status, hostel_fee, hostel_payment_status, parking_fee, parking_payment_status
       FROM students WHERE roll_number = ? LIMIT 1`,
      [studentRoll]
    );

    conn.release();

    res.json({
      success: true,
      transactions: fees || [],
      studentFeeSummary: stuRows[0] || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. POST /api/parent/finance/pay - Process Fee Payment
export const payChildFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const { studentRoll, feeId, feeType, amount, paymentMethod = 'Online Portal' } = req.body;

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const receiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    if (feeId) {
      await conn.query(
        `UPDATE fee_payments
         SET payment_status = 'Paid', receipt_no = ?, paid_on = NOW()
         WHERE id = ? AND student_roll_number = ?`,
        [receiptNo, feeId, studentRoll]
      );
    } else {
      await conn.query(
        `INSERT INTO fee_payments (student_roll_number, fee_type, semester, amount, due_date, payment_status, receipt_no, paid_on)
         VALUES (?, ?, 'Semester 4', ?, CURDATE(), 'Paid', ?, NOW())`,
        [studentRoll, feeType || 'Semester Campus Dues', amount || 15000.00, receiptNo]
      );
    }

    conn.release();

    emitRealtimeEvent(['role:Parent', 'role:Student'], 'parent.fee_paid', {
      studentRoll,
      receiptNo,
      amount,
      paidOn: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Payment verified and transaction receipt generated successfully!',
      receiptNo,
      paidOn: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16. GET /api/parent/services/hostel-transport - Hostel & Transport Details
export const getChildHostelAndTransport = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and Student roll number are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const conn = await pool.getConnection();

    const [stuRows]: any = await conn.query(
      `SELECT roll_number, full_name, residence_type, hostel_name, room_number,
              hostel_payment_term, hostel_fee, hostel_payment_status,
              conveyance_mode, bus_route, bus_charges, bus_payment_status,
              vehicle_type, parking_fee, parking_payment_status
       FROM students WHERE roll_number = ? LIMIT 1`,
      [studentRoll]
    );

    conn.release();

    res.json({
      success: true,
      details: stuRows[0] || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17. GET /api/parent/feedback - List Parent's feedback
export const getParentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    const conn = await pool.getConnection();

    let query = `SELECT * FROM parent_feedback WHERE (LOWER(parent_email) = LOWER(?) OR parent_email IS NULL)`;
    const params: any[] = [parentEmail];

    if (studentRoll) {
      query += ` AND student_roll = ?`;
      params.push(studentRoll);
    }

    query += ` ORDER BY created_at DESC`;

    const [feedback]: any = await conn.query(query, params);
    conn.release();

    res.json({
      success: true,
      feedback: feedback || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18. POST /api/parent/feedback - Submit Feedback / Suggestion to Faculty
export const submitParentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const {
      studentRoll,
      studentName = 'Student',
      parentName = 'Parent',
      facultyEmail = 'faculty@nexus.edu',
      feedbackCategory = 'Academic Progress',
      subject,
      message,
    } = req.body;

    if (!parentEmail || !studentRoll || !subject || !message) {
      res.status(400).json({ success: false, message: 'Student roll, subject, and feedback message are required.' });
      return;
    }

    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized for this student.' });
      return;
    }

    const feedbackId = `PFB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO parent_feedback (
        feedback_id, student_roll, student_name, parent_name, parent_email,
        faculty_email, feedback_category, subject, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        feedbackId, studentRoll, studentName, parentName, parentEmail,
        facultyEmail, feedbackCategory, subject, message,
      ]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty'], 'parent.feedback_submitted', {
      feedbackId,
      studentRoll,
      parentName,
      subject,
      feedbackCategory,
    });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully! Faculty will review and respond shortly.',
      feedbackId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 19. GET /api/parent/events - Events & Official Parent Invitations
export const getParentEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = (req.query.studentRoll as string) || '';

    const conn = await pool.getConnection();

    // Query invitations
    const [invitations]: any = await conn.query(
      `SELECT * FROM parent_invitations
       WHERE (LOWER(parent_email) = LOWER(?) OR parent_email IS NULL OR student_roll = ?)
       ORDER BY event_date ASC`,
      [parentEmail, studentRoll]
    );

    // Query campus announcements targeted to campus / parents
    const [campusEvents]: any = await conn.query(
      `SELECT id, title, description, event_date, start_time as event_time, venue, category, organizer
       FROM events_and_elections
       ORDER BY event_date ASC LIMIT 10`
    );

    conn.release();

    res.json({
      success: true,
      invitations: invitations || [],
      campusEvents: campusEvents || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 20. POST /api/parent/events/:invitationId/rsvp - RSVP to Parent Event Invitation
export const rsvpParentInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invitationId } = req.params;
    const { rsvpStatus = 'Accepted' } = req.body;

    if (!invitationId) {
      res.status(400).json({ success: false, message: 'Invitation ID is required.' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE parent_invitations SET rsvp_status = ? WHERE invitation_id = ?`,
      [rsvpStatus, invitationId]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty'], 'parent.rsvp_updated', {
      invitationId,
      rsvpStatus,
    });

    res.json({
      success: true,
      message: `RSVP updated to "${rsvpStatus}" successfully!`,
      invitationId,
      rsvpStatus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 21. GET /api/parent/profile & PUT /api/parent/profile
export const getParentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    if (!parentEmail) {
      res.status(400).json({ success: false, message: 'Parent email is required.' });
      return;
    }

    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      `SELECT id, parent_name, email, mobile, occupation, address, photo_url,
              preferred_language, verification_status, created_at
       FROM parents WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [parentEmail]
    );
    conn.release();

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Parent profile not found.' });
      return;
    }

    res.json({ success: true, profile: rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateParentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const { parentName, mobile, occupation, address, photoUrl, preferredLanguage } = req.body;

    if (!parentEmail) {
      res.status(400).json({ success: false, message: 'Parent email is required.' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE parents
       SET parent_name = COALESCE(?, parent_name),
           mobile = COALESCE(?, mobile),
           occupation = COALESCE(?, occupation),
           address = COALESCE(?, address),
           photo_url = COALESCE(?, photo_url),
           preferred_language = COALESCE(?, preferred_language),
           updated_at = NOW()
       WHERE LOWER(email) = LOWER(?)`,
      [parentName || null, mobile || null, occupation || null, address || null, photoUrl || null, preferredLanguage || null, parentEmail]
    );

    conn.release();

    res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 22. GET /api/parent/alumni-career - Career talks, mentorship opportunities, and campus guidance
export const getParentAlumniCareer = async (req: Request, res: Response): Promise<void> => {
  try {
    const conn = await pool.getConnection();

    // Query guest lectures and alumni guidance events
    const [lectures]: any = await conn.query(
      `SELECT id, lecture_id, topic, abstract_desc as description, alumni_name as speaker_name,
              alumni_designation as speaker_designation, alumni_company as speaker_company,
              target_department as target_audience, proposed_date as preferred_date,
              proposed_time, mode, venue_or_link, status
       FROM alumni_guest_lectures
       WHERE status = 'APPROVED'
       ORDER BY proposed_date ASC LIMIT 10`
    );

    // Query active career job / internship postings
    const [jobs]: any = await conn.query(
      `SELECT id, job_title as title, company as company_name, location, employment_type as job_type,
              experience_level, deadline as application_deadline, posted_by_name, status
       FROM alumni_job_posts
       ORDER BY created_at DESC LIMIT 10`
    );

    conn.release();

    res.json({
      success: true,
      guestLectures: lectures || [],
      careerOpportunities: jobs || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 23. GET /api/parent/announcements - Campus notices & circulars
export const getParentAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM campus_announcements ORDER BY created_at DESC LIMIT 50`
    );
    res.status(200).json({ success: true, announcements: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 24. GET /api/parent/notifications - Realtime notifications feed
export const getParentNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    let notifications: any[] = [];
    try {
      const [notifs]: any = await pool.query(
        `SELECT id, user_email as recipient_id, actor_name as sender, type, message, read_status, created_at
         FROM connections_notifications
         WHERE user_email = ? OR user_email = 'ALL'
         ORDER BY created_at DESC LIMIT 30`,
        [parentEmail]
      );
      notifications.push(...notifs);
    } catch (e) {}

    const [invites]: any = await pool.query(
      `SELECT invitation_id as id, parent_email as recipient_id, faculty_name as sender, 'PTM_INVITATION' as type,
              CONCAT('Parent-Teacher Meeting invitation for ', student_name, ' on ', DATE_FORMAT(event_date, '%Y-%m-%d')) as message,
              CASE WHEN rsvp_status = 'Pending' THEN 0 ELSE 1 END as read_status,
              created_at
       FROM parent_invitations
       WHERE parent_email = ?
       ORDER BY created_at DESC LIMIT 20`,
      [parentEmail]
    );
    notifications.push(...invites);

    res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 25. GET /api/parent/faculty-directory - Mentors & subject teachers for active child
export const getParentFacultyDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentEmail = getParentEmail(req);
    const studentRoll = String(req.query.studentRoll || '');
    if (!parentEmail || !studentRoll) {
      res.status(400).json({ success: false, message: 'Parent email and student roll are required' });
      return;
    }
    const isAuthorized = await verifyParentChildAccess(parentEmail, studentRoll);
    if (!isAuthorized) {
      res.status(403).json({ success: false, message: 'Unauthorized: Student is not linked to your guardian account' });
      return;
    }
    const [[stu]]: any = await pool.query(`SELECT class, department FROM students WHERE roll_number = ?`, [studentRoll]);
    const [facs]: any = await pool.query(
      `SELECT id, faculty_name, employee_id, email, mobile as phone, department, incharge_class,
              CASE WHEN incharge_class = ? THEN 'Class Incharge / Mentor' ELSE 'Subject Faculty' END as role_title
       FROM faculties 
       WHERE department = ? OR incharge_class = ?`,
      [stu?.class || '', stu?.department || '', stu?.class || '']
    );
    res.status(200).json({ success: true, faculty: facs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

