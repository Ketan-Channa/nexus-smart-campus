import { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent } from '../config/socket';

export interface TimetableEntryInput {
  id: string;
  timetableId?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  slotName: string;
  subject: string;
  code: string;
  teacher: string;
  className: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Project' | 'Seminar' | 'Break';
  slotType?: 'LECTURE' | 'BREAK' | 'FREE' | 'SPECIAL_EVENT';
  breakType?: 'TEA' | 'LUNCH' | null;
}

export const toCanonicalKey = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[\s\.\-\_\(\)]/g, '').trim();
};

// 1. GET /api/academics/timetable -> Fetch active timetable entries
export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { className, day, room, teacher } = req.query;

    let query = 'SELECT * FROM timetables WHERE is_active = 1';
    const params: any[] = [];

    if (className && className !== 'All') {
      query += ' AND (class_name = ? OR canonical_class_key = ?)';
      const cKey = toCanonicalKey(className as string);
      params.push(className, cKey);
    }
    if (day && day !== 'All') {
      query += ' AND day = ?';
      params.push(day);
    }
    if (room && room !== 'All') {
      query += ' AND (room = ? OR canonical_venue_key = ?)';
      const rKey = toCanonicalKey(room as string);
      params.push(room, rKey);
    }
    if (teacher && teacher !== 'All') {
      query += ' AND (UPPER(TRIM(teacher_code)) = UPPER(TRIM(?)) OR canonical_faculty_key = ?)';
      const fKey = toCanonicalKey(teacher as string);
      params.push(teacher, fKey);
    }

    query += ' ORDER BY FIELD(day, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time ASC';

    const [rows]: any = await pool.query(query, params);
    const [metaRows]: any = await pool.query('SELECT * FROM timetable_metadata WHERE is_active = 1 ORDER BY id DESC LIMIT 1');

    res.status(200).json({
      status: 'success',
      data: rows.map((r: any) => ({
        id: r.id,
        timetableId: r.timetable_id,
        day: r.day,
        startTime: r.start_time,
        endTime: r.end_time,
        slotName: r.slot_name,
        subject: r.subject,
        code: r.code,
        teacher: r.teacher_code,
        canonicalFacultyKey: r.canonical_faculty_key || toCanonicalKey(r.teacher_code),
        className: r.class_name,
        canonicalClassKey: r.canonical_class_key || toCanonicalKey(r.class_name),
        room: r.room,
        canonicalVenueKey: r.canonical_venue_key || toCanonicalKey(r.room),
        type: r.type,
        slotType: r.slot_type || 'LECTURE',
        breakType: r.break_type || null,
      })),
      meta: metaRows[0] || null,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. GET /api/academics/timetable-meta -> Fetch active timetable metadata
export const getTimetableMeta = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM timetable_metadata WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
    res.status(200).json({
      status: 'success',
      meta: rows[0] || null,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. POST /api/academics/upload-timetable -> Validate permissions, parse, transactional activation
export const uploadTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, selectedClass, entries, userRole, userName } = req.body;

    if (userRole === 'Parent' || userRole === 'Alumni') {
      res.status(403).json({
        status: 'forbidden',
        message: `Role "${userRole}" is strictly unauthorized to upload, edit, replace, or delete timetables.`,
      });
      return;
    }

    const allowedExts = ['.pdf', '.xlsx', '.xls', '.doc', '.docx'];
    const fileExt = fileName && fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : '.pdf';
    
    if (fileExt && !allowedExts.includes(fileExt)) {
      res.status(400).json({
        status: 'invalid_format',
        message: `Unsupported file format "${fileExt}". Upload only PDF (.pdf), Excel (.xlsx, .xls), or Word (.doc, .docx) timetable files.`,
      });
      return;
    }

    let activeEntries = entries;
    if (!Array.isArray(activeEntries) || activeEntries.length === 0) {
      activeEntries = [];
    }

    const newTimetableId = `TT_${Date.now()}`;

    // Transactional database activation
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Deactivate all previous active timetables
      await conn.query('UPDATE timetables SET is_active = 0 WHERE is_active = 1');
      await conn.query('UPDATE timetable_metadata SET is_active = 0 WHERE is_active = 1');

      for (const e of activeEntries) {
        const canonicalClassKey = toCanonicalKey(e.className);
        const canonicalFacultyKey = toCanonicalKey(e.teacher);
        const canonicalVenueKey = toCanonicalKey(e.room);

        await conn.query(
          `INSERT INTO timetables (id, timetable_id, day, start_time, end_time, slot_name, subject, code, teacher_code, canonical_faculty_key, class_name, canonical_class_key, room, canonical_venue_key, type, slot_type, break_type, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            e.id || `entry_${Math.random().toString(36).substr(2, 9)}`,
            newTimetableId,
            e.day,
            e.startTime,
            e.endTime,
            e.slotName,
            e.subject,
            e.code,
            e.teacher,
            canonicalFacultyKey,
            e.className,
            canonicalClassKey,
            e.room,
            canonicalVenueKey,
            e.type || 'Lecture',
            e.slotType || (e.type === 'Break' ? 'BREAK' : 'LECTURE'),
            e.breakType || null,
          ]
        );
      }

      await conn.query(
        `INSERT INTO timetable_metadata (timetable_id, file_name, uploaded_at, uploader_name, uploader_role, total_lectures, selected_class, version, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
        [
          newTimetableId,
          fileName || 'Uploaded_Department_Timetable.pdf',
          new Date().toLocaleString(),
          userName || 'Administrator',
          userRole || 'Administrator',
          activeEntries.length,
          selectedClass || 'BTECH CSE 4A',
        ]
      );

      await conn.commit();
      conn.release();

      // Emit Real-Time Socket Event to notify all Student and Faculty portals of active timetable update
      try {
        emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Administrator'], 'timetable.updated', {
          timetableId: newTimetableId,
          fileName: fileName || 'Uploaded_Department_Timetable.pdf',
          uploadedAt: new Date().toISOString(),
          uploaderName: userName || 'Administrator',
          totalSaved: activeEntries.length,
          action: 'ACTIVATED',
        });
      } catch (sockErr) {
        console.warn('Realtime event broadcast warning:', sockErr);
      }

      res.status(200).json({
        status: 'success',
        message: 'Department timetable successfully parsed, validated, and activated!',
        timetableId: newTimetableId,
        totalSaved: activeEntries.length,
      });
    } catch (err: any) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. DELETE /api/academics/timetable -> Completely delete/deactivate active timetable
export const deleteTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userRole } = req.body;
    if (userRole === 'Parent' || userRole === 'Alumni') {
      res.status(403).json({
        status: 'forbidden',
        message: `Role "${userRole}" is strictly unauthorized to delete timetables.`,
      });
      return;
    }

    await pool.query('DELETE FROM timetables');
    await pool.query('DELETE FROM timetable_metadata');

    try {
      emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Administrator'], 'timetable.updated', {
        timetableId: null,
        action: 'DELETED',
      });
    } catch (sockErr) {
      console.warn('Realtime event broadcast warning:', sockErr);
    }

    res.status(200).json({ status: 'success', message: 'Active timetable deleted completely.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. GET /api/academics/vacant-venues -> Calculate vacant rooms across ALL classes
export const getVacantVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { day, timeSlot, startTime } = req.query;

    const queryDay = (day as string) || 'Monday';
    const targetStartTime = (startTime as string) || (timeSlot as string)?.split(' ')[0] || '12:30';

    const [rows]: any = await pool.query(
      `SELECT DISTINCT room, class_name, subject, teacher_code, start_time, end_time
       FROM timetables
       WHERE is_active = 1 AND day = ? AND start_time LIKE ? AND room != 'VACANT LOUNGE'`,
      [queryDay, `%${targetStartTime}%`]
    );

    res.status(200).json({
      status: 'success',
      day: queryDay,
      targetTime: targetStartTime,
      occupiedRooms: rows.map((r: any) => ({
        room: r.room,
        canonicalVenueKey: toCanonicalKey(r.room),
        className: r.class_name,
        subject: r.subject,
        teacher: r.teacher_code,
        startTime: r.start_time,
        endTime: r.end_time,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. GET /api/academics/room-timeline -> Get occupancy timeline for a room across ALL classes
export const getRoomTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomCode, day } = req.query;

    if (!roomCode) {
      res.status(400).json({ status: 'error', message: 'Room code parameter is required.' });
      return;
    }

    const queryDay = (day as string) || 'Monday';
    const cVenueKey = toCanonicalKey(roomCode as string);

    const [rows]: any = await pool.query(
      `SELECT * FROM timetables
       WHERE is_active = 1 AND (UPPER(TRIM(room)) = UPPER(TRIM(?)) OR canonical_venue_key = ?) AND day = ?
       ORDER BY start_time ASC`,
      [roomCode, cVenueKey, queryDay]
    );

    res.status(200).json({
      status: 'success',
      roomCode,
      day: queryDay,
      timeline: rows.map((r: any) => ({
        startTime: r.start_time,
        endTime: r.end_time,
        slotName: r.slot_name,
        subject: r.subject,
        teacher: r.teacher_code,
        className: r.class_name,
        type: r.type,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 7. GET /api/academics/faculty-schedule -> Search faculty schedule across ALL classes
export const getFacultySchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherCode, day } = req.query;

    if (!teacherCode) {
      res.status(400).json({ status: 'error', message: 'Teacher code parameter is required.' });
      return;
    }

    const cFacultyKey = toCanonicalKey(teacherCode as string);
    let query = 'SELECT * FROM timetables WHERE is_active = 1 AND (UPPER(TRIM(teacher_code)) = UPPER(TRIM(?)) OR canonical_faculty_key = ?)';
    const params: any[] = [teacherCode, cFacultyKey];

    if (day && day !== 'All') {
      query += ' AND day = ?';
      params.push(day);
    }

    query += ' ORDER BY FIELD(day, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time ASC';

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      teacherCode,
      totalLectures: rows.length,
      schedule: rows.map((r: any) => ({
        id: r.id,
        day: r.day,
        startTime: r.start_time,
        endTime: r.end_time,
        slotName: r.slot_name,
        subject: r.subject,
        className: r.class_name,
        room: r.room,
        type: r.type,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
