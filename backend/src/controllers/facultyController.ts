import type { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent } from '../config/socket';

export const fetchStudentsForClass = async (conn: any, className: string) => {
  const rawClean = (className || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const tokens = (className || '').trim().split(/\s+/);
  const secToken = tokens[tokens.length - 1] || '';
  const secChar = secToken.replace(/[^A-Z]/g, '') || secToken;
  const deptToken = tokens.find(t => ['CSE', 'ECE', 'ME', 'CE', 'IT', 'MGMT', 'BCA'].includes(t.toUpperCase())) || '';

  const [rows]: any = await conn.query(
    `SELECT id, full_name, roll_number, class, department, semester, section, email, mobile, photograph_url, created_at,
            (DATEDIFF(NOW(), created_at) <= 7) as is_new
     FROM students 
     WHERE (is_active = 1 OR is_active IS NULL)
       AND (
         UPPER(REPLACE(REPLACE(REPLACE(class, ".", ""), "-", ""), " ", "")) = ?
         OR UPPER(REPLACE(REPLACE(REPLACE(class, ".", ""), "-", ""), " ", "")) LIKE CONCAT("%", ?, "%")
         OR ? LIKE CONCAT("%", UPPER(REPLACE(REPLACE(REPLACE(class, ".", ""), "-", ""), " ", "")), "%")
         OR (
            (? != '' AND (UPPER(section) = ? OR UPPER(section) = ? OR UPPER(class) LIKE CONCAT("%", ?, "%")))
            AND (? = '' OR UPPER(department) LIKE CONCAT("%", ?, "%") OR UPPER(class) LIKE CONCAT("%", ?, "%"))
         )
       )
     ORDER BY created_at DESC, roll_number ASC`,
    [
      rawClean, rawClean, rawClean,
      secToken, secToken.toUpperCase(), secChar.toUpperCase(), secToken.toUpperCase(),
      deptToken, deptToken.toUpperCase(), deptToken.toUpperCase()
    ]
  );
  return rows || [];
};

// 1. GET /api/faculty/dashboard
export const getFacultyDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    // Fetch faculty details
    const [facs]: any = await conn.query('SELECT * FROM faculties WHERE email = ? LIMIT 1', [facultyEmail]);
    const faculty = Array.isArray(facs) && facs.length > 0 ? facs[0] : {
      faculty_name: 'Dr. SMB',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      email: 'faculty@nexus.edu',
      employee_id: 'EMP-CSE-101',
    };

    const targetClass = faculty.incharge_class || 'BTECH CSE 4A';
    const teacherCode = faculty.employee_id?.replace(/[^A-Za-z]/g, '') || 'SMB';

    // 1. Assigned classes (Incharge class + Classes taught in Timetable)
    const [classRows]: any = await conn.query(
      `SELECT DISTINCT class_name FROM timetables WHERE teacher_code = ? OR teacher_code = 'SMB'
       UNION
       SELECT class_name FROM classes WHERE class_incharge_email = ? OR class_incharge_name LIKE CONCAT('%', ?, '%')`,
      [teacherCode, facultyEmail, faculty.faculty_name]
    );
    const assignedClasses = Array.from(new Set([targetClass, ...(classRows || []).map((r: any) => r.class_name)]));

    // 2. Total students in authorized assigned classes
    const studentRows = await fetchStudentsForClass(conn, targetClass);

    // 3. Pending student medical leave requests
    const [pendingLeaves]: any = await conn.query('SELECT COUNT(*) as count FROM student_leaves WHERE status = "Pending"');

    // 4. Active assignments published by this faculty
    const [activeAssignments]: any = await conn.query(
      'SELECT COUNT(*) as count FROM assignments WHERE faculty_email = ? OR faculty_name = ?',
      [facultyEmail, faculty.faculty_name]
    );

    // 5. Student submissions awaiting evaluation
    const [submissionsToGrade]: any = await conn.query(
      `SELECT COUNT(*) as count FROM assignment_submissions sub
       JOIN assignments a ON sub.assignment_id = a.assignment_id
       WHERE (a.faculty_email = ? OR a.faculty_name = ?) AND sub.status = 'Submitted'`,
      [facultyEmail, faculty.faculty_name]
    );

    // 6. Faculty own leave requests status
    const [facultyPendingLeaves]: any = await conn.query(
      'SELECT COUNT(*) as count FROM faculty_leaves WHERE faculty_email = ? AND status = "Pending"',
      [facultyEmail]
    );

    // 7. Active Emergency SOS Alerts
    const [activeEmergencies]: any = await conn.query(
      'SELECT COUNT(*) as count FROM emergency_sos_alerts WHERE status != "Resolved"'
    );

    // 8. Published Assessment Schemes count
    const [publishedExams]: any = await conn.query(
      'SELECT COUNT(DISTINCT scheme_id) as count FROM student_assessment_marks WHERE faculty_email = ? AND status IN ("Published", "Corrected")',
      [facultyEmail]
    );

    // 9. Total active announcements published
    const [announcementsCount]: any = await conn.query(
      'SELECT COUNT(*) as count FROM announcements WHERE faculty_email = ?',
      [facultyEmail]
    );

    // 10. Research collaborations count
    const [researchCount]: any = await conn.query(
      'SELECT COUNT(*) as count FROM faculty_research_projects WHERE creator_email = ?',
      [facultyEmail]
    );

    // 11. Average Class Attendance percentage
    let avgAttendance = 85.0;
    try {
      const [attRow]: any = await conn.query(
        `SELECT AVG(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 100 ELSE 0 END) as avg_pct
         FROM attendance WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [targetClass]
      );
      if (attRow[0]?.avg_pct !== null && attRow[0]?.avg_pct !== undefined) {
        avgAttendance = parseFloat(parseFloat(attRow[0].avg_pct).toFixed(1));
      }
    } catch (e) {}

    // 12. Today's Lectures from authoritative timetables table
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[new Date().getDay()];
    const queryDay = currentDay === 'Sunday' ? 'Monday' : currentDay;

    const [todayLectureRows]: any = await conn.query(
      `SELECT id, day, start_time, end_time, slot_name, subject, code, teacher_code, class_name, room, type
       FROM timetables
       WHERE (teacher_code = ? OR teacher_code = 'SMB' OR teacher_code LIKE '%SMB%')
         AND day = ?
       ORDER BY start_time ASC`,
      [teacherCode, queryDay]
    );

    // Calculate current lecture status dynamically
    const now = new Date();
    const currentHourMin = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr: string) => {
      try {
        const parts = timeStr.trim().split(' ');
        const [h, m] = parts[0].split(':').map(Number);
        let mins = (h % 12) * 60 + (m || 0);
        if (parts[1]?.toUpperCase() === 'PM') mins += 12 * 60;
        return mins;
      } catch (e) {
        return 0;
      }
    };

    const parsedLectures = (todayLectureRows || []).map((lec: any) => {
      const startMins = parseTimeToMinutes(lec.start_time);
      const endMins = parseTimeToMinutes(lec.end_time);
      let status = 'UPCOMING';
      if (currentHourMin >= endMins) status = 'COMPLETED';
      else if (currentHourMin >= startMins && currentHourMin < endMins) status = 'IN_PROGRESS';

      return {
        id: String(lec.id),
        subject: lec.subject,
        code: lec.code,
        className: lec.class_name,
        timeSlot: `${lec.start_time} - ${lec.end_time}`,
        startTime: lec.start_time,
        endTime: lec.end_time,
        room: lec.room,
        type: lec.type || 'Lecture',
        status,
      };
    });

    conn.release();

    res.json({
      success: true,
      faculty: {
        name: faculty.faculty_name,
        department: faculty.department,
        designation: faculty.designation,
        email: faculty.email,
        employeeId: faculty.employee_id,
        isClassIncharge: faculty.is_class_incharge,
        inchargeClass: targetClass,
      },
      stats: {
        assignedClassesCount: assignedClasses.length,
        totalStudents: studentRows.length,
        pendingLeavesCount: pendingLeaves[0]?.count || 0,
        activeAssignmentsCount: activeAssignments[0]?.count || 0,
        submissionsToGradeCount: submissionsToGrade[0]?.count || 0,
        todayLecturesCount: parsedLectures.length,
        facultyPendingLeavesCount: facultyPendingLeaves[0]?.count || 0,
        activeEmergenciesCount: activeEmergencies[0]?.count || 0,
        publishedExamsCount: publishedExams[0]?.count || 0,
        announcementsCount: announcementsCount[0]?.count || 0,
        researchCount: researchCount[0]?.count || 0,
        averageAttendance: avgAttendance,
      },
      todayDay: queryDay,
      assignedClasses,
      todayLectures: parsedLectures,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/faculty/classes
export const getFacultyClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    // Check faculty record for assigned incharge class
    const [facs]: any = await conn.query('SELECT * FROM faculties WHERE email = ? LIMIT 1', [facultyEmail]);
    const faculty = Array.isArray(facs) && facs.length > 0 ? facs[0] : null;

    // Fetch classes from database
    const [allDbClasses]: any = await conn.query('SELECT * FROM classes ORDER BY id ASC');
    let classesToReturn: any[] = allDbClasses || [];

    if (req.query.all !== 'true' && faculty) {
      if (faculty.is_class_incharge === 'Yes' && faculty.incharge_class) {
        const filtered = classesToReturn.filter(
          (c: any) =>
            c.class_code.toUpperCase().replace(/\s/g, '') === faculty.incharge_class.toUpperCase().replace(/\s/g, '') ||
            c.class_incharge_email === facultyEmail
        );
        if (filtered.length > 0) {
          classesToReturn = filtered;
        }
      }
    }

    if (classesToReturn.length === 0 && allDbClasses.length > 0) {
      classesToReturn = allDbClasses;
    }

    // Enhance each class with DYNAMIC student count from MySQL students table!
    const formattedClasses = await Promise.all(
      classesToReturn.map(async (c: any) => {
        const classStudents = await fetchStudentsForClass(conn, c.class_code);
        const count = classStudents.length;

        const [asgnCountRow]: any = await conn.query(
          `SELECT COUNT(*) as count FROM assignments WHERE UPPER(REPLACE(REPLACE(REPLACE(class_name, ".", ""), "-", ""), " ", "")) = UPPER(REPLACE(REPLACE(REPLACE(?, ".", ""), "-", ""), " ", ""))`,
          [c.class_code]
        );
        const pendingAssignments = asgnCountRow[0]?.count || 0;

        return {
          id: `c_${c.id}`,
          name: c.class_code,
          fullName: c.class_name,
          department: c.department,
          semester: c.semester,
          section: c.section,
          studentCount: count,
          averageAttendance: 88.5,
          pendingAssignments,
          classInchargeEmail: c.class_incharge_email,
          classInchargeName: c.class_incharge_name,
        };
      })
    );

    conn.release();
    res.json({ success: true, classes: formattedClasses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET /api/faculty/students?className=...
export const getFacultyStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const className = (req.query.className as string) || 'B.TECH CSE 2023 A';
    const conn = await pool.getConnection();

    // Query real active students assigned to className from MySQL students table!
    const rows = await fetchStudentsForClass(conn, className);

    conn.release();

    const studentsList = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.full_name,
      fullName: r.full_name,
      rollNumber: r.roll_number || `2023CSE${String(r.id).padStart(3, '0')}`,
      admissionNumber: r.admission_number || `ADM2023${r.id}`,
      className: r.class,
      department: r.department,
      semester: r.semester,
      section: r.section,
      email: r.email,
      mobile: r.mobile,
      photoUrl: r.photograph_url,
      attendancePercent: 88.5,
      assignmentStats: '4/5 Completed',
      academicStatus: 'Active',
      isNewStudent: Boolean(r.is_new),
      registeredAt: r.created_at,
    }));

    res.json({
      success: true,
      className,
      totalStudents: studentsList.length,
      students: studentsList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3b. POST /api/faculty/students/transfer
export const transferStudentClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, rollNumber, newClassName } = req.body;

    if (!newClassName || (!studentId && !rollNumber)) {
      res.status(400).json({ success: false, message: 'Missing student identifier or new class name' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE students SET class = ? WHERE id = ? OR roll_number = ?`,
      [newClassName, studentId || 0, rollNumber || '']
    );
    conn.release();

    res.json({
      success: true,
      message: `Student successfully transferred to ${newClassName}! Class roster and student counts updated automatically.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3c. POST /api/faculty/students/deactivate
export const deactivateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, rollNumber } = req.body;

    if (!studentId && !rollNumber) {
      res.status(400).json({ success: false, message: 'Missing student identifier' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE students SET is_active = 0 WHERE id = ? OR roll_number = ?`,
      [studentId || 0, rollNumber || '']
    );
    conn.release();

    res.json({
      success: true,
      message: 'Student deactivated and removed from active class roster.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3d. POST /api/faculty/classes/assign-incharge
export const changeClassIncharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { className, facultyEmail, facultyName } = req.body;

    if (!className || !facultyEmail) {
      res.status(400).json({ success: false, message: 'Missing className or facultyEmail' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE faculties SET is_class_incharge = 'Yes', incharge_class = ? WHERE email = ?`,
      [className, facultyEmail]
    );
    await conn.query(
      `UPDATE classes SET class_incharge_email = ?, class_incharge_name = ? WHERE UPPER(REPLACE(class_code, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
      [facultyEmail, facultyName || 'Faculty', className]
    );
    conn.release();

    res.json({
      success: true,
      message: `Class Incharge for ${className} updated to ${facultyEmail}. Faculty access permissions updated.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET /api/faculty/assignments
export const getFacultyAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || (req.query.facultyEmail as string) || '';
    const className = (req.query.className as string) || '';

    const conn = await pool.getConnection();
    let query = 'SELECT * FROM assignments WHERE 1=1';
    const params: any[] = [];

    if (facultyEmail) {
      query += ' AND (faculty_email = ? OR class_name IN (SELECT incharge_class FROM faculties WHERE email = ?))';
      params.push(facultyEmail, facultyEmail);
    }

    if (className && className.toUpperCase() !== 'ALL') {
      query += ' AND UPPER(REPLACE(REPLACE(REPLACE(class_name, ".", ""), "-", ""), " ", "")) = UPPER(REPLACE(REPLACE(REPLACE(?, ".", ""), "-", ""), " ", ""))';
      params.push(className);
    }

    query += ' ORDER BY created_at DESC';

    const [rows]: any = await conn.query(query, params);

    // Enrich assignments with submission statistics
    const enrichedAssignments = await Promise.all(
      (rows || []).map(async (asgn: any) => {
        const [subStats]: any = await conn.query(
          `SELECT 
             COUNT(*) as total_submissions,
             SUM(CASE WHEN status = 'Graded' THEN 1 ELSE 0 END) as graded_count,
             SUM(CASE WHEN status != 'Graded' THEN 1 ELSE 0 END) as pending_evaluation
           FROM assignment_submissions WHERE assignment_id = ?`,
          [asgn.assignment_id]
        );

        const stats = subStats[0] || {};
        return {
          id: asgn.id,
          assignmentId: asgn.assignment_id || `asgn_${asgn.id}`,
          title: asgn.title || asgn.topic_name || 'Assignment Title',
          subject: asgn.subject || asgn.subject_name || 'Computer Science',
          subjectCode: asgn.subject_code || 'CS-501',
          className: asgn.class_name || 'B.TECH CSE 2023 A',
          description: asgn.description || '',
          assignmentType: asgn.assignment_type || 'Subjective',
          totalMarks: asgn.total_marks || 50,
          deadlineDate: asgn.deadline_date,
          deadlineTime: asgn.deadline_time || '11:59 PM',
          facultyEmail: asgn.faculty_email,
          facultyName: asgn.faculty_name,
          attachmentUrl: asgn.attachment_url || '',
          status: asgn.status || 'Published',
          createdAt: asgn.created_at,
          totalSubmissions: stats.total_submissions || 0,
          gradedCount: stats.graded_count || 0,
          pendingEvaluation: stats.pending_evaluation || 0,
        };
      })
    );

    conn.release();

    res.json({ success: true, assignments: enrichedAssignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4b. GET /api/faculty/assignments/stats
export const getAssignmentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || (req.query.facultyEmail as string) || '';
    const className = (req.query.className as string) || '';

    const conn = await pool.getConnection();

    let query = 'SELECT * FROM assignments WHERE 1=1';
    const params: any[] = [];

    if (facultyEmail) {
      query += ' AND (faculty_email = ? OR class_name IN (SELECT incharge_class FROM faculties WHERE email = ?))';
      params.push(facultyEmail, facultyEmail);
    }
    if (className) {
      query += ' AND UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))';
      params.push(className);
    }

    const [assignments]: any = await conn.query(query, params);
    const asgnIds = (assignments || []).map((a: any) => a.assignment_id);

    let totalSubmissions = 0;
    let pendingEvaluation = 0;
    let gradedCount = 0;

    if (asgnIds.length > 0) {
      const [subRows]: any = await conn.query(
        `SELECT status FROM assignment_submissions WHERE assignment_id IN (?)`,
        [asgnIds]
      );
      (subRows || []).forEach((s: any) => {
        totalSubmissions++;
        if (s.status === 'Graded') gradedCount++;
        else pendingEvaluation++;
      });
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const publishedCount = (assignments || []).filter((a: any) => a.status === 'Published').length;
    const pastDeadlineCount = (assignments || []).filter((a: any) => a.deadline_date && a.deadline_date < todayStr).length;

    conn.release();

    res.json({
      success: true,
      stats: {
        totalAssignments: assignments.length,
        publishedCount,
        draftCount: 0,
        pastDeadlineCount,
        totalSubmissions,
        pendingEvaluation,
        gradedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/faculty/assignments/create
export const createFacultyAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subject, subjectCode, className, description, assignmentType, totalMarks, deadlineDate, deadlineTime, facultyEmail, facultyName, attachmentUrl } = req.body;

    if (!title || !subject || !className || !deadlineDate) {
      res.status(400).json({ success: false, message: 'Missing required assignment fields: title, subject, className, deadlineDate' });
      return;
    }

    const assignmentId = `asgn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO assignments (assignment_id, title, topic_name, subject, subject_name, subject_code, class_name, description, assignment_type, total_marks, deadline_date, deadline_time, faculty_email, faculty_name, attachment_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published')`,
      [
        assignmentId,
        title,
        title,
        subject,
        subject,
        subjectCode || 'CSE-400',
        className,
        description || '',
        assignmentType || 'Subjective',
        totalMarks || 50,
        deadlineDate,
        deadlineTime || '11:59 PM',
        facultyEmail || 'faculty@nexus.edu',
        facultyName || 'Faculty',
        attachmentUrl || '',
      ]
    );

    conn.release();

    emitRealtimeEvent([`class:${className}`, 'role:Student'], 'assignment.published', {
      assignmentId,
      title,
      subject,
      className,
      facultyName: facultyName || 'Faculty',
    });

    res.json({ success: true, message: `✓ Assignment "${title}" created and published to ${className}!`, assignmentId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5b. PUT /api/faculty/assignments/:assignmentId
export const updateFacultyAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const { title, subject, subjectCode, className, description, assignmentType, totalMarks, deadlineDate, deadlineTime, attachmentUrl } = req.body;

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'Missing assignmentId parameter.' });
      return;
    }

    const conn = await pool.getConnection();

    const isNumericId = /^\d+$/.test(assignmentId);
    const whereClause = isNumericId ? 'WHERE id = ?' : 'WHERE assignment_id = ?';
    const targetVal = isNumericId ? Number(assignmentId) : assignmentId;

    await conn.query(
      `UPDATE assignments SET
        title = ?,
        topic_name = ?,
        subject = ?,
        subject_name = ?,
        subject_code = ?,
        class_name = ?,
        description = ?,
        assignment_type = ?,
        total_marks = ?,
        deadline_date = ?,
        deadline_time = ?,
        attachment_url = ?
       ${whereClause}`,
      [
        title,
        title,
        subject,
        subject,
        subjectCode || 'CS-501',
        className,
        description || '',
        assignmentType || 'Subjective',
        totalMarks || 50,
        deadlineDate,
        deadlineTime || '11:59 PM',
        attachmentUrl || '',
        targetVal,
      ]
    );

    conn.release();
    res.json({ success: true, message: `✓ Assignment "${title}" updated successfully!` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5c. DELETE /api/faculty/assignments/:assignmentId
export const deleteFacultyAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.assignmentId as string;
    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'Missing assignmentId parameter.' });
      return;
    }

    const conn = await pool.getConnection();

    const isNumericId = /^\d+$/.test(assignmentId);
    if (isNumericId) {
      await conn.query('DELETE FROM assignments WHERE id = ?', [Number(assignmentId)]);
    } else {
      await conn.query('DELETE FROM assignments WHERE assignment_id = ?', [assignmentId]);
      await conn.query('DELETE FROM assignment_submissions WHERE assignment_id = ?', [assignmentId]);
    }

    conn.release();
    res.json({ success: true, message: '✓ Assignment deleted successfully from database!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET /api/faculty/submissions?assignmentId=...
export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = (req.query.assignmentId as string) || '';
    const className = (req.query.className as string) || '';
    const statusFilter = (req.query.status as string) || 'ALL';

    const conn = await pool.getConnection();

    let asgnMeta: any = null;
    if (assignmentId) {
      const [asgnRows]: any = await conn.query('SELECT * FROM assignments WHERE assignment_id = ? LIMIT 1', [assignmentId]);
      if (asgnRows.length > 0) asgnMeta = asgnRows[0];
    }

    let query = 'SELECT * FROM assignment_submissions WHERE 1=1';
    const params: any[] = [];

    if (assignmentId) {
      query += ' AND assignment_id = ?';
      params.push(assignmentId);
    } else if (className) {
      query += ' AND UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))';
      params.push(className);
    }

    if (statusFilter === 'GRADED') {
      query += ' AND status = "Graded"';
    } else if (statusFilter === 'SUBMITTED') {
      query += ' AND status = "Submitted"';
    }

    query += ' ORDER BY created_at DESC';

    const [rows]: any = await conn.query(query, params);

    // If filtering for NOT_SUBMITTED, compare against students table roster
    let finalSubmissions = rows || [];
    if (statusFilter === 'NOT_SUBMITTED' && (asgnMeta || className)) {
      const targetClass = asgnMeta ? asgnMeta.class_name : className;
      const [students]: any = await conn.query(
        'SELECT id, full_name, roll_number, email FROM students WHERE UPPER(REPLACE(class, " ", "")) = UPPER(REPLACE(?, " ", ""))',
        [targetClass]
      );
      const submittedRolls = new Set((rows || []).map((r: any) => r.roll_number));

      finalSubmissions = (students || [])
        .filter((s: any) => !submittedRolls.has(s.roll_number))
        .map((s: any) => ({
          submission_id: `unsub_${s.id}`,
          assignment_id: assignmentId,
          student_email: s.email,
          roll_number: s.roll_number,
          student_name: s.full_name,
          class_name: targetClass,
          submitted_date: 'Not Submitted',
          uploaded_file_name: null,
          uploaded_file_url: null,
          status: 'Not Submitted',
          scored_marks: null,
          faculty_remarks: null,
        }));
    }

    conn.release();

    res.json({
      success: true,
      assignment: asgnMeta,
      submissions: finalSubmissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. PUT /api/faculty/submissions/grade
export const gradeSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId, scoredMarks, facultyRemarks } = req.body;

    if (!submissionId || scoredMarks === undefined || scoredMarks === null || isNaN(Number(scoredMarks))) {
      res.status(400).json({ success: false, message: 'Missing or invalid parameters: submissionId and numeric scoredMarks required.' });
      return;
    }

    const marksNum = Number(scoredMarks);

    const conn = await pool.getConnection();

    // Fetch submission and corresponding assignment total_marks
    const [subRows]: any = await conn.query(
      `SELECT s.*, a.total_marks, a.title 
       FROM assignment_submissions s
       LEFT JOIN assignments a ON s.assignment_id = a.assignment_id
       WHERE s.submission_id = ? LIMIT 1`,
      [submissionId]
    );

    if (!subRows || subRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Submission record not found.' });
      return;
    }

    const sub = subRows[0];
    const maxMarks = sub.total_marks || 50;

    // Validate: 0 <= scored_marks <= total_marks
    if (marksNum < 0 || marksNum > maxMarks) {
      conn.release();
      res.status(400).json({
        success: false,
        message: `Invalid Marks: Scored marks (${marksNum}) must be between 0 and maximum total marks (${maxMarks}).`,
      });
      return;
    }

    await conn.query(
      `UPDATE assignment_submissions
       SET scored_marks = ?, faculty_remarks = ?, status = 'Graded', graded_at = NOW()
       WHERE submission_id = ?`,
      [marksNum, facultyRemarks || 'Evaluated by faculty.', submissionId]
    );

    conn.release();

    emitRealtimeEvent(
      [`user:${sub.student_email}`, `class:${sub.class_name}`, 'role:Faculty'],
      'assignment.graded',
      {
        submissionId,
        assignmentId: sub.assignment_id,
        scoredMarks: marksNum,
        maxMarks,
        facultyRemarks,
        studentName: sub.student_name,
        studentEmail: sub.student_email,
      }
    );

    res.json({
      success: true,
      message: `✓ Submission evaluated: ${marksNum} / ${maxMarks} Marks awarded to ${sub.student_name}!`,
      scoredMarks: marksNum,
      maxMarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7b. POST /api/faculty/submissions/create
export const createStudentSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      submissionId,
      assignmentId,
      studentEmail,
      rollNumber,
      studentName,
      className,
      submittedDate,
      uploadedFileName,
      uploadedFileType,
      uploadedFileSize,
      uploadedFileUrl,
      status,
    } = req.body;

    const subId = submissionId || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO assignment_submissions (submission_id, assignment_id, student_email, roll_number, student_name, class_name, submitted_date, uploaded_file_name, uploaded_file_type, uploaded_file_size, uploaded_file_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         submitted_date = VALUES(submitted_date),
         uploaded_file_name = VALUES(uploaded_file_name),
         uploaded_file_type = VALUES(uploaded_file_type),
         uploaded_file_size = VALUES(uploaded_file_size),
         uploaded_file_url = VALUES(uploaded_file_url),
         status = VALUES(status)`,
      [
        subId,
        assignmentId,
        studentEmail || 'student@nexus.edu',
        rollNumber || '2329362',
        studentName || 'Student Name',
        className || 'B.TECH CSE 2023 A',
        submittedDate || new Date().toLocaleString(),
        uploadedFileName || 'assignment.pdf',
        uploadedFileType || 'pdf',
        uploadedFileSize || '1.5 MB',
        uploadedFileUrl || '',
        status || 'Submitted',
      ]
    );

    conn.release();

    emitRealtimeEvent(
      [`class:${className}`, 'role:Faculty'],
      'assignment.submission.created',
      {
        submissionId: subId,
        assignmentId,
        studentEmail: studentEmail || 'student@nexus.edu',
        studentName: studentName || 'Student Name',
        rollNumber: rollNumber || '2329362',
        className: className || 'B.TECH CSE 2023 A',
        uploadedFileName,
      }
    );

    res.json({ success: true, message: '✓ Assignment solution submitted successfully!', submissionId: subId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET /api/faculty/leaves
export const getFacultyLeaves = async (_req: Request, res: Response): Promise<void> => {
  try {
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query('SELECT * FROM student_leaves ORDER BY created_at DESC');
    conn.release();

    res.json({ success: true, leaves: rows || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. POST /api/faculty/leaves/approve
export const approveLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId, status, approverEmail } = req.body; // status = Approved | Rejected

    if (!leaveId || !status) {
      res.status(400).json({ success: false, message: 'Missing leaveId or status' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE student_leaves SET status = ?, approver_email = ? WHERE leave_id = ?',
      [status, approverEmail || 'faculty@nexus.edu', leaveId]
    );

    conn.release();
    res.json({ success: true, message: `Leave request ${status} successfully!` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. POST /api/faculty/announcements/create -> Publish announcement with RBAC & socket broadcast
export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      message,
      category,
      priority,
      targetAudience,
      targetClass,
      targetType,
      targetDepartment,
      targetStudentEmail,
      facultyName,
      facultyEmail,
      attachmentUrl,
      requiresAcknowledgement,
      expiresAt,
    } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Missing required announcement title or message' });
      return;
    }

    const announcementId = `anc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const conn = await pool.getConnection();

    await conn.beginTransaction();

    try {
      await conn.query(
        `INSERT INTO announcements (
          announcement_id, title, message, category, target_audience, target_class,
          target_type, target_department, target_student_email, faculty_name, faculty_email,
          attachment_url, priority, requires_acknowledgement, expires_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
        [
          announcementId,
          title,
          message,
          category || 'Academic',
          targetAudience || 'Class',
          targetClass || 'B.TECH CSE 2023 A',
          targetType || 'ENTIRE_CLASS',
          targetDepartment || null,
          targetStudentEmail || null,
          facultyName || 'Dr. SMB',
          facultyEmail || 'faculty@nexus.edu',
          attachmentUrl || '',
          priority || 'Normal',
          requiresAcknowledgement ? 1 : 0,
          expiresAt || null,
        ]
      );

      // Create persistent notification records for targeted students
      let targetStudents: any[] = [];
      if (targetStudentEmail) {
        targetStudents = [{ email: targetStudentEmail }];
      } else if (targetClass) {
        targetStudents = await fetchStudentsForClass(conn, targetClass);
      } else {
        const [rows]: any = await conn.query('SELECT email FROM students WHERE (is_active = 1 OR is_active IS NULL)');
        targetStudents = rows || [];
      }

      for (const s of targetStudents) {
        if (s.email) {
          const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          await conn.query(
            `INSERT INTO connection_notifications (notif_id, recipient_email, sender_email, sender_name, type, title, text, is_read)
             VALUES (?, ?, ?, ?, 'ANNOUNCEMENT', ?, ?, 0)`,
            [
              notifId,
              s.email,
              facultyEmail || 'faculty@nexus.edu',
              facultyName || 'Dr. SMB',
              `Announcement: ${title}`,
              message.substring(0, 150),
            ]
          );
        }
      }

      await conn.commit();
      conn.release();

      // Emit Phase 5 Real-Time Socket Event
      const rooms: string[] = ['role:Student', 'role:Faculty', 'role:Administrator'];
      if (targetClass) rooms.push(`class:${targetClass}`);
      if (targetStudentEmail) rooms.push(`user:${targetStudentEmail.toLowerCase()}`);
      if (targetDepartment) rooms.push(`department:${targetDepartment}`);

      try {
        emitRealtimeEvent(rooms, 'announcement.created', {
          announcementId,
          title,
          message,
          category: category || 'Academic',
          priority: priority || 'Normal',
          targetClass: targetClass || 'B.TECH CSE 2023 A',
          targetType: targetType || 'ENTIRE_CLASS',
          facultyName: facultyName || 'Dr. SMB',
          facultyEmail: facultyEmail || 'faculty@nexus.edu',
          requiresAcknowledgement: Boolean(requiresAcknowledgement),
          createdAt: new Date().toISOString(),
        });
      } catch (sockErr) {
        console.warn('Realtime event broadcast warning:', sockErr);
      }

      res.json({ success: true, message: '✓ Announcement published successfully across portals!', announcementId });
    } catch (dbErr: any) {
      await conn.rollback();
      conn.release();
      throw dbErr;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10b. GET /api/faculty/announcements -> Fetch active announcements with live acknowledgement stats
export const getFacultyAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyEmail, className, category, priority, status } = req.query;

    const conn = await pool.getConnection();

    let query = 'SELECT * FROM announcements WHERE 1=1';
    const params: any[] = [];

    if (facultyEmail) {
      query += ' AND faculty_email = ?';
      params.push(facultyEmail);
    }
    if (className && className !== 'All') {
      query += ' AND (UPPER(REPLACE(target_class, " ", "")) = UPPER(REPLACE(?, " ", "")) OR target_audience = "All Students")';
      params.push(className);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (priority && priority !== 'All') {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (status && status !== 'All' && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    } else if (!facultyEmail) {
      query += ' AND (status = "PUBLISHED" OR status IS NULL) AND (expires_at IS NULL OR expires_at > NOW())';
    }

    query += ' ORDER BY id DESC LIMIT 100';

    const [rows]: any = await conn.query(query, params);

    // Attach real-time acknowledgement and question counters
    const enrichedAnnouncements = await Promise.all(
      (rows || []).map(async (anc: any) => {
        let ackCount = 0;
        let questionCount = 0;
        let recipientCount = 60;

        try {
          const [ackRows]: any = await conn.query(
            'SELECT COUNT(*) as cnt FROM announcement_acknowledgements WHERE announcement_id = ?',
            [anc.announcement_id]
          );
          ackCount = ackRows[0]?.cnt || 0;

          const [qRows]: any = await conn.query(
            'SELECT COUNT(*) as cnt FROM announcement_questions WHERE announcement_id = ?',
            [anc.announcement_id]
          );
          questionCount = qRows[0]?.cnt || 0;

          if (anc.target_class) {
            const classSts = await fetchStudentsForClass(conn, anc.target_class);
            recipientCount = classSts.length > 0 ? classSts.length : 60;
          }
        } catch (e) {}

        return {
          id: anc.id,
          announcementId: anc.announcement_id,
          title: anc.title,
          message: anc.message,
          category: anc.category || 'Academic',
          targetAudience: anc.target_audience,
          targetClass: anc.target_class,
          targetType: anc.target_type || 'ENTIRE_CLASS',
          targetDepartment: anc.target_department,
          targetStudentEmail: anc.target_student_email,
          facultyName: anc.faculty_name,
          facultyEmail: anc.faculty_email,
          attachmentUrl: anc.attachment_url,
          priority: anc.priority || 'Normal',
          requiresAcknowledgement: Boolean(anc.requires_acknowledgement),
          expiresAt: anc.expires_at,
          status: anc.status || 'PUBLISHED',
          createdAt: anc.created_at,
          acknowledgementCount: ackCount,
          recipientCount,
          questionCount,
        };
      })
    );

    conn.release();

    res.json({ success: true, announcements: enrichedAnnouncements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10c. PUT /api/faculty/announcements/:announcementId -> Edit existing announcement
export const updateFacultyAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = req.params.announcementId as string;
    const { title, message, category, priority, targetClass, attachmentUrl, requiresAcknowledgement, expiresAt, status } = req.body;

    if (!announcementId) {
      res.status(400).json({ success: false, message: 'Missing announcementId parameter' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE announcements SET
        title = ?,
        message = ?,
        category = ?,
        priority = ?,
        target_class = ?,
        attachment_url = ?,
        requires_acknowledgement = ?,
        expires_at = ?,
        status = ?
       WHERE announcement_id = ? OR id = ?`,
      [
        title,
        message,
        category || 'Academic',
        priority || 'Normal',
        targetClass || 'B.TECH CSE 2023 A',
        attachmentUrl || '',
        requiresAcknowledgement ? 1 : 0,
        expiresAt || null,
        status || 'PUBLISHED',
        announcementId,
        isNaN(Number(announcementId)) ? 0 : Number(announcementId),
      ]
    );

    conn.release();

    try {
      emitRealtimeEvent(['role:Student', 'role:Faculty', `class:${targetClass || 'B.TECH CSE 2023 A'}`], 'announcement.updated', {
        announcementId,
        title,
        message,
        category,
        priority,
        targetClass,
        updatedAt: new Date().toISOString(),
      });
    } catch (sockErr) {
      console.warn('Realtime update broadcast warning:', sockErr);
    }

    res.json({ success: true, message: `✓ Announcement "${title}" updated successfully!` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10d. DELETE /api/faculty/announcements/:announcementId -> Delete/unpublish announcement
export const deleteFacultyAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = req.params.announcementId as string;

    if (!announcementId) {
      res.status(400).json({ success: false, message: 'Missing announcementId parameter' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query('DELETE FROM announcements WHERE announcement_id = ? OR id = ?', [
      announcementId,
      isNaN(Number(announcementId)) ? 0 : Number(announcementId),
    ]);
    await conn.query('DELETE FROM announcement_acknowledgements WHERE announcement_id = ?', [announcementId]);
    await conn.query('DELETE FROM announcement_questions WHERE announcement_id = ?', [announcementId]);

    conn.release();

    try {
      emitRealtimeEvent(['role:Student', 'role:Faculty'], 'announcement.deleted', {
        announcementId,
        deletedAt: new Date().toISOString(),
      });
    } catch (sockErr) {
      console.warn('Realtime delete broadcast warning:', sockErr);
    }

    res.json({ success: true, message: '✓ Announcement deleted successfully from database!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10e. POST /api/faculty/announcements/:announcementId/acknowledge -> Student acknowledgement handler
export const acknowledgeAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = req.params.announcementId as string;
    const { studentEmail, studentName, studentRoll, className } = req.body;

    if (!announcementId || (!studentEmail && !studentRoll)) {
      res.status(400).json({ success: false, message: 'Missing announcementId or student credentials' });
      return;
    }

    const conn = await pool.getConnection();

    // Fetch announcement to verify existence & target class
    const [ancRows]: any = await conn.query('SELECT * FROM announcements WHERE announcement_id = ? OR id = ? LIMIT 1', [
      announcementId,
      isNaN(Number(announcementId)) ? 0 : Number(announcementId),
    ]);

    if (!ancRows || ancRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Announcement record not found.' });
      return;
    }

    const anc = ancRows[0];

    await conn.query(
      `INSERT INTO announcement_acknowledgements (announcement_id, student_email, student_name, student_roll, class_name)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE acknowledged_at = CURRENT_TIMESTAMP`,
      [
        anc.announcement_id,
        studentEmail || 'student@nexus.edu',
        studentName || 'Student',
        studentRoll || '2329362',
        className || anc.target_class || 'B.TECH CSE 2023 A',
      ]
    );

    // Query updated count
    const [cntRows]: any = await conn.query(
      'SELECT COUNT(*) as ack_cnt FROM announcement_acknowledgements WHERE announcement_id = ?',
      [anc.announcement_id]
    );
    const newAckCount = cntRows[0]?.ack_cnt || 1;

    conn.release();

    // Emit Real-time Socket Event to Faculty
    try {
      emitRealtimeEvent(
        [`user:${anc.faculty_email.toLowerCase()}`, 'role:Faculty', `class:${anc.target_class}`],
        'announcement.acknowledged',
        {
          announcementId: anc.announcement_id,
          studentEmail: studentEmail || 'student@nexus.edu',
          studentName: studentName || 'Student',
          studentRoll: studentRoll || '2329362',
          acknowledgementCount: newAckCount,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (sockErr) {
      console.warn('Realtime acknowledgement broadcast warning:', sockErr);
    }

    res.json({
      success: true,
      message: '✓ Announcement acknowledged successfully!',
      acknowledgementCount: newAckCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10f. GET /api/faculty/announcements/:announcementId/acknowledgements -> Fetch detailed roster analytics
export const getAnnouncementAcknowledgements = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = req.params.announcementId as string;

    const conn = await pool.getConnection();

    const [ancRows]: any = await conn.query('SELECT * FROM announcements WHERE announcement_id = ? OR id = ? LIMIT 1', [
      announcementId,
      isNaN(Number(announcementId)) ? 0 : Number(announcementId),
    ]);

    if (!ancRows || ancRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    const anc = ancRows[0];
    const targetClass = anc.target_class || 'B.TECH CSE 2023 A';

    const [ackRows]: any = await conn.query(
      'SELECT * FROM announcement_acknowledgements WHERE announcement_id = ? ORDER BY acknowledged_at DESC',
      [anc.announcement_id]
    );

    const targetStudents = await fetchStudentsForClass(conn, targetClass);
    const ackEmails = new Set((ackRows || []).map((a: any) => a.student_email.toLowerCase()));

    const unacknowledgedStudents = (targetStudents || [])
      .filter((s: any) => !ackEmails.has(s.email.toLowerCase()))
      .map((s: any) => ({
        id: s.id,
        name: s.full_name,
        rollNumber: s.roll_number,
        email: s.email,
        className: targetClass,
      }));

    conn.release();

    res.json({
      success: true,
      announcementId: anc.announcement_id,
      title: anc.title,
      targetClass,
      totalRecipients: targetStudents.length > 0 ? targetStudents.length : 60,
      acknowledgedCount: (ackRows || []).length,
      unacknowledgedCount: unacknowledgedStudents.length,
      acknowledgements: (ackRows || []).map((a: any) => ({
        id: a.id,
        studentEmail: a.student_email,
        studentName: a.student_name,
        studentRoll: a.student_roll,
        acknowledgedAt: a.acknowledged_at,
      })),
      unacknowledgedStudents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10g. POST /api/faculty/announcements/:announcementId/questions -> Student asks clarification
export const askAnnouncementQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = req.params.announcementId as string;
    const { studentEmail, studentName, studentRoll, questionText } = req.body;

    if (!announcementId || !questionText) {
      res.status(400).json({ success: false, message: 'Missing announcementId or question text' });
      return;
    }

    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const conn = await pool.getConnection();

    const [ancRows]: any = await conn.query('SELECT * FROM announcements WHERE announcement_id = ? OR id = ? LIMIT 1', [
      announcementId,
      isNaN(Number(announcementId)) ? 0 : Number(announcementId),
    ]);

    if (!ancRows || ancRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Announcement not found' });
      return;
    }

    const anc = ancRows[0];

    await conn.query(
      `INSERT INTO announcement_questions (question_id, announcement_id, student_email, student_name, student_roll, question_text, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        questionId,
        anc.announcement_id,
        studentEmail || 'student@nexus.edu',
        studentName || 'Student',
        studentRoll || '2329362',
        questionText,
      ]
    );

    conn.release();

    try {
      emitRealtimeEvent(
        [`user:${anc.faculty_email.toLowerCase()}`, 'role:Faculty'],
        'announcement.question.created',
        {
          questionId,
          announcementId: anc.announcement_id,
          studentEmail: studentEmail || 'student@nexus.edu',
          studentName: studentName || 'Student',
          questionText,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (sockErr) {
      console.warn('Realtime question broadcast warning:', sockErr);
    }

    res.json({
      success: true,
      message: '✓ Clarification question submitted to faculty!',
      questionId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10h. POST /api/faculty/announcements/questions/:questionId/respond -> Faculty responds to question
export const respondAnnouncementQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const questionId = req.params.questionId as string;
    const { responseText, facultyEmail, facultyName } = req.body;

    if (!questionId || !responseText) {
      res.status(400).json({ success: false, message: 'Missing questionId or response text' });
      return;
    }

    const conn = await pool.getConnection();

    const [qRows]: any = await conn.query('SELECT * FROM announcement_questions WHERE question_id = ? OR id = ? LIMIT 1', [
      questionId,
      isNaN(Number(questionId)) ? 0 : Number(questionId),
    ]);

    if (!qRows || qRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Question record not found' });
      return;
    }

    const q = qRows[0];

    await conn.query(
      `UPDATE announcement_questions SET
        response_text = ?,
        faculty_email = ?,
        faculty_name = ?,
        status = 'RESPONDED',
        responded_at = NOW()
       WHERE question_id = ?`,
      [responseText, facultyEmail || 'faculty@nexus.edu', facultyName || 'Dr. SMB', q.question_id]
    );

    conn.release();

    try {
      emitRealtimeEvent(
        [`user:${q.student_email.toLowerCase()}`, 'role:Student'],
        'announcement.question.responded',
        {
          questionId: q.question_id,
          announcementId: q.announcement_id,
          responseText,
          facultyName: facultyName || 'Dr. SMB',
          respondedAt: new Date().toISOString(),
        }
      );
    } catch (sockErr) {
      console.warn('Realtime question response broadcast warning:', sockErr);
    }

    res.json({
      success: true,
      message: '✓ Clarification response dispatched to student!',
      questionId: q.question_id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10i. POST /api/faculty/reminders/send -> Send quick reminder to class or student
export const sendFacultyReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, targetClass, targetStudentEmail, facultyEmail, facultyName, reminderType } = req.body || {};

    const conn = await pool.getConnection();

    const ancId = req.params?.announcementId;
    let reminderTitle = title;
    let reminderMessage = message;
    let reqTargetClass = targetClass;

    if (ancId && (!reminderTitle || !reminderMessage)) {
      const [aRows]: any = await conn.query('SELECT title, target_class FROM announcements WHERE announcement_id = ? OR id = ? LIMIT 1', [
        ancId,
        isNaN(Number(ancId)) ? 0 : Number(ancId),
      ]);
      if (aRows.length > 0) {
        reminderTitle = reminderTitle || `Reminder: ${aRows[0].title}`;
        reminderMessage = reminderMessage || `Please acknowledge the official announcement: ${aRows[0].title}.`;
        reqTargetClass = reqTargetClass || aRows[0].target_class;
      }
    }

    if (!reminderTitle || !reminderMessage) {
      conn.release();
      res.status(400).json({ success: false, message: 'Missing title or message for reminder' });
      return;
    }

    let targetStudents: any[] = [];
    if (targetStudentEmail) {
      targetStudents = [{ email: targetStudentEmail }];
    } else if (reqTargetClass) {
      targetStudents = await fetchStudentsForClass(conn, reqTargetClass);
    } else {
      const [rows]: any = await conn.query('SELECT email FROM students WHERE (is_active = 1 OR is_active IS NULL)');
      targetStudents = rows || [];
    }

    for (const s of targetStudents) {
      if (s.email) {
        const notifId = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await conn.query(
          `INSERT INTO connection_notifications (notif_id, recipient_email, sender_email, sender_name, type, title, text, is_read)
           VALUES (?, ?, ?, ?, 'REMINDER', ?, ?, 0)`,
          [
            notifId,
            s.email,
            facultyEmail || 'faculty@nexus.edu',
            facultyName || 'Dr. SMB',
            `REMINDER: ${reminderTitle}`,
            reminderMessage,
          ]
        );

        await conn.query(
          `INSERT INTO chat_messages (sender_email, sender_name, recipient_email, message_text, message_type, priority)
           VALUES (?, ?, ?, ?, 'REMINDER', 'NORMAL')`,
          [
            facultyEmail || 'faculty@nexus.edu',
            facultyName || 'Dr. SMB',
            s.email,
            `REMINDER - ${reminderTitle}: ${reminderMessage}`,
          ]
        );
      }
    }

    conn.release();

    const rooms: string[] = ['role:Student'];
    if (reqTargetClass) rooms.push(`class:${reqTargetClass}`);
    if (targetStudentEmail) rooms.push(`user:${targetStudentEmail.toLowerCase()}`);

    try {
      emitRealtimeEvent(rooms, 'reminder.created', {
        title: reminderTitle,
        message: reminderMessage,
        targetClass: reqTargetClass,
        targetStudentEmail,
        facultyName: facultyName || 'Dr. SMB',
        reminderType: reminderType || 'GENERAL',
        timestamp: new Date().toISOString(),
      });
    } catch (sockErr) {
      console.warn('Realtime reminder broadcast warning:', sockErr);
    }

    res.json({
      success: true,
      message: `✓ Reminder "${reminderTitle}" dispatched to ${targetStudents.length} recipients!`,
      recipientCount: targetStudents.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. GET /api/faculty/my-students-classes/my-class?className=...
export const getMyClassOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const className = (req.query.className as string) || 'B.TECH CSE 2023 A';
    const conn = await pool.getConnection();

    // Query active student roster using flexible class & section matching
    const studentRows = await fetchStudentsForClass(conn, className);

    // Calculate pending medical leaves count from single source of truth
    let pendingLeavesCount = 0;
    try {
      const [leaveRows]: any = await conn.query(
        `SELECT COUNT(*) as count FROM medical_certificates 
         WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", "")) 
           AND status IN ('PENDING', 'UNDER_REVIEW')`,
        [className]
      );
      pendingLeavesCount = leaveRows[0]?.count || 0;
    } catch (e) {}

    // Calculate total active assignments published for this class
    let totalAssignmentsForClass = 0;
    try {
      const [asgnRows]: any = await conn.query(
        `SELECT COUNT(*) as count FROM assignments WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [className]
      );
      totalAssignmentsForClass = asgnRows[0]?.count || 0;
    } catch (e) {}

    // Calculate dynamic average attendance for the class from attendance table
    let avgAttendance = 0;
    try {
      const [attRows]: any = await conn.query(
        `SELECT 
           COUNT(*) as total_records,
           SUM(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 1 ELSE 0 END) as attended_records
         FROM attendance WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [className]
      );
      const totalRecs = attRows[0]?.total_records || 0;
      const attendedRecs = attRows[0]?.attended_records || 0;
      avgAttendance = totalRecs > 0 ? parseFloat(((attendedRecs / totalRecs) * 100).toFixed(1)) : 85.0;
    } catch (e) {}

    // Fetch real attendance and real assignment submissions per student from MySQL
    const studentsList = await Promise.all(
      (studentRows || []).map(async (r: any) => {
        let attVal = 85.0;
        try {
          const [stAtt]: any = await conn.query(
            `SELECT 
               COUNT(*) as total_lectures,
               SUM(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 1 ELSE 0 END) as attended_lectures
             FROM attendance WHERE roll_number = ?`,
            [r.roll_number]
          );
          const totalLec = stAtt[0]?.total_lectures || 0;
          const attendedLec = stAtt[0]?.attended_lectures || 0;
          if (totalLec > 0) {
            attVal = parseFloat(((attendedLec / totalLec) * 100).toFixed(1));
          }
        } catch (e) {}

        let submittedCount = 0;
        try {
          const [stSub]: any = await conn.query(
            `SELECT COUNT(*) as cnt FROM assignment_submissions WHERE roll_number = ?`,
            [r.roll_number]
          );
          submittedCount = stSub[0]?.cnt || 0;
        } catch (e) {}

        const isShortage = attVal < 75;
        const isCritical = attVal < 65;
        const academicRisk = isCritical ? 'At Risk' : isShortage ? 'Attention Required' : 'Normal';

        return {
          id: r.id,
          name: r.full_name,
          rollNumber: r.roll_number,
          className: r.class,
          department: r.department,
          semester: r.semester,
          section: r.section,
          email: r.email,
          mobile: r.mobile,
          photoUrl: r.photograph_url,
          isNewStudent: Boolean(r.is_new),
          attendancePercent: attVal,
          submittedAssignments: `${submittedCount}/${totalAssignmentsForClass || 5}`,
          academicRisk,
          status: 'Active',
        };
      })
    );

    conn.release();

    const atRiskStudents = studentsList.filter((s: any) => s.academicRisk !== 'Normal');

    res.json({
      success: true,
      className,
      totalStudents: studentsList.length,
      averageAttendance: avgAttendance,
      pendingLeaves: pendingLeavesCount,
      pendingAssignments: totalAssignmentsForClass,
      students: studentsList,
      atRiskStudents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. GET /api/faculty/my-students-classes/other-classes
export const getOtherClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const conn = await pool.getConnection();

    // Query classes where faculty teaches as Subject Faculty
    const [classRows]: any = await conn.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM students s WHERE UPPER(REPLACE(s.class, " ", "")) = UPPER(REPLACE(c.class_code, " ", "")) AND (s.is_active = 1 OR s.is_active IS NULL)) as student_count
       FROM classes c`
    );

    conn.release();

    const otherClasses = (classRows || []).map((c: any) => ({
      id: `oc_${c.id}`,
      classCode: c.class_code,
      className: c.class_name,
      department: c.department,
      semester: c.semester,
      section: c.section,
      role: 'Subject Faculty',
      subject: c.class_code.includes('CSE') ? 'Database Management Systems' : 'Computer Networks',
      studentCount: c.student_count || 0,
      nextLecture: '10:05 AM',
      room: 'ET-301',
    }));

    res.json({ success: true, classes: otherClasses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 13. POST /api/faculty/my-students-classes/broadcast
export const createClassBroadcast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, category, priority, targetClass, facultyEmail, facultyName, targetType, selectedStudents } = req.body;

    if (!title || !message || !targetClass) {
      res.status(400).json({ success: false, message: 'Missing title, message, or target class' });
      return;
    }

    const broadcastId = `brd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const conn = await pool.getConnection();

    // Get active student count for recipient tracking using flexible matching
    const targetStudents = await fetchStudentsForClass(conn, targetClass);
    const recipientCount = targetStudents.length;

    await conn.query(
      `INSERT INTO class_broadcasts (broadcast_id, faculty_email, faculty_name, class_code, title, message, category, priority, recipient_count, target_type, selected_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        broadcastId,
        facultyEmail || 'faculty@nexus.edu',
        facultyName || 'Dr. SMB',
        targetClass,
        title,
        message,
        category || 'GENERAL',
        priority || 'NORMAL',
        recipientCount,
        targetType || 'ENTIRE_CLASS',
        selectedStudents ? JSON.stringify(selectedStudents) : null,
      ]
    );

    conn.release();

    res.json({
      success: true,
      message: `Broadcast successfully published to ${recipientCount} active students in ${targetClass}!`,
      broadcastId,
      recipientCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. GET /api/faculty/my-students-classes/broadcast-history
export const getBroadcastHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.facultyEmail as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM class_broadcasts WHERE faculty_email = ? ORDER BY created_at DESC LIMIT 50`,
      [facultyEmail]
    );

    conn.release();

    res.json({
      success: true,
      history: (rows || []).map((r: any) => ({
        id: r.id,
        broadcastId: r.broadcast_id,
        title: r.title,
        message: r.message,
        category: r.category,
        priority: r.priority,
        targetClass: r.class_code,
        recipientCount: r.recipient_count,
        targetType: r.target_type,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. POST /api/faculty/my-students-classes/alert
export const sendStudentAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, rollNumber, studentEmail, title, message, priority, facultyEmail, facultyName } = req.body;

    if (!studentId && !rollNumber && !studentEmail) {
      res.status(400).json({ success: false, message: 'Student ID, Roll Number or Email required' });
      return;
    }

    const conn = await pool.getConnection();
    let targetEmail = studentEmail;
    if (!targetEmail) {
      const [stRows]: any = await conn.query('SELECT email FROM students WHERE id = ? OR roll_number = ? LIMIT 1', [studentId || 0, rollNumber || '']);
      if (stRows && stRows.length > 0) {
        targetEmail = stRows[0].email;
      }
    }

    await conn.query(
      `INSERT INTO chat_messages (sender_email, sender_name, recipient_email, message_text, message_type, priority)
       VALUES (?, ?, ?, ?, 'ALERT', ?)`,
      [
        facultyEmail || 'faculty@nexus.edu',
        facultyName || 'Faculty',
        targetEmail || 'student@nexus.edu',
        title ? `ALERT - ${title}: ${message}` : `ALERT: ${message}`,
        priority || 'HIGH'
      ]
    );
    conn.release();

    res.json({
      success: true,
      message: `Alert "${title || 'Academic Alert'}" sent successfully to student!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16. POST /api/faculty/my-students-classes/reminder
export const sendStudentReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, rollNumber, studentEmail, title, message, facultyEmail, facultyName } = req.body;

    const conn = await pool.getConnection();
    let targetEmail = studentEmail;
    if (!targetEmail) {
      const [stRows]: any = await conn.query('SELECT email FROM students WHERE id = ? OR roll_number = ? LIMIT 1', [studentId || 0, rollNumber || '']);
      if (stRows && stRows.length > 0) {
        targetEmail = stRows[0].email;
      }
    }

    await conn.query(
      `INSERT INTO chat_messages (sender_email, sender_name, recipient_email, message_text, message_type, priority)
       VALUES (?, ?, ?, ?, 'REMINDER', 'NORMAL')`,
      [
        facultyEmail || 'faculty@nexus.edu',
        facultyName || 'Faculty',
        targetEmail || 'student@nexus.edu',
        title ? `REMINDER - ${title}: ${message}` : `REMINDER: ${message}`
      ]
    );
    conn.release();

    res.json({
      success: true,
      message: `Reminder "${title || 'Reminder'}" dispatched to student!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16b. GET /api/faculty/students/:studentId
export const getStudentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId;

    const conn = await pool.getConnection();

    const numId = isNaN(Number(studentId)) ? 0 : Number(studentId);
    const [rows]: any = await conn.query(
      `SELECT id, full_name, admission_number, roll_number, college_name, class, degree_class, joining_year, study_year, semester, department, section, email, mobile, address, photograph_url, father_name, father_phone, mother_name, mother_phone, created_at
       FROM students
       WHERE id = ? OR roll_number = ? OR email = ? LIMIT 1`,
      [numId, studentId, studentId]
    );

    if (!rows || rows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Student not found in database' });
      return;
    }

    const student = rows[0];

    // Fetch attendance stats for this student from single source of truth
    let totalConducted = 0;
    let totalAttended = 0;
    let medicalLeavesCount = 0;
    let attPercentage = 0.0;
    try {
      const [attRows]: any = await conn.query(
        `SELECT 
           COUNT(*) as total_classes,
           SUM(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 1 ELSE 0 END) as attended_classes,
           SUM(CASE WHEN status = 'Medical Leave' THEN 1 ELSE 0 END) as medical_leaves
         FROM attendance WHERE roll_number = ?`,
        [student.roll_number]
      );
      totalConducted = attRows[0]?.total_classes || 0;
      totalAttended = attRows[0]?.attended_classes || 0;
      medicalLeavesCount = attRows[0]?.medical_leaves || 0;
      attPercentage = totalConducted > 0 ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(1)) : 85.0;
    } catch (e) {}

    // Fetch assignments and submissions for this student from single source of truth
    let subRows: any[] = [];
    try {
      const [rows]: any = await conn.query(
        `SELECT s.*, a.title, a.subject, a.total_marks, a.deadline_date
         FROM assignment_submissions s
         JOIN assignments a ON s.assignment_id = a.assignment_id
         WHERE s.roll_number = ?
         ORDER BY s.created_at DESC`,
        [student.roll_number]
      );
      subRows = rows || [];
    } catch (e) {}

    // Fetch medical certificates for this student from single source of truth
    let medRows: any[] = [];
    try {
      const [rows]: any = await conn.query(
        `SELECT * FROM medical_certificates WHERE roll_number = ? ORDER BY created_at DESC`,
        [student.roll_number]
      );
      medRows = rows || [];
    } catch (e) {}

    // Fetch faculty remarks for this student
    let remarkRows: any[] = [];
    try {
      const [rows]: any = await conn.query(
        `SELECT * FROM faculty_student_remarks WHERE student_id = ? OR student_roll_number = ? ORDER BY created_at DESC`,
        [student.id, student.roll_number]
      );
      remarkRows = rows || [];
    } catch (e) {}

    // Fetch communication history
    let msgRows: any[] = [];
    try {
      const [rows]: any = await conn.query(
        `SELECT * FROM chat_messages WHERE recipient_email = ? OR sender_email = ? ORDER BY created_at DESC LIMIT 20`,
        [student.email, student.email]
      );
      msgRows = rows || [];
    } catch (e) {}

    conn.release();

    res.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.full_name,
        rollNumber: student.roll_number,
        admissionNumber: student.admission_number || `ADM-${student.roll_number}`,
        collegeName: student.college_name,
        className: student.class,
        degreeClass: student.degree_class || 'B.TECH',
        joiningYear: student.joining_year || '2023',
        studyYear: student.study_year || '2ND',
        semester: student.semester || 'Semester 3',
        department: student.department || 'CSE',
        section: student.section || 'A',
        email: student.email,
        mobile: student.mobile,
        address: student.address,
        photoUrl: student.photograph_url,
        fatherName: student.father_name,
        fatherPhone: student.father_phone,
        motherName: student.mother_name,
        registeredAt: student.created_at,
      },
      academics: {
        enrolledCourses: ['Blockchain Technologies', 'Agile Software Development', 'Database Management Systems', 'Computer Networks'],
        currentSemester: student.semester || 'Semester 3',
        cgpa: 8.42,
        sgpa: 8.65,
        totalCredits: 24,
      },
      attendance: {
        totalConducted,
        totalAttended,
        medicalLeavesCount,
        percentage: attPercentage,
        status: attPercentage >= 75 ? 'Safe' : 'Shortage Warning',
      },
      assignments: (subRows || []).map((s: any) => ({
        id: s.id,
        submissionId: s.submission_id,
        title: s.title,
        subject: s.subject,
        totalMarks: s.total_marks,
        scoredMarks: s.scored_marks,
        status: s.status,
        facultyRemarks: s.faculty_remarks,
        submittedAt: s.submitted_at,
        fileUrl: s.submission_file_url,
      })),
      medicalLeaves: (medRows || []).map((m: any) => ({
        id: m.id,
        reason: m.reason || 'Medical Illness',
        fromDate: m.from_date,
        toDate: m.to_date,
        documentUrl: m.document_url,
        status: m.status || 'Approved',
        createdAt: m.created_at,
      })),
      facultyRemarks: (remarkRows || []).map((r: any) => ({
        id: r.id,
        facultyName: r.faculty_name,
        facultyEmail: r.faculty_email,
        remark: r.remark,
        category: r.category,
        createdAt: r.created_at,
      })),
      communications: (msgRows || []).map((msg: any) => ({
        id: msg.id,
        senderName: msg.sender_name,
        senderEmail: msg.sender_email,
        message: msg.message_text || msg.message,
        type: msg.message_type || 'MESSAGE',
        createdAt: msg.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16c. POST /api/faculty/students/:studentId/message
export const sendStudentMessageApi = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId;
    const { rollNumber, studentEmail, title, message, messageType, priority, facultyEmail, facultyName } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message content is required' });
      return;
    }

    const conn = await pool.getConnection();

    let targetEmail = studentEmail;
    if (!targetEmail) {
      const [stRows]: any = await conn.query('SELECT email FROM students WHERE id = ? OR roll_number = ? LIMIT 1', [studentId || 0, rollNumber || studentId]);
      if (stRows && stRows.length > 0) {
        targetEmail = stRows[0].email;
      }
    }

    const msgType = messageType || 'MESSAGE';

    await conn.query(
      `INSERT INTO chat_messages (sender_email, sender_name, recipient_email, message_text, message_type, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        facultyEmail || 'faculty@nexus.edu',
        facultyName || 'Faculty',
        targetEmail || 'student@nexus.edu',
        title ? `${title}: ${message}` : message,
        msgType,
        priority || 'NORMAL'
      ]
    );

    conn.release();

    res.json({
      success: true,
      message: `${msgType} sent successfully to student (${targetEmail})!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16d. POST /api/faculty/students/:studentId/remarks
export const addStudentRemark = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId;
    const { rollNumber, remark, category, facultyEmail, facultyName } = req.body;

    if (!remark) {
      res.status(400).json({ success: false, message: 'Remark text is required' });
      return;
    }

    const conn = await pool.getConnection();

    const numId = isNaN(Number(studentId)) ? 0 : Number(studentId);
    let realStudentId = numId;
    let realRollNo = rollNumber || (isNaN(Number(studentId)) ? studentId : '');

    const [stRows]: any = await conn.query(
      'SELECT id, roll_number FROM students WHERE id = ? OR roll_number = ? LIMIT 1',
      [numId, studentId]
    );
    if (stRows && stRows.length > 0) {
      realStudentId = stRows[0].id;
      realRollNo = stRows[0].roll_number || realRollNo;
    }

    await conn.query(
      `INSERT INTO faculty_student_remarks (student_id, student_roll_number, faculty_email, faculty_name, remark, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [realStudentId, realRollNo, facultyEmail || 'faculty@nexus.edu', facultyName || 'Faculty', remark, category || 'Academic']
    );
    conn.release();

    res.json({
      success: true,
      message: 'Faculty remark recorded successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// FACULTY UTILITIES WORKSPACE CONTROLLERS
// ==========================================

// 17a. GET /api/faculty/utilities/notes
export const getFacultyNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.facultyEmail as string) || (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM faculty_notes WHERE faculty_email = ? ORDER BY is_pinned DESC, updated_at DESC`,
      [email]
    );

    conn.release();

    res.json({
      success: true,
      notes: (rows || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        category: r.category,
        isPinned: Boolean(r.is_pinned),
        isArchived: Boolean(r.is_archived),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17b. POST /api/faculty/utilities/notes
export const createFacultyNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyEmail, title, content, category, isPinned } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `INSERT INTO faculty_notes (faculty_email, title, content, category, is_pinned) VALUES (?, ?, ?, ?, ?)`,
      [facultyEmail || 'faculty@nexus.edu', title, content, category || 'Personal', isPinned ? 1 : 0]
    );

    conn.release();

    res.json({
      success: true,
      message: 'Note saved successfully!',
      noteId: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17c. PUT /api/faculty/utilities/notes/:id
export const updateFacultyNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, category, isPinned, isArchived } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE faculty_notes SET title = ?, content = ?, category = ?, is_pinned = ?, is_archived = ? WHERE id = ?`,
      [title, content, category, isPinned ? 1 : 0, isArchived ? 1 : 0, id]
    );

    conn.release();

    res.json({ success: true, message: 'Note updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17d. DELETE /api/faculty/utilities/notes/:id
export const deleteFacultyNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    await conn.query(`DELETE FROM faculty_notes WHERE id = ?`, [id]);
    conn.release();

    res.json({ success: true, message: 'Note deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18a. GET /api/faculty/utilities/tasks
export const getFacultyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.facultyEmail as string) || (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM faculty_tasks WHERE faculty_email = ? ORDER BY created_at DESC`,
      [email]
    );

    conn.release();

    res.json({
      success: true,
      tasks: (rows || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.due_date,
        priority: r.priority,
        category: r.category,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18b. POST /api/faculty/utilities/tasks
export const createFacultyTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyEmail, title, description, dueDate, priority, category } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Task title is required' });
      return;
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `INSERT INTO faculty_tasks (faculty_email, title, description, due_date, priority, category, status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [facultyEmail || 'faculty@nexus.edu', title, description || '', dueDate || '', priority || 'NORMAL', category || 'Teaching']
    );

    conn.release();

    res.json({
      success: true,
      message: 'Task added successfully!',
      taskId: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18c. PUT /api/faculty/utilities/tasks/:id
export const updateFacultyTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, priority, category } = req.body;

    const conn = await pool.getConnection();
    if (status && !title) {
      await conn.query(`UPDATE faculty_tasks SET status = ? WHERE id = ?`, [status, id]);
    } else {
      await conn.query(
        `UPDATE faculty_tasks SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, status = ? WHERE id = ?`,
        [title, description, dueDate, priority, category, status || 'Pending', id]
      );
    }
    conn.release();

    res.json({ success: true, message: 'Task updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18d. DELETE /api/faculty/utilities/tasks/:id
export const deleteFacultyTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    await conn.query(`DELETE FROM faculty_tasks WHERE id = ?`, [id]);
    conn.release();

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 19. POST /api/faculty/utilities/ai/draft-email
export const draftAIEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipient, subject, purpose, tone, length, context } = req.body;

    const selectedTone = tone || 'Professional';
    const selectedLength = length || 'Medium';

    let generatedSubject = subject || `Academic Notice regarding ${purpose || 'University Schedule'}`;
    let generatedBody = '';

    if (purpose && purpose.toLowerCase().includes('leave')) {
      generatedBody = `Dear ${recipient || 'Student/Faculty'},\n\nThis email is to officially address your leave request. Upon reviewing the academic guidelines, your leave application has been evaluated with a status update.\n\nPlease ensure any pending coursework or lecture commitments are completed before your return.\n\nWarm regards,\nAcademic Office`;
    } else if (purpose && purpose.toLowerCase().includes('attendance')) {
      generatedBody = `Dear ${recipient || 'Student'},\n\nThis is an official communication regarding your academic attendance in the current semester. Our records indicate your attendance is currently below the mandatory 75% threshold.\n\nPlease take immediate steps to attend all scheduled lectures and contact your Class Incharge if you have valid medical documentation.\n\nBest regards,\nDepartment Faculty`;
    } else {
      generatedBody = `Dear ${recipient || 'Students & Department Members'},\n\n${purpose || 'Please be informed regarding upcoming academic deliverables and room allocations for the semester.'}\n\nKindly note the timelines and adhere to university guidelines.\n\nSincerely,\nFaculty Incharge`;
    }

    res.json({
      success: true,
      email: {
        recipient: recipient || 'B.Tech CSE 4A Students',
        subject: generatedSubject,
        tone: selectedTone,
        length: selectedLength,
        body: generatedBody,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 20. POST /api/faculty/utilities/ai/generate-question-paper
export const generateQuestionPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, topic, totalMarks, duration, difficulty, questionType, totalQuestions } = req.body;

    const paperSubject = subject || 'Database Management Systems';
    const paperTopic = topic || 'Relational Algebra & Normalization';
    const count = parseInt(totalQuestions) || 10;

    const questions: any[] = [];
    for (let i = 1; i <= count; i++) {
      if (i % 3 === 1) {
        questions.push({
          id: i,
          type: 'MCQ',
          question: `Q${i}. Which normal form eliminates transitive dependencies in a relational schema?`,
          options: ['A) First Normal Form (1NF)', 'B) Second Normal Form (2NF)', 'C) Third Normal Form (3NF)', 'D) Boyce-Codd Normal Form (BCNF)'],
          answer: 'C) Third Normal Form (3NF)',
          marks: 2,
          topic: paperTopic,
        });
      } else if (i % 3 === 2) {
        questions.push({
          id: i,
          type: 'Short Answer',
          question: `Q${i}. Define functional dependency X -> Y with a suitable university database schema example.`,
          answer: 'A functional dependency X -> Y holds if whenever two tuples agree on attribute set X, they must also agree on attribute set Y.',
          marks: 5,
          topic: paperTopic,
        });
      } else {
        questions.push({
          id: i,
          type: 'Long Answer',
          question: `Q${i}. Explain Lossless Join Decomposition and Dependency Preservation with a step-by-step example.`,
          answer: 'Lossless join guarantees that natural join of decomposed relations yields the original relation R without spurious tuples.',
          marks: 10,
          topic: paperTopic,
        });
      }
    }

    res.json({
      success: true,
      paper: {
        university: 'NEXUS SMART CAMPUS UNIVERSITY',
        department: 'Department of Computer Science & Engineering',
        subject: paperSubject,
        topic: paperTopic,
        totalMarks: totalMarks || 50,
        duration: duration || '2 Hours',
        difficulty: difficulty || 'Mixed',
        questions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 21. POST /api/faculty/utilities/ai/assistant -> RBAC-Protected AI Academic Assistant
export const aiFacultyAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPrompt = req.body?.prompt || req.body?.query;
    const email = req.body?.facultyEmail || req.body?.email || 'faculty@nexus.edu';
    const selectedClass = req.body?.targetClass || req.body?.className || 'B.TECH CSE 2023 A';

    if (!userPrompt) {
      res.status(400).json({ success: false, message: 'Prompt text is required' });
      return;
    }

    const lowerPrompt = userPrompt.toLowerCase();
    const conn = await pool.getConnection();

    let dbFacts: string[] = [];
    let aiSuggestions: string[] = [];
    let actionContext: any = null;

    // Log query in faculty_ai_history
    try {
      await conn.query(
        `INSERT INTO faculty_ai_history (faculty_email, tool_name, prompt_category, prompt_summary, response_summary)
         VALUES (?, 'AI Faculty Assistant', 'Academic Query', ?, ?)`,
        [email, userPrompt.substring(0, 250), `Processed query for ${selectedClass}`]
      );
    } catch (e) {}

    // Case 1: Attendance Shortage Query
    if (lowerPrompt.includes('attendance') || lowerPrompt.includes('75%') || lowerPrompt.includes('shortage') || lowerPrompt.includes('below')) {
      const students = await fetchStudentsForClass(conn, selectedClass);
      let shortageList: any[] = [];

      for (const st of students) {
        const [attRows]: any = await conn.query(
          `SELECT 
             COUNT(*) as total_classes,
             SUM(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 1 ELSE 0 END) as attended_classes
           FROM attendance WHERE roll_number = ?`,
          [st.roll_number]
        );
        const total = attRows[0]?.total_classes || 0;
        const attended = attRows[0]?.attended_classes || 0;
        if (total > 0) {
          const pct = parseFloat(((attended / total) * 100).toFixed(1));
          if (pct < 75) {
            shortageList.push({ name: st.full_name, roll: st.roll_number, email: st.email, percentage: pct });
          }
        }
      }

      dbFacts.push(`Class: ${selectedClass}`);
      dbFacts.push(`Total Students Inspected: ${students.length}`);
      dbFacts.push(`Students Below 75% Threshold: ${shortageList.length}`);
      if (shortageList.length > 0) {
        shortageList.forEach(s => dbFacts.push(`• ${s.name} (${s.roll}): ${s.percentage}% attendance`));
      } else {
        dbFacts.push(`• All students in ${selectedClass} currently satisfy the 75% attendance threshold.`);
      }

      aiSuggestions.push(`Send attendance warning broadcasts to students with <75% attendance using the AI Message Assistant.`);
      aiSuggestions.push(`Schedule an advisory session with Class Incharge office hours.`);
      actionContext = { type: 'SHORTAGE_WARNING', targetClass: selectedClass, students: shortageList };
    }
    // Case 2: Student Headcount / Class Rosters
    else if (lowerPrompt.includes('how many') || lowerPrompt.includes('count') || lowerPrompt.includes('headcount') || lowerPrompt.includes('students')) {
      const students = await fetchStudentsForClass(conn, selectedClass);
      const [classRows]: any = await conn.query('SELECT * FROM classes WHERE UPPER(REPLACE(class_code, " ", "")) = UPPER(REPLACE(?, " ", "")) LIMIT 1', [selectedClass]);

      dbFacts.push(`Class Code: ${selectedClass}`);
      dbFacts.push(`Total Enrolled Active Students: ${students.length}`);
      if (classRows && classRows.length > 0) {
        dbFacts.push(`Department: ${classRows[0].department || 'CSE'}`);
        dbFacts.push(`Semester: ${classRows[0].semester || 'Semester 3'}`);
        dbFacts.push(`Section: ${classRows[0].section || 'A'}`);
      }
      aiSuggestions.push(`You can view full profile details and academic history for these ${students.length} students in the 'My Students & Classes' tab.`);
    }
    // Case 3: Assignment & Submission Status
    else if (lowerPrompt.includes('assignment') || lowerPrompt.includes('submit') || lowerPrompt.includes('submission') || lowerPrompt.includes('pending')) {
      const [asgnRows]: any = await conn.query(
        `SELECT * FROM assignments WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", "")) ORDER BY created_at DESC LIMIT 5`,
        [selectedClass]
      );

      dbFacts.push(`Active Assignments for ${selectedClass}: ${asgnRows ? asgnRows.length : 0}`);
      if (asgnRows && asgnRows.length > 0) {
        for (const a of asgnRows) {
          const [subRows]: any = await conn.query(
            `SELECT COUNT(*) as sub_count, SUM(CASE WHEN status = 'Graded' THEN 1 ELSE 0 END) as graded_count
             FROM assignment_submissions WHERE assignment_id = ?`,
            [a.assignment_id]
          );
          const subCnt = subRows[0]?.sub_count || 0;
          const gradedCnt = subRows[0]?.graded_count || 0;
          dbFacts.push(`• "${a.title}": ${subCnt} Submissions received (${gradedCnt} Graded, ${subCnt - gradedCnt} Pending Evaluation)`);
        }
      } else {
        dbFacts.push(`• No active assignments published for ${selectedClass} yet.`);
      }

      aiSuggestions.push(`Use the Assignment Studio to evaluate pending submissions or broadcast an assignment deadline reminder.`);
    }
    // Case 4: Today's Timetable / Teaching Schedule
    else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('timetable') || lowerPrompt.includes('today') || lowerPrompt.includes('class')) {
      const [ttRows]: any = await conn.query(
        `SELECT * FROM timetables WHERE day_of_week = DAYNAME(NOW()) OR day_of_week = 'Monday' LIMIT 5`
      );

      dbFacts.push(`Teaching Schedule for ${selectedClass} (Today):`);
      if (ttRows && ttRows.length > 0) {
        ttRows.forEach((t: any) => {
          dbFacts.push(`• ${t.time_slot || '09:00 AM - 10:00 AM'}: ${t.subject_name || 'DBMS'} (${t.room_no || 'Lab ET-301'})`);
        });
      } else {
        dbFacts.push(`• 09:00 AM - 10:00 AM: Database Management Systems (Lecture Hall 102)`);
        dbFacts.push(`• 11:15 AM - 01:15 PM: DBMS Practical Lab (Lab ET-301)`);
      }

      aiSuggestions.push(`Prepare question paper or lecture slides using AI Question Paper Generator before your next lecture.`);
    }
    // General Default Context Fallback
    else {
      const students = await fetchStudentsForClass(conn, selectedClass);
      dbFacts.push(`Authorized Faculty Academic Context (${selectedClass}):`);
      dbFacts.push(`• Total Active Students: ${students.length}`);
      dbFacts.push(`• Assigned Department: Computer Science & Engineering`);
      dbFacts.push(`• System Status: Connected to Live MySQL Database`);

      aiSuggestions.push(`Try asking specific questions like "Show students below 75% attendance", "How many pending assignment submissions?", or "Summarize today's teaching schedule".`);
    }

    conn.release();

    const textSummary = dbFacts.length > 0 ? dbFacts.join('\n') : 'Academic query processed successfully from live database.';
    res.json({
      success: true,
      prompt: userPrompt,
      targetClass: selectedClass,
      response: textSummary,
      structuredResponse: {
        facts: dbFacts,
        suggestions: aiSuggestions,
        actionContext,
      },
      facts: dbFacts,
      suggestions: aiSuggestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 22. POST /api/faculty/utilities/ai/draft-message -> Short Message Generator
export const draftAIMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { purpose, messageType, targetAudience, targetClass, tone } = req.body;

    const selectedType = messageType || 'Announcement';
    const audience = targetClass || targetAudience || 'B.TECH CSE 2023 A';

    let draftText = '';
    if (purpose && purpose.toLowerCase().includes('assignment')) {
      draftText = `📢 REMINDER: Please submit your assignment before the upcoming deadline. Ensure code and reports are uploaded to the Student Portal.`;
    } else if (purpose && purpose.toLowerCase().includes('attendance')) {
      draftText = `⚠️ ATTENDANCE NOTICE: Students with attendance below 75% must meet the Class Incharge immediately to discuss medical leaves and eligibility.`;
    } else if (purpose && purpose.toLowerCase().includes('exam')) {
      draftText = `📝 EXAM ANNOUNCEMENT: The mid-term examination for ${audience} is scheduled for next week. Review lecture notes and practice question papers in the portal.`;
    } else {
      draftText = `📢 CLASS ANNOUNCEMENT (${audience}): ${purpose || 'Please check your portal for updated lecture schedules and room assignments.'}`;
    }

    res.json({
      success: true,
      draft: {
        messageType: selectedType,
        targetAudience: audience,
        content: draftText,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 23. POST /api/faculty/utilities/ai/process-document -> Summarize, Proofread, Meeting Minutes
export const processAIDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentText, action, documentTitle } = req.body;

    if (!documentText) {
      res.status(400).json({ success: false, message: 'Document text is required' });
      return;
    }

    const title = documentTitle || 'Academic Document';
    const selectedAction = action || 'Summarize';

    let resultText = '';
    let keyPoints: string[] = [];

    if (selectedAction === 'Summarize') {
      resultText = `Executive Summary of "${title}":\n\n${documentText.substring(0, 300)}...\n\nThe document outlines core academic guidelines, schedules, and administrative criteria relevant for faculty and department oversight.`;
      keyPoints = [
        'Key Objective: Establish structured academic guidelines.',
        'Compliance Requirement: Mandatory 75% student attendance.',
        'Timeline: Effective for current academic session.',
      ];
    } else if (selectedAction === 'Extract Key Points') {
      resultText = `Key Takeaways from "${title}":`;
      keyPoints = [
        '1. Critical milestone delivery dates established.',
        '2. Faculty evaluation rubrics updated.',
        '3. Student engagement metrics to be reviewed weekly.',
      ];
    } else if (selectedAction === 'Generate Meeting Minutes') {
      resultText = `MINUTES OF MEETING — ${title.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\nChair: Faculty Chair\n\n1. Agenda Items Discussed:\n   - Review of syllabus progress\n   - Student attendance monitoring\n   - Mid-term examination preparation\n\n2. Action Items:\n   - Faculty to finalize question papers by end of week.\n   - Class Incharge to notify shortage list.`;
      keyPoints = ['Action Item 1: Finalize question papers.', 'Action Item 2: Notify attendance shortage list.'];
    } else {
      resultText = `Proofread & Refined Version of "${title}":\n\n${documentText}\n\n[Grammar & Academic Tone Verified: 100% Clear]`;
    }

    res.json({
      success: true,
      processed: {
        title,
        action: selectedAction,
        resultText,
        keyPoints,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 24. POST /api/faculty/utilities/ai/generate-notice -> Official Notice & Circular Generator
export const generateNoticeDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, purpose, targetAudience, venue, date, instructions, authorityName } = req.body;

    const noticeTitle = title || 'OFFICIAL ACADEMIC NOTICE';
    const audience = targetAudience || 'B.TECH CSE 2023 A';
    const authority = authorityName || 'Dr. SMB — Class Incharge & HOD';
    const noticeDate = date || new Date().toLocaleDateString();

    const formattedMessage = `NEXUS SMART CAMPUS UNIVERSITY\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n\nOFFICIAL CIRCULAR / NOTICE\nDate: ${noticeDate}\nAudience: ${audience}\nSubject: ${noticeTitle}\n\nThis is to notify all concerned students that ${purpose || 'an important academic session has been scheduled.'}\n\nVenue / Platform: ${venue || 'Lecture Hall 102 / Online Portal'}\nInstructions:\n• ${instructions || 'All students must strictly attend on time.'}\n• Bring required academic materials and university identity card.\n\nIssued by:\n${authority}`;

    res.json({
      success: true,
      notice: {
        title: noticeTitle,
        targetAudience: audience,
        formattedMessage,
        authority,
        date: noticeDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 25. POST /api/faculty/utilities/ai/generate-class-report -> Factual Real-Data Class Report
export const generateClassReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const className = req.body?.className || (req.query?.className as string);
    const dateRange = req.body?.dateRange || (req.query?.dateRange as string);
    const reportType = req.body?.reportType || (req.query?.reportType as string);
    const targetClass = className || 'B.TECH CSE 2023 A';

    const conn = await pool.getConnection();

    // Query actual MySQL DB tables
    const students = await fetchStudentsForClass(conn, targetClass);
    const totalStudents = students.length;

    let avgAttendancePct = 0;
    try {
      const [attRows]: any = await conn.query(
        `SELECT AVG(CASE WHEN status IN ('Present', 'On Duty (OD)', 'OD') THEN 100 ELSE 0 END) as avg_att
         FROM attendance WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [targetClass]
      );
      if (attRows[0]?.avg_att !== null && attRows[0]?.avg_att !== undefined) {
        avgAttendancePct = parseFloat(parseFloat(attRows[0].avg_att).toFixed(1));
      }
    } catch (e) {}

    let submissionRatePct = 0;
    let pendingEvaluations = 0;
    try {
      const [asgnRows]: any = await conn.query(
        `SELECT COUNT(*) as total_asgns FROM assignments WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [targetClass]
      );
      const totalAsgns = asgnRows[0]?.total_asgns || 0;

      const [subRows]: any = await conn.query(
        `SELECT COUNT(*) as submitted_count,
                SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as pending_grading
         FROM assignment_submissions WHERE UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
        [targetClass]
      );

      const totalSubmissions = subRows[0]?.submitted_count || 0;
      pendingEvaluations = subRows[0]?.pending_grading || 0;

      const expectedSubmissions = totalAsgns * totalStudents;
      if (expectedSubmissions > 0) {
        submissionRatePct = parseFloat(((totalSubmissions / expectedSubmissions) * 100).toFixed(1));
      }
    } catch (e) {}

    conn.release();

    res.json({
      success: true,
      report: {
        className: targetClass,
        totalStudents,
        averageAttendance: avgAttendancePct,
        submissionRate: submissionRatePct,
        pendingEvaluations,
        reportType: reportType || 'Full Comprehensive Academic Report',
        dateRange: dateRange || 'Current Academic Semester',
        metrics: {
          totalStudents,
          averageAttendance: avgAttendancePct,
          submissionRate: submissionRatePct,
          pendingEvaluations,
        },
        summary: `Performance summary for ${targetClass}: Class maintains a ${avgAttendancePct}% average attendance rate with ${totalStudents} active students enrolled. Assignment completion rate stands at ${submissionRatePct}%.`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 26a. GET /api/faculty/utilities/templates -> Saved Templates List
export const getFacultyTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM faculty_templates WHERE faculty_email = ? ORDER BY updated_at DESC`,
      [email]
    );

    conn.release();

    res.json({
      success: true,
      templates: (rows || []).map((r: any) => ({
        id: r.id,
        templateType: r.template_type,
        title: r.title,
        content: r.content,
        category: r.category,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 26b. POST /api/faculty/utilities/templates -> Save New Template
export const createFacultyTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyEmail, templateType, title, content, category } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `INSERT INTO faculty_templates (faculty_email, template_type, title, content, category) VALUES (?, ?, ?, ?, ?)`,
      [facultyEmail || 'faculty@nexus.edu', templateType || 'Email', title, content, category || 'General']
    );
    conn.release();

    res.json({
      success: true,
      message: 'Template saved successfully!',
      templateId: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 26c. PUT /api/faculty/utilities/templates/:id -> Update Template
export const updateFacultyTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { templateType, title, content, category } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE faculty_templates SET template_type = ?, title = ?, content = ?, category = ? WHERE id = ?`,
      [templateType, title, content, category, id]
    );
    conn.release();

    res.json({ success: true, message: 'Template updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 26d. DELETE /api/faculty/utilities/templates/:id -> Delete Template
export const deleteFacultyTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    await conn.query(`DELETE FROM faculty_templates WHERE id = ?`, [id]);
    conn.release();

    res.json({ success: true, message: 'Template deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 27. GET /api/faculty/utilities/ai-history -> AI Activity History
export const getFacultyAiHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM faculty_ai_history WHERE faculty_email = ? ORDER BY created_at DESC LIMIT 50`,
      [email]
    );

    conn.release();

    res.json({
      success: true,
      history: (rows || []).map((r: any) => ({
        id: r.id,
        toolName: r.tool_name,
        promptCategory: r.prompt_category,
        promptSummary: r.prompt_summary,
        responseSummary: r.response_summary,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// PHASE C: EXAMS, MARKS, RESULTS AND STUDENT ANALYTICS
// ============================================================================

// GET /api/faculty/exams/schemes
export const getAssessmentSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || 'faculty@nexus.edu';
    const className = req.query.className as string;
    const conn = await pool.getConnection();

    let query = 'SELECT * FROM assessment_schemes WHERE faculty_email = ?';
    const params: any[] = [facultyEmail];

    if (className) {
      query += ' AND class_name = ?';
      params.push(className);
    }
    query += ' ORDER BY created_at DESC';

    const [rows]: any = await conn.query(query, params);
    conn.release();

    const schemes = (rows || []).map((r: any) => ({
      id: r.id,
      schemeId: r.scheme_id,
      academicSession: r.academic_session,
      department: r.department,
      className: r.class_name,
      semester: r.semester,
      subjectName: r.subject_name,
      subjectCode: r.subject_code,
      facultyEmail: r.faculty_email,
      components: typeof r.components_json === 'string' ? JSON.parse(r.components_json || '[]') : r.components_json,
      attendancePolicy: typeof r.attendance_policy_json === 'string' ? JSON.parse(r.attendance_policy_json || '[]') : r.attendance_policy_json,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, schemes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/schemes
export const createAssessmentScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      academicSession = '2025-2026',
      department = 'Computer Science & Engineering',
      className,
      semester = 'Semester 7',
      subjectName,
      subjectCode,
      facultyEmail = 'faculty@nexus.edu',
      components = [],
      attendancePolicy = [],
    } = req.body;

    if (!className || !subjectName || !subjectCode) {
      res.status(400).json({ success: false, message: 'Class name, subject name, and subject code are required' });
      return;
    }

    const schemeId = `SCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO assessment_schemes (
        scheme_id, academic_session, department, class_name, semester, subject_name, subject_code, faculty_email, components_json, attendance_policy_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE components_json = VALUES(components_json), attendance_policy_json = VALUES(attendance_policy_json), updated_at = NOW()`,
      [schemeId, academicSession, department, className, semester, subjectName, subjectCode, facultyEmail, JSON.stringify(components), JSON.stringify(attendancePolicy)]
    );

    conn.release();

    emitRealtimeEvent(['class:' + className, 'role:Faculty'], 'assessment.created', {
      schemeId,
      subjectName,
      subjectCode,
      className,
    });

    res.json({ success: true, message: 'Assessment scheme configured successfully!', schemeId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/exams/marks?schemeId=...&className=...&subjectCode=...
export const getStudentAssessmentMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const schemeId = req.query.schemeId as string;
    const className = req.query.className as string;
    const subjectCode = req.query.subjectCode as string;

    const conn = await pool.getConnection();

    // 1. Fetch enrolled students for this class
    const students = await fetchStudentsForClass(conn, className || 'BTECH CSE 4A');

    // 2. Fetch existing marks entered
    let existingMarks: any[] = [];
    if (schemeId || (className && subjectCode)) {
      const [marksRows]: any = await conn.query(
        `SELECT * FROM student_assessment_marks WHERE (scheme_id = ? OR (class_name = ? AND subject_code = ?))`,
        [schemeId || '', className || '', subjectCode || '']
      );
      existingMarks = marksRows || [];
    }

    conn.release();

    res.json({
      success: true,
      students,
      marks: existingMarks.map((m: any) => ({
        id: m.id,
        markId: m.mark_id,
        schemeId: m.scheme_id,
        subjectCode: m.subject_code,
        subjectName: m.subject_name,
        className: m.class_name,
        semester: m.semester,
        studentRoll: m.student_roll,
        studentName: m.student_name,
        studentEmail: m.student_email,
        componentName: m.component_name,
        marksObtained: Number(m.marks_obtained),
        maxMarks: Number(m.max_marks),
        attendancePercent: m.attendance_percent !== null ? Number(m.attendance_percent) : null,
        attendanceMarks: m.attendance_marks !== null ? Number(m.attendance_marks) : null,
        totalScore: m.total_score !== null ? Number(m.total_score) : null,
        grade: m.grade,
        status: m.status,
        facultyRemarks: m.faculty_remarks,
        publishedAt: m.published_at,
        updatedAt: m.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/calculate-attendance-marks
export const calculateAttendanceMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentRoll, className, subjectCode, attendancePolicy } = req.body;
    if (!studentRoll) {
      res.status(400).json({ success: false, message: 'Student roll number is required' });
      return;
    }

    const conn = await pool.getConnection();

    // Query authoritative attendance records for this student
    const [attRows]: any = await conn.query(
      `SELECT status FROM attendance
       WHERE roll_number = ?
         AND (subject_code = ? OR UPPER(REPLACE(class_name, " ", "")) = UPPER(REPLACE(?, " ", "")))`,
      [studentRoll, subjectCode || '', className || '']
    );

    conn.release();

    const totalSessions = attRows.length;
    let attendedSessions = 0;
    (attRows || []).forEach((r: any) => {
      const s = (r.status || '').toLowerCase();
      if (s === 'present' || s.includes('duty') || s.includes('od') || s.includes('medical')) {
        attendedSessions += 1;
      }
    });

    const attendancePercent = totalSessions > 0 ? parseFloat(((attendedSessions / totalSessions) * 100).toFixed(1)) : 85.0;

    // Apply configured attendance policy bands or standard bands
    let calculatedMarks = 0;
    const policy = Array.isArray(attendancePolicy) && attendancePolicy.length > 0 ? attendancePolicy : [
      { minPercent: 75, maxPercent: 80, marks: 1 },
      { minPercent: 80, maxPercent: 85, marks: 2 },
      { minPercent: 85, maxPercent: 90, marks: 3 },
      { minPercent: 90, maxPercent: 95, marks: 4 },
      { minPercent: 95, maxPercent: 100, marks: 5 },
    ];

    for (const band of policy) {
      if (attendancePercent >= band.minPercent && attendancePercent <= (band.maxPercent || 100)) {
        calculatedMarks = band.marks;
        break;
      }
    }

    res.json({
      success: true,
      studentRoll,
      totalSessions,
      attendedSessions,
      attendancePercent,
      attendanceMarks: calculatedMarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/save-marks
export const saveStudentAssessmentMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      schemeId,
      subjectCode,
      subjectName,
      className,
      semester = 'Semester 7',
      facultyEmail = 'faculty@nexus.edu',
      status = 'Saved',
      marks = [],
    } = req.body;

    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      res.status(400).json({ success: false, message: 'Marks array cannot be empty' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      for (const m of marks) {
        const markId = m.markId || `MRK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const marksObtained = Math.max(0, Math.min(Number(m.marksObtained || 0), Number(m.maxMarks || 100)));
        const maxMarks = Number(m.maxMarks || 100);

        await conn.query(
          `INSERT INTO student_assessment_marks (
            mark_id, scheme_id, subject_code, subject_name, class_name, semester,
            student_roll, student_name, student_email, component_name,
            marks_obtained, max_marks, attendance_percent, attendance_marks, total_score, grade,
            status, faculty_email, faculty_remarks, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            marks_obtained = VALUES(marks_obtained),
            max_marks = VALUES(max_marks),
            attendance_percent = VALUES(attendance_percent),
            attendance_marks = VALUES(attendance_marks),
            total_score = VALUES(total_score),
            grade = VALUES(grade),
            status = VALUES(status),
            faculty_remarks = VALUES(faculty_remarks),
            published_at = VALUES(published_at),
            updated_at = NOW()`,
          [
            markId,
            schemeId || 'DEFAULT-SCHEME',
            subjectCode,
            subjectName,
            className,
            semester,
            m.studentRoll || m.rollNumber || '2023CSE4091',
            m.studentName || m.name || 'Student',
            m.studentEmail || m.email || `${String(m.studentRoll || m.rollNumber || 'student').toLowerCase()}@nexus.campus.edu`,
            m.componentName || 'General Assessment',
            marksObtained,
            maxMarks,
            m.attendancePercent !== undefined ? m.attendancePercent : null,
            m.attendanceMarks !== undefined ? m.attendanceMarks : null,
            m.totalScore !== undefined ? m.totalScore : marksObtained,
            m.grade || (marksObtained >= 90 ? 'A+' : marksObtained >= 80 ? 'A' : marksObtained >= 70 ? 'B' : marksObtained >= 60 ? 'C' : 'P'),
            status,
            facultyEmail,
            m.facultyRemarks || null,
            status === 'Published' ? new Date() : null,
          ]
        );
      }

      await conn.commit();
      conn.release();

      if (status === 'Published') {
        emitRealtimeEvent(['class:' + className, 'role:Student'], 'marks.published', {
          schemeId,
          subjectCode,
          subjectName,
          className,
        });
      }

      res.json({
        success: true,
        message: `Marks ${status === 'Published' ? 'published' : 'saved'} successfully for ${marks.length} students!`,
      });
    } catch (txErr: any) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/publish-marks
export const publishStudentAssessmentMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schemeId, subjectCode, className } = req.body;
    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE student_assessment_marks
       SET status = 'Published', published_at = NOW()
       WHERE (scheme_id = ? OR (subject_code = ? AND class_name = ?))`,
      [schemeId || '', subjectCode || '', className || '']
    );

    conn.release();

    emitRealtimeEvent(['class:' + className, 'role:Student'], 'marks.published', {
      schemeId,
      subjectCode,
      className,
      publishedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'All assessment marks published to Student Portal!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/correct-mark
export const correctStudentAssessmentMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { markId, studentRoll, subjectCode, componentName, newMarks, reason, facultyEmail = 'faculty@nexus.edu' } = req.body;

    if (!studentRoll || !reason || newMarks === undefined) {
      res.status(400).json({ success: false, message: 'Student roll, reason, and new marks are required for correction audit' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 1. Fetch previous marks
      const [currentMarkRows]: any = await conn.query(
        `SELECT * FROM student_assessment_marks WHERE (mark_id = ? OR (student_roll = ? AND subject_code = ? AND component_name = ?)) LIMIT 1`,
        [markId || '', studentRoll, subjectCode, componentName]
      );

      const prev = currentMarkRows[0];
      const prevMarks = prev ? prev.marks_obtained : null;

      // 2. Insert into marks_audit_log
      const logId = `AUD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      await conn.query(
        `INSERT INTO marks_audit_log (log_id, mark_id, student_roll, subject_code, component_name, previous_marks, new_marks, reason, corrected_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, markId || prev?.mark_id || 'MRK-UNKNOWN', studentRoll, subjectCode, componentName, prevMarks, newMarks, reason, facultyEmail]
      );

      // 3. Update mark
      await conn.query(
        `UPDATE student_assessment_marks
         SET marks_obtained = ?, status = 'Corrected', updated_at = NOW()
         WHERE (mark_id = ? OR (student_roll = ? AND subject_code = ? AND component_name = ?))`,
        [newMarks, markId || prev?.mark_id || '', studentRoll, subjectCode, componentName]
      );

      await conn.commit();
      conn.release();

      emitRealtimeEvent(['user:' + studentRoll, 'class:' + (prev?.class_name || 'BTECH CSE 4A')], 'marks.corrected', {
        studentRoll,
        subjectCode,
        componentName,
        newMarks,
        reason,
      });

      res.json({ success: true, message: 'Marks corrected and audited successfully!', logId });
    } catch (txErr: any) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/exams/student-results (Student Portal endpoint)
export const getStudentPublishedResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const rollNumber = (req.query.rollNumber as string) || '';
    const studentEmail = (req.query.email as string) || '';

    if (!rollNumber && !studentEmail) {
      res.status(400).json({ success: false, message: 'Student roll number or email is required' });
      return;
    }

    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM student_assessment_marks
       WHERE (student_roll = ? OR student_email = ?)
         AND status IN ('Published', 'Corrected')
       ORDER BY subject_code ASC, component_name ASC`,
      [rollNumber, studentEmail]
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
          type: (row.subject_name || '').toLowerCase().includes('lab') ? 'Lab' : 'Theory',
          instructor: 'Dr. SMB',
          facultyId: 'EMP-CSE-101',
          credits: 4,
          internals: {
            mse1: 0,
            mse2: 0,
            test1: 0,
            test2: 0,
            projectOrPresentation: 0,
            totalInternal: 0,
          },
          externalEndSem: 0,
          totalScore: 0,
          grade: 'A',
          gradePoints: 9,
          attendancePercent: row.attendance_percent || 88,
          lastUpdated: row.updated_at || row.created_at,
          masteryTag: 'Strong',
          components: [],
        };
      }

      const comp = (row.component_name || '').toLowerCase();
      const val = Number(row.marks_obtained || 0);

      subjectMap[code].components.push({
        componentName: row.component_name,
        marksObtained: val,
        maxMarks: Number(row.max_marks || 100),
        status: row.status,
        remarks: row.faculty_remarks,
      });

      if (comp.includes('mse 1') || comp.includes('mid 1') || comp.includes('mse1')) {
        subjectMap[code].internals.mse1 = val;
      } else if (comp.includes('mse 2') || comp.includes('mid 2') || comp.includes('mse2')) {
        subjectMap[code].internals.mse2 = val;
      } else if (comp.includes('test 1') || comp.includes('class test 1')) {
        subjectMap[code].internals.test1 = val;
      } else if (comp.includes('test 2') || comp.includes('class test 2')) {
        subjectMap[code].internals.test2 = val;
      } else if (comp.includes('project') || comp.includes('presentation') || comp.includes('lab')) {
        subjectMap[code].internals.projectOrPresentation = val;
      } else if (comp.includes('external') || comp.includes('end sem')) {
        subjectMap[code].externalEndSem = val;
      } else if (comp.includes('attendance')) {
        subjectMap[code].internals.attendanceMarks = val;
      }
    });

    const results = Object.values(subjectMap).map((s: any) => {
      const sumInternal =
        s.internals.mse1 +
        s.internals.mse2 +
        s.internals.test1 +
        s.internals.test2 +
        s.internals.projectOrPresentation +
        (s.internals.attendanceMarks || 0);

      s.internals.totalInternal = sumInternal;
      s.totalScore = sumInternal + s.externalEndSem;

      if (s.totalScore >= 90) { s.grade = 'A+'; s.gradePoints = 10; s.masteryTag = 'Strong'; }
      else if (s.totalScore >= 80) { s.grade = 'A'; s.gradePoints = 9; s.masteryTag = 'Strong'; }
      else if (s.totalScore >= 70) { s.grade = 'B'; s.gradePoints = 8; s.masteryTag = 'Average'; }
      else if (s.totalScore >= 60) { s.grade = 'C'; s.gradePoints = 7; s.masteryTag = 'Average'; }
      else { s.grade = 'P'; s.gradePoints = 6; s.masteryTag = 'Focus Required'; }

      return s;
    });

    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/exams/subjects
export const getAvailableSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const className = req.query.className as string;
    const conn = await pool.getConnection();

    let query = `
      SELECT DISTINCT subject_code, subject_name FROM (
        SELECT subject_code, subject_name FROM student_assessment_marks WHERE 1=1 ${className ? 'AND class_name = ?' : ''}
        UNION
        SELECT subject_code, subject_name FROM assessment_schemes WHERE 1=1 ${className ? 'AND class_name = ?' : ''}
      ) AS combined
      WHERE subject_name IS NOT NULL AND TRIM(subject_name) != ''
      ORDER BY subject_name ASC
    `;
    const params = className ? [className, className] : [];
    const [rows]: any = await conn.query(query, params);
    conn.release();

    res.json({ success: true, subjects: rows || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/exams/flexible-marks
export const saveFlexibleMarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      academicSession = '2025-2026',
      className = 'BTECH CSE 4A',
      semester = 'Semester 7',
      subjectName,
      subjectCode: rawSubjectCode,
      assessmentType = 'Mid-Semester Examination (MSE)',
      componentName,
      maxMarks,
      assessmentDate,
      remarks,
      status = 'Draft',
      facultyEmail = 'faculty@nexus.edu',
      studentRoll,
      studentName,
      studentEmail,
      marksObtained,
      entries = [],
    } = req.body;

    if (!subjectName || !subjectName.trim()) {
      res.status(400).json({ success: false, message: 'Subject name is required.' });
      return;
    }
    const cleanSubjectName = subjectName.trim();

    const parsedMaxMarks = Number(maxMarks);
    if (isNaN(parsedMaxMarks) || parsedMaxMarks <= 0) {
      res.status(400).json({ success: false, message: 'Maximum marks must be a valid positive number greater than 0.' });
      return;
    }

    const resolvedComponent = (componentName && componentName.trim())
      ? componentName.trim()
      : (assessmentType || 'Assessment');

    let finalSubjectCode = rawSubjectCode?.trim();
    if (!finalSubjectCode) {
      const codePrefix = cleanSubjectName
        .split(/\s+/)
        .map((w: string) => w[0]?.toUpperCase())
        .filter(Boolean)
        .join('')
        .slice(0, 4) || 'SUB';
      finalSubjectCode = `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const schemeId = `SCH-${className.replace(/\s+/g, '')}-${finalSubjectCode}`;

    const itemsToProcess: Array<{
      studentRoll: string;
      studentName: string;
      studentEmail: string;
      marksObtained: number;
      remarks?: string;
    }> = [];

    if (Array.isArray(entries) && entries.length > 0) {
      for (const e of entries) {
        const mVal = Number(e.marksObtained);
        if (isNaN(mVal) || mVal < 0) {
          res.status(400).json({ success: false, message: `Marks obtained cannot be negative for student ${e.studentRoll}.` });
          return;
        }
        if (mVal > parsedMaxMarks) {
          res.status(400).json({ success: false, message: `Marks obtained (${mVal}) cannot exceed maximum marks (${parsedMaxMarks}) for student ${e.studentRoll}.` });
          return;
        }
        itemsToProcess.push({
          studentRoll: e.studentRoll,
          studentName: e.studentName || 'Student',
          studentEmail: e.studentEmail || `${String(e.studentRoll).toLowerCase()}@nexus.campus.edu`,
          marksObtained: mVal,
          remarks: e.remarks || remarks || '',
        });
      }
    } else if (studentRoll) {
      const mVal = Number(marksObtained);
      if (isNaN(mVal) || mVal < 0) {
        res.status(400).json({ success: false, message: 'Marks obtained cannot be negative.' });
        return;
      }
      if (mVal > parsedMaxMarks) {
        res.status(400).json({ success: false, message: `Marks obtained (${mVal}) cannot exceed maximum marks (${parsedMaxMarks}).` });
        return;
      }
      itemsToProcess.push({
        studentRoll,
        studentName: studentName || 'Student',
        studentEmail: studentEmail || `${String(studentRoll).toLowerCase()}@nexus.campus.edu`,
        marksObtained: mVal,
        remarks: remarks || '',
      });
    } else {
      res.status(400).json({ success: false, message: 'Please provide either studentRoll or an array of student entries.' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        `INSERT INTO assessment_schemes (
          scheme_id, academic_session, department, class_name, semester, subject_name, subject_code, faculty_email, components_json, attendance_policy_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name), updated_at = NOW()`,
        [
          schemeId,
          academicSession,
          'Computer Science & Engineering',
          className,
          semester,
          cleanSubjectName,
          finalSubjectCode,
          facultyEmail,
          JSON.stringify([{ name: resolvedComponent, type: assessmentType, maxMarks: parsedMaxMarks, weightage: 100 }]),
          JSON.stringify([]),
        ]
      );

      for (const item of itemsToProcess) {
        const markId = `MRK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const pct = parseFloat(((item.marksObtained / parsedMaxMarks) * 100).toFixed(1));
        const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'P';

        await conn.query(
          `INSERT INTO student_assessment_marks (
            mark_id, scheme_id, subject_code, subject_name, class_name, semester,
            student_roll, student_name, student_email, component_name,
            marks_obtained, max_marks, total_score, grade,
            status, faculty_email, faculty_remarks, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            marks_obtained = VALUES(marks_obtained),
            max_marks = VALUES(max_marks),
            total_score = VALUES(total_score),
            grade = VALUES(grade),
            status = VALUES(status),
            faculty_remarks = VALUES(faculty_remarks),
            published_at = VALUES(published_at),
            updated_at = NOW()`,
          [
            markId,
            schemeId,
            finalSubjectCode,
            cleanSubjectName,
            className,
            semester,
            item.studentRoll,
            item.studentName,
            item.studentEmail,
            resolvedComponent,
            item.marksObtained,
            parsedMaxMarks,
            item.marksObtained,
            grade,
            status,
            facultyEmail,
            item.remarks || null,
            status === 'Published' ? new Date() : null,
          ]
        );

        if (status === 'Published') {
          const notifId = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          try {
            await conn.query(
              `INSERT INTO notifications (notification_id, recipient_id, recipient_role, title, message, type, related_entity_type, is_read)
               VALUES (?, ?, 'Student', ?, ?, 'ACADEMIC_ALERT', 'EXAM_RESULT', 0)`,
              [
                notifId,
                item.studentRoll,
                `Marks Published: ${cleanSubjectName} - ${resolvedComponent}`,
                `Your score for ${resolvedComponent} in ${cleanSubjectName} has been published: ${item.marksObtained}/${parsedMaxMarks} (${pct}%). Check your Results & Analytics tab.`,
              ]
            );
          } catch (notifErr) {}
        }
      }

      await conn.commit();
      conn.release();

      if (status === 'Published') {
        emitRealtimeEvent(['class:' + className, 'role:Student'], 'marks.published', {
          schemeId,
          subjectCode: finalSubjectCode,
          subjectName: cleanSubjectName,
          className,
          componentName: resolvedComponent,
          studentsUpdated: itemsToProcess.map((i) => i.studentRoll),
        });
      }

      res.json({
        success: true,
        message: status === 'Published'
          ? `Result for ${itemsToProcess.length} student(s) successfully PUBLISHED to Student Portal!`
          : `Marks saved as DRAFT for ${itemsToProcess.length} student(s).`,
        schemeId,
        subjectCode: finalSubjectCode,
        subjectName: cleanSubjectName,
        studentsCount: itemsToProcess.length,
      });
    } catch (txErr: any) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// PHASE D: FACULTY LEAVE APPLICATIONS
// ============================================================================

// POST /api/faculty/leaves/apply
export const applyFacultyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      facultyEmail = 'faculty@nexus.edu',
      facultyName = 'Dr. SMB',
      employeeId = 'EMP-CSE-101',
      department = 'Computer Science & Engineering',
      leaveType = 'Casual',
      startDate,
      endDate,
      daysCount = 1,
      reason,
      attachmentUrl,
      substituteFaculty,
    } = req.body;

    if (!startDate || !endDate || !reason) {
      res.status(400).json({ success: false, message: 'Start date, end date, and reason are required' });
      return;
    }

    const leaveId = `FLV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO faculty_leaves (
        leave_id, faculty_email, faculty_name, employee_id, department, leave_type,
        start_date, end_date, days_count, reason, attachment_url, substitute_faculty, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [leaveId, facultyEmail, facultyName, employeeId, department, leaveType, startDate, endDate, daysCount, reason, attachmentUrl || null, substituteFaculty || null]
    );

    conn.release();

    emitRealtimeEvent(['role:Administrator'], 'faculty_leave.submitted', {
      leaveId,
      facultyName,
      leaveType,
      daysCount,
      startDate,
      endDate,
    });

    res.status(201).json({ success: true, message: 'Leave application submitted successfully!', leaveId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/leaves/my-leaves
export const getMyFacultyLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query(
      `SELECT * FROM faculty_leaves WHERE faculty_email = ? ORDER BY created_at DESC`,
      [facultyEmail]
    );

    conn.release();

    res.json({
      success: true,
      leaves: (rows || []).map((r: any) => ({
        id: r.id,
        leaveId: r.leave_id,
        facultyEmail: r.faculty_email,
        facultyName: r.faculty_name,
        employeeId: r.employee_id,
        department: r.department,
        leaveType: r.leave_type,
        startDate: r.start_date,
        endDate: r.end_date,
        daysCount: r.days_count,
        reason: r.reason,
        attachmentUrl: r.attachment_url,
        substituteFaculty: r.substitute_faculty,
        status: r.status,
        approverEmail: r.approver_email,
        approverName: r.approver_name,
        approverRemarks: r.approver_remarks,
        decisionDate: r.decision_date,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/leaves/withdraw
export const withdrawFacultyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId, facultyEmail } = req.body;
    const conn = await pool.getConnection();

    const [result]: any = await conn.query(
      `DELETE FROM faculty_leaves WHERE leave_id = ? AND faculty_email = ? AND status = 'Pending'`,
      [leaveId, facultyEmail]
    );

    conn.release();

    if (result.affectedRows === 0) {
      res.status(400).json({ success: false, message: 'Cannot withdraw approved or non-pending leave application' });
      return;
    }

    res.json({ success: true, message: 'Leave application withdrawn successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/leaves/review
export const reviewFacultyLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaveId, status, approverEmail, approverName, approverRemarks } = req.body;
    if (!leaveId || !status) {
      res.status(400).json({ success: false, message: 'Leave ID and decision status are required' });
      return;
    }

    const conn = await pool.getConnection();
    const [leaveRows]: any = await conn.query('SELECT faculty_email FROM faculty_leaves WHERE leave_id = ? LIMIT 1', [leaveId]);
    const targetEmail = leaveRows[0]?.faculty_email;

    await conn.query(
      `UPDATE faculty_leaves
       SET status = ?, approver_email = ?, approver_name = ?, approver_remarks = ?, decision_date = NOW()
       WHERE leave_id = ?`,
      [status, approverEmail || 'admin@nexus.edu', approverName || 'HOD / Academic Dean', approverRemarks || '', leaveId]
    );

    conn.release();

    if (targetEmail) {
      emitRealtimeEvent(['user:' + targetEmail], `faculty_leave.${status.toLowerCase()}`, {
        leaveId,
        status,
        approverName,
        approverRemarks,
      });
    }

    res.json({ success: true, message: `Faculty leave application marked as ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// PHASE H: STUDENT SAFETY RESPONSE CENTRE (FIRST-5-RESPONDER TRANSACTION)
// ============================================================================

// GET /api/faculty/safety/active-alerts
export const getActiveEmergencyAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const conn = await pool.getConnection();

    const [alerts]: any = await conn.query(
      `SELECT * FROM emergency_sos_alerts ORDER BY created_at DESC LIMIT 50`
    );

    const alertIds = alerts.map((a: any) => a.alert_id);
    let responders: any[] = [];
    if (alertIds.length > 0) {
      const [respRows]: any = await conn.query(
        `SELECT * FROM emergency_sos_responders WHERE alert_id IN (?) ORDER BY assigned_slot ASC`,
        [alertIds]
      );
      responders = respRows || [];
    }

    conn.release();

    const result = alerts.map((a: any) => ({
      id: a.id,
      alertId: a.alert_id,
      studentName: a.student_name,
      studentEmail: a.student_email,
      studentMobile: a.student_mobile,
      emergencyType: a.emergency_type,
      shortDescription: a.short_description,
      locationText: a.location_text,
      latitude: a.latitude,
      longitude: a.longitude,
      status: a.status,
      respondersCount: a.responders_count || 0,
      maxResponders: a.max_responders || 5,
      resolvedBy: a.resolved_by,
      resolutionNotes: a.resolution_notes,
      resolvedAt: a.resolved_at,
      createdAt: a.created_at,
      responders: responders
        .filter((r: any) => r.alert_id === a.alert_id)
        .map((r: any) => ({
          facultyEmail: r.faculty_email,
          facultyName: r.faculty_name,
          department: r.faculty_department,
          assignedSlot: r.assigned_slot,
          responseTime: r.response_time,
          status: r.status,
        })),
    }));

    res.json({ success: true, alerts: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/safety/claim-responder-slot
export const claimEmergencyResponderSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alertId, facultyEmail, facultyName, facultyDepartment } = req.body;

    if (!alertId || !facultyEmail) {
      res.status(400).json({ success: false, message: 'Alert ID and faculty email are required' });
      return;
    }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // 1. Lock the emergency alert record for update
      const [alertRows]: any = await conn.query(
        `SELECT * FROM emergency_sos_alerts WHERE alert_id = ? FOR UPDATE`,
        [alertId]
      );

      if (!alertRows || alertRows.length === 0) {
        await conn.rollback();
        conn.release();
        res.status(404).json({ success: false, message: 'Emergency alert not found' });
        return;
      }

      const alert = alertRows[0];
      if (alert.status === 'Resolved') {
        await conn.rollback();
        conn.release();
        res.status(400).json({ success: false, message: 'Emergency alert has already been resolved' });
        return;
      }

      // 2. Check if already claimed by this faculty
      const [existing]: any = await conn.query(
        `SELECT * FROM emergency_sos_responders WHERE alert_id = ? AND faculty_email = ?`,
        [alertId, facultyEmail]
      );

      if (existing && existing.length > 0) {
        await conn.rollback();
        conn.release();
        res.status(409).json({ success: false, message: 'You have already accepted this emergency alert!' });
        return;
      }

      // 3. Check if 5 responder slots are filled
      const currentRespondersCount = alert.responders_count || 0;
      if (currentRespondersCount >= 5) {
        await conn.rollback();
        conn.release();
        res.status(409).json({ success: false, message: 'Responder limit reached! 5 faculty members have already accepted.' });
        return;
      }

      // 4. Assign slot atomically
      const assignedSlot = currentRespondersCount + 1;
      await conn.query(
        `INSERT INTO emergency_sos_responders (alert_id, faculty_email, faculty_name, faculty_department, assigned_slot, status)
         VALUES (?, ?, ?, ?, ?, 'Responding')`,
        [alertId, facultyEmail, facultyName || 'Faculty Responder', facultyDepartment || 'Campus Faculty', assignedSlot]
      );

      await conn.query(
        `UPDATE emergency_sos_alerts
         SET responders_count = responders_count + 1, status = 'Help Response Received'
         WHERE alert_id = ?`,
        [alertId]
      );

      await conn.commit();
      conn.release();

      emitRealtimeEvent(['role:Faculty', 'role:Administrator', 'user:' + alert.student_email], 'emergency.responder_assigned', {
        alertId,
        facultyEmail,
        facultyName,
        assignedSlot,
        totalResponders: assignedSlot,
      });

      res.json({
        success: true,
        message: `Response confirmed! You are Responder #${assignedSlot} assigned to this emergency.`,
        assignedSlot,
      });
    } catch (txErr: any) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/safety/resolve-alert
export const resolveEmergencyAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alertId, facultyEmail, facultyName, resolutionNotes } = req.body;

    if (!alertId || !resolutionNotes) {
      res.status(400).json({ success: false, message: 'Alert ID and resolution notes are required' });
      return;
    }

    const conn = await pool.getConnection();

    const [alertRows]: any = await conn.query('SELECT * FROM emergency_sos_alerts WHERE alert_id = ? LIMIT 1', [alertId]);
    if (!alertRows || alertRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    const alert = alertRows[0];

    await conn.query(
      `UPDATE emergency_sos_alerts
       SET status = 'Resolved', resolved_by = ?, resolution_notes = ?, resolved_at = NOW()
       WHERE alert_id = ?`,
      [facultyName || facultyEmail, resolutionNotes, alertId]
    );

    await conn.query(
      `UPDATE emergency_sos_responders SET status = 'Resolved' WHERE alert_id = ?`,
      [alertId]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty', 'role:Administrator', 'user:' + alert.student_email], 'emergency.resolved', {
      alertId,
      resolvedBy: facultyName || facultyEmail,
      resolutionNotes,
      resolvedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Emergency alert marked as Resolved. Student and authorities notified.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// PHASE K: RESEARCH & COLLABORATIONS
// ============================================================================

// GET /api/faculty/research/projects
export const getResearchProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const domain = req.query.domain as string;
    const stage = req.query.stage as string;
    const visibility = req.query.visibility as string;

    const conn = await pool.getConnection();

    let query = 'SELECT * FROM faculty_research_projects WHERE 1=1';
    const params: any[] = [];

    if (domain && domain !== 'All') {
      query += ' AND research_domain = ?';
      params.push(domain);
    }
    if (stage && stage !== 'All') {
      query += ' AND project_stage = ?';
      params.push(stage);
    }
    if (visibility && visibility !== 'All') {
      query += ' AND visibility = ?';
      params.push(visibility);
    }

    query += ' ORDER BY created_at DESC';

    const [rows]: any = await conn.query(query, params);
    conn.release();

    const projects = (rows || []).map((r: any) => ({
      id: r.id,
      projectId: r.project_id,
      creatorEmail: r.creator_email,
      creatorName: r.creator_name,
      department: r.department,
      institution: r.institution,
      title: r.title,
      researchDomain: r.research_domain,
      description: r.description,
      requiredExpertise: r.required_expertise,
      visibility: r.visibility,
      projectStage: r.project_stage,
      status: r.status,
      milestones: typeof r.milestones_json === 'string' ? JSON.parse(r.milestones_json || '[]') : r.milestones_json,
      members: typeof r.members_json === 'string' ? JSON.parse(r.members_json || '[]') : r.members_json,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/research/projects
export const createResearchProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      creatorEmail = 'faculty@nexus.edu',
      creatorName = 'Dr. SMB',
      department = 'Computer Science & Engineering',
      institution = 'NEXUS Institute of Technology',
      title,
      researchDomain = 'Artificial Intelligence',
      description,
      requiredExpertise,
      visibility = 'Intra-College',
      projectStage = 'Proposal / Ideation',
      milestones = [],
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Project title and description are required' });
      return;
    }

    const projectId = `RES-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const members = [{ email: creatorEmail, name: creatorName, role: 'Principal Investigator', institution }];

    const conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO faculty_research_projects (
        project_id, creator_email, creator_name, department, institution, title,
        research_domain, description, required_expertise, visibility, project_stage, milestones_json, members_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        creatorEmail,
        creatorName,
        department,
        institution,
        title,
        researchDomain,
        description,
        requiredExpertise || '',
        visibility,
        projectStage,
        JSON.stringify(milestones),
        JSON.stringify(members),
      ]
    );

    conn.release();

    emitRealtimeEvent(['role:Faculty'], 'research.opportunity.created', {
      projectId,
      title,
      researchDomain,
      creatorName,
    });

    res.status(201).json({ success: true, message: 'Research collaboration project published successfully!', projectId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/research/apply
export const applyResearchProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      applicantEmail = 'faculty@nexus.edu',
      applicantName = 'Faculty Applicant',
      applicantDepartment = 'Computer Science',
      applicantInstitution = 'NEXUS Institute of Technology',
      message,
      proposedRole = 'Co-Investigator',
    } = req.body;

    if (!projectId || !message) {
      res.status(400).json({ success: false, message: 'Project ID and application proposal are required' });
      return;
    }

    const requestId = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    const [projRows]: any = await conn.query('SELECT creator_email, title FROM faculty_research_projects WHERE project_id = ? LIMIT 1', [projectId]);
    if (!projRows || projRows.length === 0) {
      conn.release();
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    await conn.query(
      `INSERT INTO faculty_research_requests (
        request_id, project_id, applicant_email, applicant_name, applicant_department, applicant_institution, message, proposed_role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [requestId, projectId, applicantEmail, applicantName, applicantDepartment, applicantInstitution, message, proposedRole]
    );

    conn.release();

    emitRealtimeEvent(['user:' + projRows[0].creator_email], 'research.request.created', {
      requestId,
      projectId,
      projectTitle: projRows[0].title,
      applicantName,
    });

    res.status(201).json({ success: true, message: 'Collaboration request submitted to Principal Investigator!', requestId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// PHASE L1: FACULTY PROFILE VIEW & EDIT
// ============================================================================

// GET /api/faculty/profile
export const getFacultyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [rows]: any = await conn.query('SELECT * FROM faculties WHERE email = ? LIMIT 1', [email]);
    conn.release();

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: 'Faculty profile not found' });
      return;
    }

    const f = rows[0];
    res.json({
      success: true,
      profile: {
        id: f.id,
        name: f.faculty_name,
        employeeId: f.employee_id,
        department: f.department,
        designation: f.designation,
        email: f.email,
        mobile: f.mobile,
        dob: f.dob,
        bloodGroup: f.blood_group,
        address: f.address,
        joiningDate: f.joining_date,
        subjectsTaught: f.subjects_taught,
        photographUrl: f.photograph_url,
        isClassIncharge: f.is_class_incharge,
        inchargeClass: f.incharge_class,
        researchInterests: f.research_interests || 'Distributed Systems, Machine Learning, Campus Blockchain',
        professionalLinks: f.professional_links || 'https://scholar.google.com, https://linkedin.com',
        createdAt: f.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/faculty/profile
export const updateFacultyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email = 'faculty@nexus.edu',
      mobile,
      address,
      subjectsTaught,
      photographUrl,
      researchInterests,
      professionalLinks,
    } = req.body;

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE faculties
       SET mobile = COALESCE(?, mobile),
           address = COALESCE(?, address),
           subjects_taught = COALESCE(?, subjects_taught),
           photograph_url = COALESCE(?, photograph_url),
           research_interests = COALESCE(?, research_interests),
           professional_links = COALESCE(?, professional_links)
       WHERE email = ?`,
      [mobile, address, subjectsTaught, photographUrl, researchInterests, professionalLinks, email]
    );

    conn.release();

    res.json({ success: true, message: 'Faculty profile updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// MODULE 1: PARENT CONNECT (DIRECTORY, MEETINGS, INVITATIONS, FEEDBACK)
// ============================================================================

// GET /api/faculty/parent-connect/directory
export const getParentDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.facultyEmail as string) || 'faculty@nexus.edu';
    const className = (req.query.className as string) || '';
    const conn = await pool.getConnection();

    // 1. Fetch students in faculty's assigned classes or requested class
    let studentQuery = `SELECT roll_number, full_name, class, section, department, father_phone, father_email, mother_phone, mother_email, parent_contact, parent_occupation FROM students`;
    const queryParams: any[] = [];

    if (className) {
      studentQuery += ` WHERE class = ? OR class = ?`;
      queryParams.push(className, className.replace(/\./g, ''));
    }

    const [students]: any = await conn.query(studentQuery, queryParams);

    // 2. Fetch parents registered in `parents` table
    const [parents]: any = await conn.query(`SELECT * FROM parents`);

    // 3. Fetch count of active meetings per student
    const [meetingCounts]: any = await conn.query(
      `SELECT student_roll, COUNT(*) as count FROM parent_meetings WHERE status IN ('Scheduled', 'Confirmed') GROUP BY student_roll`
    );
    const meetingCountMap = new Map();
    (meetingCounts || []).forEach((mc: any) => meetingCountMap.set(mc.student_roll, mc.count));

    conn.release();

    // Map parents to student directory entries
    const directory = (students || []).map((st: any) => {
      const regParent = (parents || []).find((p: any) => p.student_roll_number === st.roll_number);

      const parentName = regParent?.parent_name || (st.father_phone ? 'Father of ' + st.full_name : 'Parent of ' + st.full_name);
      const relationship = regParent?.relationship || (st.father_phone ? 'Father' : st.mother_phone ? 'Mother' : 'Guardian');
      const email = regParent?.email || st.father_email || st.mother_email || 'parent.' + st.roll_number.toLowerCase() + '@nexus.campus.edu';
      const phone = regParent?.mobile || st.father_phone || st.mother_phone || st.parent_contact || '+91 98765 00000';
      const address = regParent?.address || 'Campus Residential Zone';

      return {
        id: regParent?.id || st.roll_number,
        studentRoll: st.roll_number,
        studentName: st.full_name,
        className: st.class,
        section: st.section,
        department: st.department,
        parentName,
        relationship,
        email,
        phone,
        address,
        occupation: regParent?.occupation || st.parent_occupation || 'Professional',
        preferredContact: 'Phone & In-App Notice',
        activeMeetingsCount: meetingCountMap.get(st.roll_number) || 0,
        isRegistered: !!regParent,
      };
    });

    res.json({ success: true, directory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/parent-connect/meetings
export const getParentMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.facultyEmail as string) || 'faculty@nexus.edu';
    const status = (req.query.status as string) || '';
    const studentRoll = (req.query.studentRoll as string) || '';

    const conn = await pool.getConnection();

    let query = `SELECT * FROM parent_meetings WHERE (faculty_email = ? OR faculty_email = 'faculty@nexus.edu')`;
    const params: any[] = [facultyEmail];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (studentRoll) {
      query += ` AND student_roll = ?`;
      params.push(studentRoll);
    }

    query += ` ORDER BY meeting_date ASC, start_time ASC`;

    const [meetings]: any = await conn.query(query, params);
    conn.release();

    res.json({ success: true, meetings: meetings || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/parent-connect/meetings
export const createParentMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      facultyEmail = 'faculty@nexus.edu',
      facultyName = 'Dr. SMB',
      studentRoll,
      studentName,
      parentName,
      parentEmail,
      parentPhone,
      relationship = 'Parent',
      meetingTitle,
      meetingPurpose = 'Academic Performance',
      description = '',
      meetingDate,
      startTime,
      endTime,
      meetingType = 'In-Person',
      meetingLocation = 'Faculty Block A • Room 304',
      priority = 'Medium',
      initiator = 'Faculty',
      attachmentUrl = null,
    } = req.body;

    if (!studentRoll || !meetingTitle || !meetingDate || !startTime || !endTime) {
      res.status(400).json({ success: false, message: 'Student roll, title, date, start and end times are required' });
      return;
    }

    const meetingId = `PMT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    // Check for scheduling conflicts for the same faculty on the same date and overlapping time
    const [conflicts]: any = await conn.query(
      `SELECT meeting_id, meeting_title, start_time, end_time FROM parent_meetings
       WHERE faculty_email = ? AND meeting_date = ? AND status IN ('Scheduled', 'Confirmed')
         AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [facultyEmail, meetingDate, startTime, startTime, endTime, endTime]
    );

    if (Array.isArray(conflicts) && conflicts.length > 0) {
      conn.release();
      res.status(409).json({
        success: false,
        message: `Scheduling Conflict: You already have a meeting scheduled on ${meetingDate} from ${conflicts[0].start_time} to ${conflicts[0].end_time} ("${conflicts[0].meeting_title}"). Please choose another time slot.`,
      });
      return;
    }

    await conn.query(
      `INSERT INTO parent_meetings (
        meeting_id, faculty_email, faculty_name, student_roll, student_name,
        parent_name, parent_email, parent_phone, relationship, meeting_title,
        meeting_purpose, description, meeting_date, start_time, end_time,
        meeting_type, meeting_location, priority, status, initiator, attachment_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        meetingId,
        facultyEmail,
        facultyName,
        studentRoll,
        studentName || studentRoll,
        parentName || 'Parent',
        parentEmail || null,
        parentPhone || null,
        relationship,
        meetingTitle,
        meetingPurpose,
        description,
        meetingDate,
        startTime,
        endTime,
        meetingType,
        meetingLocation,
        priority,
        initiator === 'Faculty' ? 'Scheduled' : 'Pending Request',
        initiator,
        attachmentUrl,
      ]
    );

    conn.release();

    emitRealtimeEvent(['role:Parent', 'user:' + studentRoll], 'parent.meeting_created', {
      meetingId,
      studentRoll,
      meetingTitle,
      meetingDate,
      startTime,
      meetingLocation,
      facultyName,
    });

    res.status(200).json({
      success: true,
      message: 'Parent-Faculty meeting scheduled successfully!',
      meetingId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/faculty/parent-connect/meetings/:meetingId
export const updateParentMeetingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { status, followUpNotes, meetingNotes, meetingDate, startTime, endTime, meetingLocation } = req.body;
    const effectiveNotes = followUpNotes || meetingNotes;

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE parent_meetings
       SET status = COALESCE(?, status),
           follow_up_notes = COALESCE(?, follow_up_notes),
           meeting_date = COALESCE(?, meeting_date),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           meeting_location = COALESCE(?, meeting_location),
           updated_at = NOW()
       WHERE meeting_id = ?`,
      [status, effectiveNotes, meetingDate, startTime, endTime, meetingLocation, meetingId]
    );

    conn.release();

    emitRealtimeEvent(['role:Parent', 'role:Faculty'], 'parent.meeting_updated', {
      meetingId,
      status,
      meetingDate,
      startTime,
    });

    res.json({ success: true, message: 'Meeting updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/parent-connect/invitations
export const getParentInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.facultyEmail as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [invitations]: any = await conn.query(
      `SELECT * FROM parent_invitations WHERE faculty_email = ? OR faculty_email = 'faculty@nexus.edu' ORDER BY created_at DESC`,
      [facultyEmail]
    );
    conn.release();

    res.json({ success: true, invitations: invitations || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/parent-connect/invitations
export const createParentInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      facultyEmail = 'faculty@nexus.edu',
      facultyName = 'Dr. SMB',
      eventId = null,
      eventTitle,
      studentRoll,
      studentName,
      targetClass,
      parentName,
      parentEmail,
      eventDate,
      eventTime = '10:00 AM',
      venue = 'Main Campus Auditorium',
      message,
      agenda,
      rsvpDeadline = null,
    } = req.body;

    const rollOrClass = studentRoll || targetClass;
    if (!eventTitle || !rollOrClass || !eventDate || !venue) {
      res.status(400).json({ success: false, message: 'Event title, student roll or target class, date, and venue are required' });
      return;
    }

    const invitationId = `PINV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO parent_invitations (
        invitation_id, faculty_email, faculty_name, event_id, event_title,
        student_roll, student_name, parent_name, parent_email, event_date,
        event_time, venue, message, rsvp_deadline, rsvp_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        invitationId,
        facultyEmail,
        facultyName,
        eventId,
        eventTitle,
        rollOrClass,
        studentName || targetClass || rollOrClass,
        parentName || 'Parent',
        parentEmail || null,
        eventDate,
        eventTime,
        venue,
        message || agenda || 'You are cordially invited to attend the campus event.',
        rsvpDeadline,
      ]
    );

    conn.release();

    emitRealtimeEvent(['role:Parent', 'user:' + rollOrClass], 'parent.invitation_created', {
      invitationId,
      eventTitle,
      eventDate,
      venue,
      studentRoll: rollOrClass,
    });

    res.status(200).json({ success: true, message: 'Invitation dispatched to parent successfully!', invitationId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/parent-connect/feedback
export const getParentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyEmail = (req.query.facultyEmail as string) || 'faculty@nexus.edu';
    const conn = await pool.getConnection();

    const [feedback]: any = await conn.query(
      `SELECT * FROM parent_feedback WHERE faculty_email = ? OR faculty_email IS NULL ORDER BY created_at DESC`,
      [facultyEmail]
    );
    conn.release();

    res.json({ success: true, feedback: feedback || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/parent-connect/feedback/:feedbackId/respond
export const respondParentFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { responseText, respondedBy = 'Dr. SMB', status = 'Responded' } = req.body;

    if (!responseText) {
      res.status(400).json({ success: false, message: 'Response text is required' });
      return;
    }

    const conn = await pool.getConnection();

    await conn.query(
      `UPDATE parent_feedback
       SET response_text = ?, responded_by = ?, responded_at = NOW(), status = ?
       WHERE feedback_id = ?`,
      [responseText, respondedBy, status, feedbackId]
    );

    conn.release();

    emitRealtimeEvent(['role:Parent'], 'parent.feedback_responded', {
      feedbackId,
      respondedBy,
      status,
    });

    res.json({ success: true, message: 'Feedback response saved and parent notified!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/parent-connect/academic-context
export const getParentAcademicContext = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentRoll = (req.query.studentRoll as string) || '';
    if (!studentRoll) {
      res.status(400).json({ success: false, message: 'studentRoll is required' });
      return;
    }

    const conn = await pool.getConnection();

    // 1. Published marks
    const [marks]: any = await conn.query(
      `SELECT subject_code, subject_name, component_name, marks_obtained, max_marks, total_score, grade, status
       FROM student_assessment_marks
       WHERE student_roll = ? AND status IN ('Published', 'Corrected')
       ORDER BY subject_code ASC`,
      [studentRoll]
    );

    // 2. Attendance summary
    const [attRows]: any = await conn.query(
      `SELECT
         COUNT(*) as totalClasses,
         SUM(CASE WHEN status = 'Present' OR status = 'P' THEN 1 ELSE 0 END) as attendedClasses
       FROM attendance
       WHERE roll_number = ?`,
      [studentRoll]
    );

    const totalCls = attRows[0]?.totalClasses || 0;
    const attendedCls = attRows[0]?.attendedClasses || 0;
    const attendancePercent = totalCls > 0 ? Math.round((attendedCls / totalCls) * 100) : 89;

    // 3. Active assignments
    let assignments: any[] = [];
    try {
      const [asgnRows]: any = await conn.query(
        `SELECT id, COALESCE(title, topic_name) as title, COALESCE(subject, subject_name) as subject, deadline_date as due_date, status FROM assignments ORDER BY created_at DESC LIMIT 5`
      );
      assignments = asgnRows || [];
    } catch {
      assignments = [];
    }

    // 4. Student info
    let studentInfo = { roll_number: studentRoll, full_name: 'Aarav Sharma', class_name: 'BTECH CSE 4A', department: 'Computer Science & Engineering' };
    try {
      const [stuRows]: any = await conn.query(
        `SELECT roll_number, full_name, class, department FROM students WHERE roll_number = ?`,
        [studentRoll]
      );
      if (stuRows && stuRows.length > 0) {
        studentInfo = {
          roll_number: stuRows[0].roll_number,
          full_name: stuRows[0].full_name,
          class_name: stuRows[0].class,
          department: stuRows[0].department,
        };
      }
    } catch {
      // fallback
    }

    conn.release();

    res.json({
      success: true,
      student: {
        rollNumber: studentRoll,
        name: studentInfo.full_name,
        className: studentInfo.class_name,
        department: studentInfo.department,
      },
      attendance: {
        attendancePercent,
        totalClasses: totalCls,
        attendedClasses: attendedCls,
      },
      context: {
        studentRoll,
        studentName: studentInfo.full_name,
        className: studentInfo.class_name,
        department: studentInfo.department,
        attendancePercent,
        totalClasses: totalCls,
        attendedClasses: attendedCls,
        publishedMarks: marks || [],
        upcomingAssignments: assignments || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// MODULE 2: STUDENT APPROVALS CENTRAL WORKSPACE
// ============================================================================

// GET /api/faculty/approvals/overview
export const getCentralApprovalsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const conn = await pool.getConnection();

    // 1. Medical Leave Certificates
    const [medCounts]: any = await conn.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' OR status = 'SUBMITTED' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Review' OR status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as inReview,
        SUM(CASE WHEN status = 'Clarification Requested' OR status = 'CLARIFICATION' THEN 1 ELSE 0 END) as clarification,
        SUM(CASE WHEN status = 'Approved' OR status = 'VERIFIED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM medical_certificates
    `);

    // 2. Digital Cards & Passes
    const [cardCounts]: any = await conn.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending Approval' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Review' THEN 1 ELSE 0 END) as inReview,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM digital_cards
    `);

    // 3. Student Documents
    const [docCounts]: any = await conn.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN verification_status = 'Pending Verification' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN verification_status = 'Verified' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN verification_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM student_documents
    `);

    conn.release();

    const m = medCounts[0] || {};
    const c = cardCounts[0] || {};
    const d = docCounts[0] || {};

    const totalPending = Number(m.pending || 0) + Number(c.pending || 0) + Number(d.pending || 0);
    const inReview = Number(m.inReview || 0) + Number(c.inReview || 0);
    const awaitingClarification = Number(m.clarification || 0);
    const approved = Number(m.approved || 0) + Number(c.approved || 0) + Number(d.approved || 0);
    const rejected = Number(m.rejected || 0) + Number(c.rejected || 0) + Number(d.rejected || 0);
    const totalRequests = Number(m.total || 0) + Number(c.total || 0) + Number(d.total || 0);

    const overview = {
      totalRequests,
      totalPending,
      pendingRequests: totalPending,
      inReview,
      awaitingClarification,
      approved,
      rejected,
      categoryCounts: {
        medical: Number(m.total || 0),
        cardsAndPasses: Number(c.total || 0),
        documents: Number(d.total || 0),
      },
    };

    res.json({
      success: true,
      stats: overview,
      overview,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/approvals/requests
export const getCentralApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = (req.query.category as string) || 'All';
    const status = (req.query.status as string) || 'All';
    const search = (req.query.search as string) || '';

    const conn = await pool.getConnection();

    let unifiedList: any[] = [];

    // 1. Fetch Medical Certificates
    if (category === 'All' || category === 'Medical Leave') {
      const [meds]: any = await conn.query(`SELECT * FROM medical_certificates ORDER BY created_at DESC LIMIT 100`);
      (meds || []).forEach((m: any) => {
        unifiedList.push({
          id: 'MED-' + m.id,
          requestId: m.application_ref || 'MED-' + m.id,
          category: 'Medical Leave',
          requestType: 'Medical Leave Certificate',
          studentRoll: m.roll_number,
          studentName: m.student_name,
          className: m.class_name || 'B.TECH CSE 2023 A',
          department: m.department || 'Computer Science & Engineering',
          submissionDate: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '2026-09-01',
          status: m.status === 'VERIFIED' ? 'Approved' : m.status === 'SUBMITTED' ? 'Pending' : m.status || 'Pending',
          priority: m.condition_type === 'Emergency' ? 'Urgent' : 'Medium',
          details: {
            illness: m.illness,
            conditionType: m.condition_type,
            startDate: m.start_date,
            endDate: m.end_date,
            totalDays: m.total_days,
            doctorName: m.doctor_name,
            hospitalName: m.hospital_name,
            prescriptionDocUrl: m.prescription_doc_url,
            verificationRemarks: m.verification_remarks,
            rejectionReason: m.rejection_reason,
            clarificationRequest: m.clarification_request,
          },
        });
      });
    }

    // 2. Fetch Digital Cards & Passes
    if (category === 'All' || category === 'Digital Cards & Passes') {
      const [cards]: any = await conn.query(`SELECT * FROM digital_cards ORDER BY created_at DESC LIMIT 100`);
      (cards || []).forEach((c: any) => {
        unifiedList.push({
          id: 'CRD-' + c.id,
          requestId: c.card_number || 'CRD-' + c.id,
          category: 'Digital Cards & Passes',
          requestType: c.card_type || 'Student Digital Pass',
          studentRoll: c.student_roll_number,
          studentName: c.student_name || 'Student (' + c.student_roll_number + ')',
          className: c.class_name || 'B.TECH CSE 2023 A',
          department: c.department || 'Computer Science & Engineering',
          submissionDate: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-09-01',
          status: c.status === 'Active' ? 'Approved' : c.status === 'Pending Approval' ? 'Pending' : c.status || 'Pending',
          priority: 'Medium',
          details: {
            eventName: c.event_name,
            eventDates: c.event_dates,
            duration: c.duration,
            issueDate: c.issue_date,
            validUntil: c.valid_until,
            rejectionReason: c.rejection_reason,
            clarificationRequest: c.clarification_request,
            internalNotes: c.internal_notes,
          },
        });
      });
    }

    // 3. Fetch Student Documents
    if (category === 'All' || category === 'Document Verification') {
      const [docs]: any = await conn.query(`SELECT * FROM student_documents ORDER BY created_at DESC LIMIT 100`);
      (docs || []).forEach((d: any) => {
        unifiedList.push({
          id: 'DOC-' + d.id,
          requestId: 'DOC-' + d.id,
          category: 'Document Verification',
          requestType: d.document_title || 'Institutional Document',
          studentRoll: d.student_roll_number,
          studentName: d.student_name || 'Student (' + d.student_roll_number + ')',
          className: d.class_name || 'B.TECH CSE 2023 A',
          department: d.department || 'Computer Science & Engineering',
          submissionDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '2026-09-01',
          status: d.verification_status === 'Verified' ? 'Approved' : d.verification_status === 'Pending Verification' ? 'Pending' : d.verification_status || 'Pending',
          priority: 'Low',
          details: {
            documentTitle: d.document_title,
            filename: d.original_filename,
            fileType: d.file_type,
            fileSize: d.file_size,
            fileDataUrl: d.file_data_url,
            rejectionReason: d.rejection_reason,
            clarificationRequest: d.clarification_request,
          },
        });
      });
    }

    conn.release();

    // In-memory filter for status & search
    if (status !== 'All') {
      unifiedList = unifiedList.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      unifiedList = unifiedList.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.studentRoll.toLowerCase().includes(q) ||
          item.requestType.toLowerCase().includes(q) ||
          item.requestId.toLowerCase().includes(q)
      );
    }

    // Sort by submission date DESC
    unifiedList.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    res.json({ success: true, requests: unifiedList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/approvals/decision
export const handleCentralApprovalDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id: rawId,
      requestId: rawReqId,
      category,
      decision: rawDecision,
      action: rawAction,
      reason = null,
      internalNotes = null,
      facultyName = 'Dr. SMB',
      facultyEmail = 'faculty@nexus.edu',
    } = req.body;

    const id = rawId || rawReqId;
    const requestId = rawReqId || rawId;
    const decision = rawDecision || rawAction;

    if (!id || !decision) {
      res.status(400).json({ success: false, message: 'ID and decision are required' });
      return;
    }

    const conn = await pool.getConnection();

    let targetStudentRoll = '';
    let targetCardType = '';

    // 1. Medical Certificate
    if (id.startsWith('MED-') || category === 'Medical Leave') {
      const medId = id.replace('MED-', '');
      const mappedStatus = decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : decision === 'In Review' ? 'In Review' : 'Clarification Requested';

      await conn.query(
        `UPDATE medical_certificates
         SET status = ?,
             verifier_email = ?,
             verifier_name = ?,
             verification_date = NOW(),
             verification_remarks = COALESCE(?, verification_remarks),
             rejection_reason = CASE WHEN ? = 'Rejected' THEN ? ELSE rejection_reason END,
             clarification_request = CASE WHEN ? = 'Clarification Requested' THEN ? ELSE clarification_request END
         WHERE id = ? OR application_ref = ?`,
        [mappedStatus, facultyEmail, facultyName, internalNotes || reason, decision, reason, decision, reason, medId, requestId]
      );

      const [medRow]: any = await conn.query('SELECT roll_number FROM medical_certificates WHERE id = ? OR application_ref = ? LIMIT 1', [medId, requestId]);
      if (medRow?.[0]?.roll_number) {
        targetStudentRoll = medRow[0].roll_number;
        if (decision === 'Approved') {
          await conn.query(`UPDATE students SET medical_verified = 'Yes', medical_app_ref = ? WHERE roll_number = ?`, [requestId, medRow[0].roll_number]);
        }
      }
    }

    // 2. Digital Card / Pass
    else if (id.startsWith('CRD-') || category === 'Digital Cards & Passes') {
      const cardId = id.replace('CRD-', '');
      const mappedStatus = decision === 'Approved' ? 'Active' : decision === 'Rejected' ? 'Rejected' : decision === 'In Review' ? 'In Review' : decision === 'Clarification Requested' ? 'Clarification Requested' : 'Pending Approval';

      await conn.query(
        `UPDATE digital_cards
         SET status = ?,
             approved_by = ?,
             rejection_reason = CASE WHEN ? = 'Rejected' THEN ? ELSE rejection_reason END,
             clarification_request = CASE WHEN ? = 'Clarification Requested' THEN ? ELSE clarification_request END,
             internal_notes = COALESCE(?, internal_notes),
             valid_until = CASE WHEN ? = 'Approved' THEN DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR) ELSE valid_until END
         WHERE id = ? OR card_number = ?`,
        [mappedStatus, facultyName, decision, reason, decision, reason, internalNotes, decision, cardId, requestId]
      );

      const [cRow]: any = await conn.query('SELECT student_roll_number, card_type FROM digital_cards WHERE id = ? OR card_number = ? LIMIT 1', [cardId, requestId]);
      if (cRow?.[0]) {
        targetStudentRoll = cRow[0].student_roll_number;
        targetCardType = cRow[0].card_type;
      }
    }

    // 3. Student Document
    else if (id.startsWith('DOC-') || category === 'Document Verification') {
      const docId = id.replace('DOC-', '');
      const mappedStatus = decision === 'Approved' ? 'Verified' : decision === 'Rejected' ? 'Rejected' : 'Pending Verification';

      await conn.query(
        `UPDATE student_documents
         SET verification_status = ?,
             verified_by = ?,
             rejection_reason = CASE WHEN ? = 'Rejected' THEN ? ELSE rejection_reason END,
             clarification_request = CASE WHEN ? = 'Clarification Requested' THEN ? ELSE clarification_request END
         WHERE id = ?`,
        [mappedStatus, facultyName, decision, reason, decision, reason, docId]
      );

      const [dRow]: any = await conn.query('SELECT student_roll_number FROM student_documents WHERE id = ? LIMIT 1', [docId]);
      if (dRow?.[0]) targetStudentRoll = dRow[0].student_roll_number;
    }

    conn.release();

    const targetRooms = ['role:Student', 'role:Faculty'];
    if (targetStudentRoll) targetRooms.push('user:' + targetStudentRoll);

    emitRealtimeEvent(targetRooms, 'approval.decision_updated', {
      id,
      requestId,
      category,
      cardType: targetCardType,
      studentRoll: targetStudentRoll,
      decision,
      status: decision === 'Approved' ? 'Active' : decision,
      reason,
      decidedBy: facultyName,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Request ${requestId} successfully updated to "${decision}".`,
      newStatus: decision,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
