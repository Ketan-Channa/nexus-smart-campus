import { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent, getIO } from '../config/socket';

// 1. Get Alumni Directory (Filtered, Server-side pagination & Search)
export const getAlumniDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      graduationYear,
      degree,
      company,
      industry,
      mentorshipOnly,
      jobProviderOnly,
      includePending,
      collegeName,
    } = req.query;

    let query = `SELECT id, full_name, username, email, mobile, photograph_url, cover_photo_url, graduation_year, batch, degree, department, section, college_name, current_city, current_country, current_company, current_designation, industry, skills, bio, linkedin_url, github_url, other_links, alumni_id, verification_status, privacy_level, mentorship_available, mentorship_format, preferred_mentoring_topics, volunteering_interests, guest_lecture_topics, job_provider, created_at FROM alumni WHERE 1=1`;
    const params: any[] = [];

    if (collegeName && collegeName !== 'All') {
      query += ` AND (college_name = ? OR college_name LIKE ? OR college_name IS NULL OR college_name = '')`;
      params.push(collegeName, `%${collegeName}%`);
    }

    // Filter by verification status unless admin requests all
    if (includePending !== 'true') {
      query += ` AND verification_status = 'VERIFIED'`;
    }

    if (search) {
      const searchPattern = `%${search}%`;
      query += ` AND (full_name LIKE ? OR current_company LIKE ? OR current_designation LIKE ? OR skills LIKE ? OR current_city LIKE ? OR department LIKE ? OR alumni_id LIKE ?)`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (department && department !== 'All') {
      query += ` AND department = ?`;
      params.push(department);
    }

    if (graduationYear && graduationYear !== 'All') {
      query += ` AND graduation_year = ?`;
      params.push(graduationYear);
    }

    if (degree && degree !== 'All') {
      query += ` AND degree = ?`;
      params.push(degree);
    }

    if (company) {
      query += ` AND current_company LIKE ?`;
      params.push(`%${company}%`);
    }

    if (industry && industry !== 'All') {
      query += ` AND industry = ?`;
      params.push(industry);
    }

    if (mentorshipOnly === 'true') {
      query += ` AND mentorship_available = 1`;
    }

    if (jobProviderOnly === 'true') {
      query += ` AND job_provider = 1`;
    }

    query += ` ORDER BY created_at DESC`;

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      count: rows.length,
      alumni: rows,
    });
  } catch (error: any) {
    console.error('Error fetching alumni directory:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Get Single Alumni Profile with Experiences & Achievements
export const getAlumniProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const emailOrId = req.params.emailOrId || (req.query.email as string) || (req.query.emailOrId as string) || (req.query.id as string);

    if (!emailOrId) {
      res.status(400).json({ status: 'error', message: 'Email or ID is required.' });
      return;
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM alumni WHERE email = ? OR alumni_id = ? OR username = ? OR id = ? LIMIT 1`,
      [emailOrId, emailOrId, emailOrId, isNaN(Number(emailOrId)) ? 0 : Number(emailOrId)]
    );

    if (rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Alumni profile not found.' });
      return;
    }

    const alumni = rows[0];

    // Fetch experiences, achievements, and documents
    const [experiences]: any = await pool.query(
      `SELECT * FROM alumni_experiences WHERE alumni_email = ? ORDER BY id DESC`,
      [alumni.email]
    );

    const [achievements]: any = await pool.query(
      `SELECT * FROM alumni_achievements WHERE alumni_email = ? ORDER BY id DESC`,
      [alumni.email]
    );

    const [documents]: any = await pool.query(
      `SELECT * FROM alumni_documents WHERE alumni_email = ? ORDER BY id DESC`,
      [alumni.email]
    );

    res.status(200).json({
      status: 'success',
      alumni: {
        ...alumni,
        experiences,
        achievements,
        documents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2b. Check Alumni Verification Status
export const getVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const [rows]: any = await pool.query(
      `SELECT id, full_name, email, alumni_id, verification_status, verification_notes, clarification_message, suspended_reason, is_active, created_at FROM alumni WHERE email = ? LIMIT 1`,
      [email]
    );
    if (!rows || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Alumni record not found.' });
      return;
    }
    res.status(200).json({ status: 'success', verification: rows[0] });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Update Alumni Profile
export const updateAlumniProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      fullName,
      mobile,
      department,
      degree,
      graduationYear,
      currentCompany,
      currentDesignation,
      industry,
      currentCity,
      currentCountry,
      skills,
      bio,
      linkedinUrl,
      githubUrl,
      otherLinks,
      photoUrl,
      coverPhotoUrl,
      mentorshipAvailable,
      mentorshipFormat,
      preferredMentoringTopics,
      volunteeringInterests,
      guestLectureTopics,
      jobProvider,
      privacyLevel,
    } = req.body;

    if (!email) {
      res.status(400).json({ status: 'error', message: 'Alumni email is required.' });
      return;
    }

    await pool.query(
      `UPDATE alumni SET
        full_name = COALESCE(?, full_name),
        mobile = COALESCE(?, mobile),
        department = COALESCE(?, department),
        degree = COALESCE(?, degree),
        graduation_year = COALESCE(?, graduation_year),
        current_company = COALESCE(?, current_company),
        current_designation = COALESCE(?, current_designation),
        industry = COALESCE(?, industry),
        current_city = COALESCE(?, current_city),
        current_country = COALESCE(?, current_country),
        skills = COALESCE(?, skills),
        bio = COALESCE(?, bio),
        linkedin_url = COALESCE(?, linkedin_url),
        github_url = COALESCE(?, github_url),
        other_links = COALESCE(?, other_links),
        photograph_url = COALESCE(?, photograph_url),
        cover_photo_url = COALESCE(?, cover_photo_url),
        mentorship_available = COALESCE(?, mentorship_available),
        mentorship_format = COALESCE(?, mentorship_format),
        preferred_mentoring_topics = COALESCE(?, preferred_mentoring_topics),
        volunteering_interests = COALESCE(?, volunteering_interests),
        guest_lecture_topics = COALESCE(?, guest_lecture_topics),
        job_provider = COALESCE(?, job_provider),
        privacy_level = COALESCE(?, privacy_level)
       WHERE email = ?`,
      [
        fullName || null,
        mobile || null,
        department || null,
        degree || null,
        graduationYear || null,
        currentCompany || null,
        currentDesignation || null,
        industry || null,
        currentCity || null,
        currentCountry || null,
        skills ? (typeof skills === 'object' ? JSON.stringify(skills) : skills) : null,
        bio || null,
        linkedinUrl || null,
        githubUrl || null,
        otherLinks || null,
        photoUrl || null,
        coverPhotoUrl || null,
        mentorshipAvailable !== undefined ? (mentorshipAvailable ? 1 : 0) : null,
        mentorshipFormat || null,
        preferredMentoringTopics || null,
        volunteeringInterests || null,
        guestLectureTopics || null,
        jobProvider !== undefined ? (jobProvider ? 1 : 0) : null,
        privacyLevel || null,
        email,
      ]
    );

    // Socket.IO Phase: Realtime Profile Updated Event
    emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Alumni'], 'alumni.profile.updated', {
      email,
      fullName,
      currentCompany,
      currentDesignation,
      photoUrl,
    });

    res.status(200).json({
      status: 'success',
      message: 'Alumni profile updated successfully in MySQL!',
    });
  } catch (error: any) {
    console.error('Error updating alumni profile:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Manage Experiences
export const addExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail, company, designation, startDate, endDate, isCurrent, description } = req.body;

    await pool.query(
      `INSERT INTO alumni_experiences (alumni_email, company, designation, start_date, end_date, is_current, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alumniEmail, company, designation, startDate, endDate, isCurrent ? 1 : 0, description]
    );

    res.status(201).json({ status: 'success', message: 'Work experience added successfully.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM alumni_experiences WHERE id = ?`, [id]);
    res.status(200).json({ status: 'success', message: 'Experience entry deleted.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Manage Achievements
export const addAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail, title, category, organization, achievementDate, description, mediaUrl } = req.body;

    await pool.query(
      `INSERT INTO alumni_achievements (alumni_email, title, category, organization, achievement_date, description, media_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alumniEmail, title, category, organization, achievementDate, description, mediaUrl || null]
    );

    res.status(201).json({ status: 'success', message: 'Achievement added successfully.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM alumni_achievements WHERE id = ?`, [id]);
    res.status(200).json({ status: 'success', message: 'Achievement entry deleted.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. Mentorship Requests Workflow
export const requestMentorship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentEmail, studentName, studentRollNumber, studentDepartment, alumniEmail, alumniName, careerGoal, preferredTopic, message, resumeUrl } = req.body;

    const sEmail = studentEmail || 'student@nexus.campus.edu';
    const sName = studentName || sEmail.split('@')[0];
    const aEmail = alumniEmail || 'alumni@nexus.campus.edu';
    const aName = alumniName || aEmail.split('@')[0];
    const requestId = `MTR-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_mentorship_requests (request_id, student_email, student_name, student_roll_number, student_department, alumni_email, alumni_name, career_goal, preferred_topic, message, resume_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [requestId, sEmail, sName, studentRollNumber || '', studentDepartment || 'Computer Science', aEmail, aName, careerGoal || 'Career Mentorship', preferredTopic || 'General Guidance', message || 'Mentorship request', resumeUrl || null]
    );

    // Socket.IO Phase: Realtime Mentorship Request Event
    emitRealtimeEvent([`user:${aEmail.toLowerCase().trim()}`], 'mentorship.requested', {
      requestId,
      studentName: sName,
      studentEmail: sEmail,
      studentRollNumber,
      studentDepartment,
      careerGoal,
      preferredTopic,
      message,
    });

    res.status(201).json({ status: 'success', message: 'Mentorship request sent successfully to alumni!', requestId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMentorshipRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req.query.userEmail as string) || (req.query.alumniEmail as string) || (req.query.studentEmail as string);

    let rows: any[] = [];
    if (userEmail) {
      const [resRows]: any = await pool.query(
        `SELECT * FROM alumni_mentorship_requests WHERE alumni_email = ? OR student_email = ? ORDER BY id DESC`,
        [userEmail, userEmail]
      );
      rows = resRows;
    } else {
      const [allRows]: any = await pool.query(`SELECT * FROM alumni_mentorship_requests ORDER BY id DESC LIMIT 50`);
      rows = allRows;
    }

    res.status(200).json({ status: 'success', requests: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const respondMentorship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, status, action } = req.body;
    const effectiveStatus = (status || action || 'ACCEPTED').toUpperCase();

    const [existing]: any = await pool.query(
      `SELECT * FROM alumni_mentorship_requests WHERE request_id = ? OR id = ? LIMIT 1`,
      [requestId, isNaN(Number(requestId)) ? 0 : Number(requestId)]
    );

    await pool.query(
      `UPDATE alumni_mentorship_requests SET status = ? WHERE request_id = ? OR id = ?`,
      [effectiveStatus, requestId, isNaN(Number(requestId)) ? 0 : Number(requestId)]
    );

    if (existing.length > 0) {
      const studentEmail = existing[0].student_email;
      const alumniName = existing[0].alumni_name;

      emitRealtimeEvent([`user:${(studentEmail || '').toLowerCase().trim()}`], 'mentorship.responded', {
        requestId,
        status: effectiveStatus,
        alumniName,
      });
    }

    res.status(200).json({ status: 'success', message: `Mentorship request ${effectiveStatus.toLowerCase()}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6b. Mentorship Sessions Scheduling
export const scheduleMentorshipSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      requestId,
      alumniEmail,
      alumniName,
      studentEmail,
      studentName,
      topic,
      scheduledDate,
      scheduledTime,
      meetingMode,
      meetingLinkOrVenue,
      agenda,
    } = req.body;

    const aEmail = alumniEmail || 'alumni@nexus.campus.edu';
    const aName = alumniName || aEmail.split('@')[0];
    const sEmail = studentEmail || 'student@nexus.campus.edu';
    const sName = studentName || sEmail.split('@')[0];

    const sessionId = `SES-${Date.now()}`;

    let mappedMeetingMode = 'Online (Google Meet)';
    const rawMeet = (meetingMode || '').toUpperCase();
    if (rawMeet.includes('ZOOM')) mappedMeetingMode = 'Online (Zoom)';
    else if (rawMeet.includes('PERSON') || rawMeet.includes('CAMPUS') || rawMeet.includes('OFFLINE')) mappedMeetingMode = 'In-Person (Campus)';
    else if (rawMeet.includes('PHONE') || rawMeet.includes('CALL')) mappedMeetingMode = 'Phone Call';
    else mappedMeetingMode = 'Online (Google Meet)';

    await pool.query(
      `INSERT INTO alumni_mentorship_sessions (
        session_id, request_id, alumni_email, alumni_name, student_email, student_name,
        topic, scheduled_date, scheduled_time, meeting_mode, meeting_link_or_venue, agenda, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
      [
        sessionId,
        requestId || '',
        aEmail,
        aName,
        sEmail,
        sName,
        topic || 'Mentorship Guidance',
        scheduledDate || new Date().toISOString().split('T')[0],
        scheduledTime || '17:00:00',
        mappedMeetingMode,
        meetingLinkOrVenue || 'https://meet.google.com/nex-camp-mtg',
        agenda || 'Career advice and guidance',
      ]
    );

    // Update mentorship request status to ACTIVE
    if (requestId) {
      await pool.query(`UPDATE alumni_mentorship_requests SET status = 'ACCEPTED' WHERE request_id = ?`, [requestId]);
    }

    // Realtime notification to student & alumni
    emitRealtimeEvent(
      [`user:${(studentEmail || '').toLowerCase().trim()}`, `user:${(alumniEmail || '').toLowerCase().trim()}`],
      'mentorship.session.updated',
      {
        sessionId,
        topic,
        scheduledDate,
        scheduledTime,
        meetingMode,
        meetingLinkOrVenue,
        status: 'SCHEDULED',
      }
    );

    res.status(201).json({ status: 'success', message: 'Mentorship session scheduled successfully!', sessionId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMentorshipSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail } = req.query;

    const [rows]: any = await pool.query(
      `SELECT * FROM alumni_mentorship_sessions WHERE alumni_email = ? OR student_email = ? ORDER BY id DESC`,
      [userEmail, userEmail]
    );

    res.status(200).json({ status: 'success', sessions: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateMentorshipSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { status, notes, feedbackMentor, feedbackMentee } = req.body;

    const [existing]: any = await pool.query(
      `SELECT * FROM alumni_mentorship_sessions WHERE session_id = ? LIMIT 1`,
      [sessionId]
    );

    if (existing.length === 0) {
      res.status(404).json({ status: 'error', message: 'Session not found.' });
      return;
    }

    const s = existing[0];

    await pool.query(
      `UPDATE alumni_mentorship_sessions SET
        status = COALESCE(?, status),
        session_notes = COALESCE(?, session_notes),
        mentor_feedback = COALESCE(?, mentor_feedback),
        mentee_feedback = COALESCE(?, mentee_feedback)
       WHERE session_id = ?`,
      [status || null, notes || null, feedbackMentor || null, feedbackMentee || null, sessionId]
    );

    emitRealtimeEvent(
      [`user:${(s.student_email || '').toLowerCase().trim()}`, `user:${(s.alumni_email || '').toLowerCase().trim()}`],
      'mentorship.session.updated',
      {
        sessionId,
        status: status || s.status,
      }
    );

    res.status(200).json({ status: 'success', message: 'Session updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 7. Job Board Workflow
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, workMode, employmentType, category, includePending } = req.query;

    let query = `SELECT * FROM alumni_job_posts WHERE 1=1`;
    const params: any[] = [];

    if (includePending !== 'true') {
      query += ` AND moderation_status = 'APPROVED'`;
    }

    if (search) {
      query += ` AND (job_title LIKE ? OR company LIKE ? OR required_skills LIKE ? OR location LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p, p);
    }

    if (workMode && workMode !== 'All') {
      query += ` AND work_mode = ?`;
      params.push(workMode);
    }

    if (employmentType && employmentType !== 'All') {
      query += ` AND employment_type = ?`;
      params.push(employmentType);
    }

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY id DESC`;

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({ status: 'success', jobs: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const postJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      postedByEmail,
      postedByName,
      alumniEmail,
      alumniName,
      alumniId,
      jobTitle,
      title,
      company,
      location,
      workMode,
      employmentType,
      jobType,
      experienceLevel,
      requiredSkills,
      requirements,
      description,
      applicationLink,
      applicationUrl,
      deadline,
      posterUrl,
      salaryRange,
      category,
      allowReferrals,
    } = req.body;

    const effectiveEmail = postedByEmail || alumniEmail || 'alumni@nexus.campus.edu';
    const effectiveName = postedByName || alumniName || effectiveEmail.split('@')[0];
    const effectiveTitle = jobTitle || title || 'Software Opportunity';
    const effectiveWorkMode = workMode || 'On-site';
    const effectiveType = employmentType || jobType || 'Full-Time';
    const effectiveSkills = requiredSkills || requirements || '';
    const effectiveAppUrl = applicationLink || applicationUrl || '';

    const jobId = `JOB-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_job_posts (
        job_id, posted_by_email, posted_by_name, alumni_id, job_title, company, location,
        work_mode, employment_type, experience_level, required_skills, description,
        application_link, deadline, poster_url, moderation_status, salary_range, category, allow_referrals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?)`,
      [
        jobId,
        effectiveEmail,
        effectiveName,
        alumniId || '',
        effectiveTitle,
        company || 'NEXUS Network Partner',
        location || 'India',
        effectiveWorkMode,
        effectiveType,
        experienceLevel || 'Entry Level',
        typeof effectiveSkills === 'object' ? JSON.stringify(effectiveSkills) : effectiveSkills,
        description || '',
        effectiveAppUrl,
        deadline || '',
        posterUrl || null,
        salaryRange || 'Competitive',
        category || 'Software & Technology',
        allowReferrals !== undefined ? (allowReferrals ? 1 : 0) : 1,
      ]
    );

    // Socket.IO Phase: Realtime Job Created Event
    emitRealtimeEvent(['role:Student', 'role:Alumni', 'role:Faculty'], 'career.opportunity.created', {
      jobId,
      jobTitle: effectiveTitle,
      company: company || 'NEXUS Network Partner',
      postedByName: effectiveName,
      workMode: effectiveWorkMode,
    });

    res.status(201).json({ status: 'success', message: 'Job opportunity posted successfully!', jobId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status } = req.body; // 'ACTIVE', 'CLOSED', 'ARCHIVED'

    await pool.query(`UPDATE alumni_job_posts SET status = ? WHERE job_id = ?`, [status, jobId]);
    res.status(200).json({ status: 'success', message: `Job listing status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 7b. Job Referrals Workflow
export const requestReferral = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      jobId,
      jobTitle,
      company,
      studentEmail,
      studentName,
      studentRollNumber,
      studentDepartment,
      alumniEmail,
      alumniName,
      resumeUrl,
      portfolioUrl,
      coverNote,
      statement,
    } = req.body;

    const sEmail = studentEmail || 'student@nexus.campus.edu';
    const sName = studentName || sEmail.split('@')[0];
    const aEmail = alumniEmail || 'alumni@nexus.campus.edu';
    const aName = alumniName || aEmail.split('@')[0];
    const referralId = `REF-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_referrals (
        referral_id, job_id, job_title, company, student_email, student_name,
        student_roll_number, student_department, alumni_email, alumni_name,
        resume_url, portfolio_url, cover_note, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        referralId,
        jobId || 0,
        jobTitle || 'Opportunity',
        company || 'Tech Partner',
        sEmail,
        sName,
        studentRollNumber || '',
        studentDepartment || '',
        aEmail,
        aName,
        resumeUrl || '',
        portfolioUrl || '',
        coverNote || statement || '',
      ]
    );

    // Increment referral count on the job
    if (jobId) {
      await pool.query(`UPDATE alumni_job_posts SET referral_count = referral_count + 1 WHERE job_id = ?`, [jobId]);
    }

    // Realtime event to alumni
    emitRealtimeEvent([`user:${aEmail.toLowerCase().trim()}`], 'career.referral.requested', {
      referralId,
      jobTitle,
      company,
      studentName: sName,
      studentEmail: sEmail,
    });

    res.status(201).json({ status: 'success', message: 'Referral request submitted to alumnus!', referralId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getReferrals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = (req.query.userEmail as string) || (req.query.alumniEmail as string) || (req.query.studentEmail as string);

    let rows: any[] = [];
    if (userEmail) {
      const [resRows]: any = await pool.query(
        `SELECT * FROM alumni_referrals WHERE alumni_email = ? OR student_email = ? ORDER BY id DESC`,
        [userEmail, userEmail]
      );
      rows = resRows;
    } else {
      const [allRows]: any = await pool.query(`SELECT * FROM alumni_referrals ORDER BY id DESC LIMIT 50`);
      rows = allRows;
    }

    res.status(200).json({ status: 'success', referrals: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const respondReferral = async (req: Request, res: Response): Promise<void> => {
  try {
    const referralId = req.params.referralId || req.body.referralId;
    const { status, referenceCode, referralReferenceCode, feedback } = req.body;

    const effectiveStatus = (status || 'REFERRED').toUpperCase() === 'ENDORSED' ? 'REFERRED' : status;
    const effectiveCode = referenceCode || referralReferenceCode || '';

    const [existing]: any = await pool.query(
      `SELECT * FROM alumni_referrals WHERE referral_id = ? OR id = ? LIMIT 1`,
      [referralId, isNaN(Number(referralId)) ? 0 : Number(referralId)]
    );

    if (existing.length === 0) {
      res.status(404).json({ status: 'error', message: 'Referral request not found.' });
      return;
    }

    const ref = existing[0];

    await pool.query(
      `UPDATE alumni_referrals SET
        status = ?,
        referral_reference_code = ?,
        alumni_feedback = ?
       WHERE referral_id = ?`,
      [effectiveStatus, effectiveCode || null, feedback || null, ref.referral_id]
    );

    // Realtime notification to student
    emitRealtimeEvent([`user:${(ref.student_email || '').toLowerCase().trim()}`], 'career.referral.updated', {
      referralId: ref.referral_id,
      jobTitle: ref.job_title,
      company: ref.company,
      status: effectiveStatus,
      referenceCode: effectiveCode,
      feedback,
    });

    res.status(200).json({ status: 'success', message: `Referral status updated to ${effectiveStatus}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 8. Alumni / Campus Events & RSVPs
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`SELECT * FROM alumni_events ORDER BY id DESC`);
    res.status(200).json({ status: 'success', events: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      organizerEmail,
      organizerName,
      organizer,
      eventName,
      title,
      eventDate,
      eventTime,
      venue,
      eventMode,
      eventType,
      targetBatch,
      targetDepartment,
      description,
      registrationLink,
      posterUrl,
      category,
      targetAudience,
      organizerDesignation,
      organizerClub,
      startDate,
      endDate,
      startTime,
      endTime,
      maxSeats,
    } = req.body;

    const effectiveEventName = eventName || title || 'Campus Event';
    const effectiveOrganizer = organizerName || organizer || 'NEXUS Alumni Association';
    const effectiveDate = eventDate || startDate || new Date().toISOString().split('T')[0];
    const effectiveTime = eventTime || startTime || '10:00:00';
    const effectiveVenue = venue || 'Main Campus Grand Auditorium';
    const effectiveMode = eventMode || eventType || 'Offline';

    const eventId = `EVT-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_events (
        event_id, organizer_email, organizer_name, event_name, event_date, event_time, venue, event_mode,
        target_batch, target_department, description, registration_link, poster_url, status,
        category, target_audience, organizer_designation, organizer_club, start_date, end_date,
        start_time, end_time, max_seats, registered_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        eventId,
        organizerEmail || 'alumni@nexus.edu',
        effectiveOrganizer,
        effectiveEventName,
        effectiveDate,
        effectiveTime,
        effectiveVenue,
        effectiveMode,
        targetBatch || 'All Batches',
        targetDepartment || 'All Departments',
        description || '',
        registrationLink || '',
        posterUrl || null,
        category || 'Alumni Reunion',
        targetAudience || 'All',
        organizerDesignation || 'Coordinator',
        organizerClub || 'Nexus Association',
        startDate || effectiveDate,
        endDate || effectiveDate,
        startTime || effectiveTime,
        endTime || '05:00 PM',
        maxSeats || 200,
      ]
    );

    // Socket.IO Phase Realtime Event Creation
    emitRealtimeEvent(['role:Student', 'role:Faculty', 'role:Alumni'], 'event.created', {
      eventId,
      eventName: effectiveEventName,
      organizerName: effectiveOrganizer,
      category: category || 'Alumni Reunion',
      targetAudience: targetAudience || 'All',
    });

    res.status(201).json({
      status: 'success',
      message: 'Campus event created and published successfully to database & real-time streams!',
      eventId,
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const rsvpEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId || req.body.eventId;
    const { userEmail, userName, userRole, rsvpStatus, guestsCount, notes } = req.body;

    const uEmail = userEmail || 'alumni@nexus.campus.edu';
    const uName = userName || uEmail.split('@')[0];

    await pool.query(
      `INSERT INTO alumni_event_rsvps (event_id, user_email, user_name, user_role, rsvp_status, guests_count, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rsvp_status = VALUES(rsvp_status), guests_count = VALUES(guests_count), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP`,
      [eventId, uEmail, uName, userRole || 'Alumni', rsvpStatus || 'GOING', guestsCount || 1, notes || '']
    );

    // Update registered_count on alumni_events
    const [counts]: any = await pool.query(
      `SELECT COUNT(*) as cnt FROM alumni_event_rsvps WHERE event_id = ? AND rsvp_status = 'GOING'`,
      [eventId]
    );
    if (counts.length > 0) {
      await pool.query(`UPDATE alumni_events SET registered_count = ? WHERE event_id = ?`, [counts[0].cnt, eventId]);
    }

    emitRealtimeEvent(['role:Faculty', 'role:Administrator', 'role:Alumni'], 'event.rsvp.updated', {
      eventId,
      userEmail: uEmail,
      userName: uName,
      rsvpStatus: rsvpStatus || 'GOING',
    });

    res.status(200).json({ status: 'success', message: `RSVP registered as ${rsvpStatus || 'GOING'}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getEventRsvps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const [rows]: any = await pool.query(`SELECT * FROM alumni_event_rsvps WHERE event_id = ? ORDER BY id DESC`, [eventId]);
    res.status(200).json({ status: 'success', rsvps: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 9. Alumni Guest Lectures
export const proposeGuestLecture = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      alumniEmail,
      alumniName,
      alumniDesignation,
      alumniCompany,
      topic,
      abstractDesc,
      targetDepartment,
      proposedDate,
      proposedTime,
      mode,
      venueOrLink,
      expectedAttendees,
    } = req.body;

    const effectiveEmail = alumniEmail || 'alumni@nexus.campus.edu';
    const effectiveName = alumniName || effectiveEmail.split('@')[0];

    const lectureId = `LEC-${Date.now()}`;

    let mappedLectureMode = 'Online Webinar';
    const rawMode = (mode || '').toUpperCase();
    if (rawMode.includes('OFFLINE') || rawMode.includes('CAMPUS') || rawMode.includes('PERSON')) mappedLectureMode = 'Offline Campus Session';
    else if (rawMode.includes('WORKSHOP')) mappedLectureMode = 'Workshop';
    else mappedLectureMode = 'Online Webinar';

    await pool.query(
      `INSERT INTO alumni_guest_lectures (
        lecture_id, alumni_email, alumni_name, alumni_designation, alumni_company,
        topic, abstract_desc, target_department, proposed_date, proposed_time,
        mode, venue_or_link, expected_attendees, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROPOSED')`,
      [
        lectureId,
        effectiveEmail,
        effectiveName,
        alumniDesignation || '',
        alumniCompany || '',
        topic || 'Guest Lecture',
        abstractDesc || '',
        targetDepartment || 'All Departments',
        proposedDate || new Date().toISOString().split('T')[0],
        proposedTime || '15:00:00',
        mappedLectureMode,
        venueOrLink || 'Campus Auditorium / Video Link',
        expectedAttendees || 100,
      ]
    );

    // Notify Faculty & Admin in Realtime
    emitRealtimeEvent(['role:Faculty', 'role:Administrator'], 'alumni.guest_lecture.proposed', {
      lectureId,
      alumniName,
      topic,
      proposedDate,
    });

    res.status(201).json({ status: 'success', message: 'Guest lecture proposal submitted to institution!', lectureId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getGuestLectures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail } = req.query;
    let query = `SELECT * FROM alumni_guest_lectures`;
    const params: any[] = [];

    if (alumniEmail) {
      query += ` WHERE alumni_email = ?`;
      params.push(alumniEmail);
    }
    query += ` ORDER BY id DESC`;

    const [rows]: any = await pool.query(query, params);
    res.status(200).json({ status: 'success', lectures: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateGuestLectureStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lectureId } = req.params;
    const { status, coordinatorName, coordinatorEmail, venueOrLink } = req.body;

    const [existing]: any = await pool.query(`SELECT * FROM alumni_guest_lectures WHERE lecture_id = ? LIMIT 1`, [lectureId]);
    if (existing.length === 0) {
      res.status(404).json({ status: 'error', message: 'Guest lecture not found.' });
      return;
    }

    const lec = existing[0];

    await pool.query(
      `UPDATE alumni_guest_lectures SET
        status = ?,
        faculty_coordinator_name = COALESCE(?, faculty_coordinator_name),
        faculty_coordinator_email = COALESCE(?, faculty_coordinator_email),
        venue_or_link = COALESCE(?, venue_or_link)
       WHERE lecture_id = ?`,
      [status, coordinatorName || null, coordinatorEmail || null, venueOrLink || null, lectureId]
    );

    emitRealtimeEvent([`user:${(lec.alumni_email || '').toLowerCase().trim()}`], 'alumni.guest_lecture.updated', {
      lectureId,
      topic: lec.topic,
      status,
    });

    res.status(200).json({ status: 'success', message: `Lecture status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 10. Alumni Contributions & Volunteering
export const submitContribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail, alumniName, contributionType, details, availabilityPeriod } = req.body;
    const contributionId = `CON-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_contributions (contribution_id, alumni_email, alumni_name, contribution_type, details, availability_period, status)
       VALUES (?, ?, ?, ?, ?, ?, 'OFFERED')`,
      [contributionId, alumniEmail, alumniName, contributionType, details, availabilityPeriod || 'Flexible']
    );

    res.status(201).json({ status: 'success', message: 'Volunteering interest registered successfully!', contributionId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getContributions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail } = req.query;
    let query = `SELECT * FROM alumni_contributions`;
    const params: any[] = [];
    if (alumniEmail) {
      query += ` WHERE alumni_email = ?`;
      params.push(alumniEmail);
    }
    query += ` ORDER BY id DESC`;

    const [rows]: any = await pool.query(query, params);
    res.status(200).json({ status: 'success', contributions: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 11. Alumni Collaborations (Alumni, Student, Faculty)
export const createCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      inviterEmail,
      leadResearcher,
      inviterName,
      inviterRole,
      inviteeEmail,
      alumniEmail,
      inviteeName,
      inviteeRole,
      projectTitle,
      title,
      description,
      researchDomain,
      requiredSkills,
      requiredExpertise,
      expectedDuration,
    } = req.body;

    const inEmail = inviterEmail || leadResearcher || 'faculty@nexus.campus.edu';
    const inName = inviterName || inEmail.split('@')[0];
    const inRole = inviterRole || 'Faculty';
    const outEmail = inviteeEmail || alumniEmail || 'alumni@nexus.campus.edu';
    const outName = inviteeName || outEmail.split('@')[0];
    const outRole = inviteeRole || 'Alumni';
    const pTitle = projectTitle || title || 'Research Collaboration';
    const pDesc = description || researchDomain || 'Collaborative research exploration';
    const pSkills = requiredSkills || requiredExpertise || '';

    const collabId = `COL-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_collaborations (collab_id, inviter_email, inviter_name, inviter_role, invitee_email, invitee_name, invitee_role, project_title, description, required_skills, expected_duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [collabId, inEmail, inName, inRole, outEmail, outName, outRole, pTitle, pDesc, typeof pSkills === 'object' ? JSON.stringify(pSkills) : pSkills, expectedDuration || '1-3 months']
    );

    emitRealtimeEvent([`user:${outEmail.toLowerCase().trim()}`], 'research.opportunity.created', {
      collabId,
      projectTitle: pTitle,
      inviterName: inName,
      inviterRole: inRole,
    });

    res.status(201).json({ status: 'success', message: 'Collaboration request sent successfully!', collabId, projectId: collabId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getCollaborations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail } = req.query;
    const [rows]: any = await pool.query(
      `SELECT * FROM alumni_collaborations WHERE inviter_email = ? OR invitee_email = ? ORDER BY id DESC`,
      [userEmail, userEmail]
    );
    res.status(200).json({ status: 'success', collaborations: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const respondCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collabId } = req.params;
    const { status } = req.body; // 'ACCEPTED' | 'DECLINED'

    const [existing]: any = await pool.query(`SELECT * FROM alumni_collaborations WHERE collab_id = ? LIMIT 1`, [collabId]);
    if (existing.length === 0) {
      res.status(404).json({ status: 'error', message: 'Collaboration not found.' });
      return;
    }

    const col = existing[0];
    await pool.query(`UPDATE alumni_collaborations SET status = ? WHERE collab_id = ?`, [status, collabId]);

    emitRealtimeEvent([`user:${(col.inviter_email || '').toLowerCase().trim()}`], 'research.request.updated', {
      collabId,
      projectTitle: col.project_title,
      status,
      responderName: col.invitee_name,
    });

    res.status(200).json({ status: 'success', message: `Collaboration status updated to ${status}!` });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 12. Alumni Documents & Certificates
export const addDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail, documentTitle, documentType, fileUrl } = req.body;

    let mappedType = documentType || 'Other';
    const typeUpper = (mappedType || '').toUpperCase();
    if (typeUpper.includes('DEGREE')) mappedType = 'Degree Certificate';
    else if (typeUpper.includes('EXPERIENCE')) mappedType = 'Experience Letter';
    else if (typeUpper.includes('AWARD') || typeUpper.includes('ACHIEVEMENT')) mappedType = 'Achievement / Award';
    else if (typeUpper.includes('PUBLICATION')) mappedType = 'Publication';
    else if (typeUpper.includes('PATENT')) mappedType = 'Patent';
    else if (typeUpper.includes('IDENTITY') || typeUpper.includes('ID')) mappedType = 'Identity Proof';
    else if (!['Degree Certificate', 'Experience Letter', 'Achievement / Award', 'Publication', 'Patent', 'Identity Proof', 'Other'].includes(mappedType)) mappedType = 'Other';

    const docId = `DOC-${Date.now()}`;

    await pool.query(
      `INSERT INTO alumni_documents (doc_id, alumni_email, document_title, document_type, file_url, verification_status)
       VALUES (?, ?, ?, ?, ?, 'SELF_REPORTED')`,
      [docId, alumniEmail, documentTitle, mappedType, fileUrl]
    );

    res.status(201).json({ status: 'success', message: 'Document registered successfully!', docId });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alumniEmail } = req.query;
    const [rows]: any = await pool.query(`SELECT * FROM alumni_documents WHERE alumni_email = ? ORDER BY id DESC`, [alumniEmail]);
    res.status(200).json({ status: 'success', documents: rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM alumni_documents WHERE id = ? OR doc_id = ?`, [id, id]);
    res.status(200).json({ status: 'success', message: 'Document deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 13. Admin Alumni Management (Verify, Reject, Clarification, Suspend, Reactivate & Analytics)
export const getAdminAlumniList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collegeName } = req.query;

    let query = `SELECT id, full_name, username, email, mobile, photograph_url, graduation_year, degree, department, student_registration_number, college_name, current_company, current_designation, alumni_id, verification_status, verification_notes, clarification_message, suspended_reason, is_active, created_at FROM alumni WHERE 1=1`;
    const params: any[] = [];

    if (collegeName && collegeName !== 'All') {
      query += ` AND (college_name = ? OR college_name LIKE ? OR college_name IS NULL OR college_name = '')`;
      params.push(collegeName, `%${collegeName}%`);
    }

    query += ` ORDER BY id DESC`;

    const [rows]: any = await pool.query(query, params);

    const pending = rows.filter((a: any) => a.verification_status === 'PENDING');
    const verified = rows.filter((a: any) => a.verification_status === 'VERIFIED');
    const rejected = rows.filter((a: any) => a.verification_status === 'REJECTED');
    const suspended = rows.filter((a: any) => a.verification_status === 'SUSPENDED');
    const underReview = rows.filter((a: any) => a.verification_status === 'UNDER_REVIEW' || a.verification_status === 'CLARIFICATION_REQUIRED');

    res.status(200).json({
      status: 'success',
      total: rows.length,
      counts: {
        total: rows.length,
        pending: pending.length,
        verified: verified.length,
        rejected: rejected.length,
        suspended: suspended.length,
        underReview: underReview.length,
      },
      all: rows,
      pending,
      verified,
      rejected,
      suspended,
      underReview,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateAlumniVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, email, alumniEmail, action, status: rawStatus, notes, clarificationMessage, suspendedReason } = req.body;

    const effectiveEmail = email || alumniEmail;
    let effectiveStatus = rawStatus;
    if (!effectiveStatus && action) {
      if (action.toUpperCase() === 'APPROVE' || action.toUpperCase() === 'ACCEPTED') effectiveStatus = 'VERIFIED';
      else if (action.toUpperCase() === 'REJECT' || action.toUpperCase() === 'DECLINED') effectiveStatus = 'REJECTED';
      else effectiveStatus = action;
    }

    if (!effectiveStatus || (!id && !effectiveEmail)) {
      res.status(400).json({ status: 'error', message: 'ID/Email and status or action are required.' });
      return;
    }

    let generatedAlumniId: string | null = null;
    let targetEmail = effectiveEmail;

    // Fetch alumni record
    const [rows]: any = await pool.query(`SELECT * FROM alumni WHERE id = ? OR email = ? LIMIT 1`, [id || 0, effectiveEmail || '']);
    if (rows.length > 0) {
      const alumni = rows[0];
      targetEmail = alumni.email;

      if (effectiveStatus === 'VERIFIED') {
        if (!alumni.alumni_id) {
          const deptCode = (alumni.department || 'CSE').substring(0, 3).toUpperCase();
          const yr = alumni.graduation_year || '2023';
          const seq = String(alumni.id).padStart(3, '0');
          generatedAlumniId = `ALM-${yr}-${deptCode}-${seq}`;
        } else {
          generatedAlumniId = alumni.alumni_id;
        }
      }
    }

    const isActive = effectiveStatus === 'SUSPENDED' ? 0 : 1;

    await pool.query(
      `UPDATE alumni SET
        verification_status = ?,
        alumni_id = COALESCE(?, alumni_id),
        verification_notes = COALESCE(?, verification_notes),
        clarification_message = COALESCE(?, clarification_message),
        suspended_reason = COALESCE(?, suspended_reason),
        is_active = ?
       WHERE id = ? OR email = ?`,
      [
        effectiveStatus,
        generatedAlumniId || null,
        notes || null,
        clarificationMessage || null,
        suspendedReason || null,
        isActive,
        id || 0,
        effectiveEmail || '',
      ]
    );

    // Emit Realtime Event for instant frontend sync
    if (targetEmail) {
      emitRealtimeEvent(
        [`user:${targetEmail.toLowerCase().trim()}`, 'role:Administrator', 'role:Alumni'],
        'alumni.verification.updated',
        {
          email: targetEmail,
          status: effectiveStatus,
          alumniId: generatedAlumniId,
          notes,
          clarificationMessage,
        }
      );
    }

    res.status(200).json({
      status: 'success',
      message: `Alumni status updated to ${effectiveStatus}!`,
      alumniId: generatedAlumniId,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAlumniAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [byYear]: any = await pool.query(
      `SELECT graduation_year as year, COUNT(*) as count FROM alumni GROUP BY graduation_year ORDER BY graduation_year DESC`
    );
    const [byDepartment]: any = await pool.query(
      `SELECT department, COUNT(*) as count FROM alumni GROUP BY department`
    );
    const [byIndustry]: any = await pool.query(
      `SELECT industry, COUNT(*) as count FROM alumni GROUP BY industry`
    );
    const [byStatus]: any = await pool.query(
      `SELECT verification_status as status, COUNT(*) as count FROM alumni GROUP BY verification_status`
    );

    // Operational statistics
    const [[{ totalVerifiedAlumni }]]: any = await pool.query(`SELECT COUNT(*) as totalVerifiedAlumni FROM alumni WHERE verification_status = 'VERIFIED'`);
    const [[{ totalJobsPosted }]]: any = await pool.query(`SELECT COUNT(*) as totalJobsPosted FROM alumni_job_posts`);
    const [[{ totalMentorshipRequests }]]: any = await pool.query(`SELECT COUNT(*) as totalMentorshipRequests FROM alumni_mentorship_requests`);
    const [[{ totalMentors }]]: any = await pool.query(`SELECT COUNT(*) as totalMentors FROM alumni WHERE mentorship_available = 1`);
    const [[{ activeJobs }]]: any = await pool.query(`SELECT COUNT(*) as activeJobs FROM alumni_job_posts WHERE status = 'ACTIVE'`);
    const [[{ activeReferrals }]]: any = await pool.query(`SELECT COUNT(*) as activeReferrals FROM alumni_referrals WHERE status = 'PENDING'`);
    const [[{ activeCollabs }]]: any = await pool.query(`SELECT COUNT(*) as activeCollabs FROM alumni_collaborations WHERE status = 'PENDING' OR status = 'ACCEPTED'`);

    res.status(200).json({
      status: 'success',
      analytics: {
        totalVerifiedAlumni,
        totalJobsPosted,
        totalMentorshipRequests,
        byYear,
        byDepartment,
        byIndustry,
        byStatus,
        kpi: {
          totalVerifiedAlumni,
          totalJobsPosted,
          totalMentorshipRequests,
          totalMentors,
          activeJobs,
          activeReferrals,
          activeCollabs,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 14. AI Alumni Assistant (Resume advice, Bio Generator, Connection Message Drafts, Referral Notes)
export const generateAlumniAiAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { promptType, name, company, designation, skills, targetRole, topic } = req.body;

    let responseText = '';

    if (promptType === 'BIO_GENERATOR') {
      responseText = `Passionate and results-driven ${designation || 'Software Professional'} at ${company || 'Top Tech Firm'} specializing in ${skills || 'Technology, Cloud Computing & AI'}. Graduated with a strong academic background, dedicated to mentoring the next generation of engineers and fostering campus industry collaborations.`;
    } else if (promptType === 'NETWORKING_MESSAGE') {
      responseText = `Hi ${name || 'Alumnus'},\n\nI am currently a student at NEXUS Campus interested in ${topic || 'Software Engineering'}. I noticed your impressive journey as a ${designation || 'Specialist'} at ${company || 'your organization'}. I would love to connect and learn from your professional experience!`;
    } else if (promptType === 'MENTORSHIP_PITCH') {
      responseText = `Dear ${name || 'Mentor'},\n\nI am reaching out to request your mentorship for my career goals in ${topic || 'Technology & Engineering'}. Having followed your achievements, your advice would be invaluable in guiding my project choices and interview preparation. Thank you for your time!`;
    } else if (promptType === 'JOB_DESCRIPTION') {
      responseText = `We are hiring a ${targetRole || 'Software Engineer Intern'} at ${company || 'Our Company'}!\n\nKey Responsibilities:\n- Design, develop, and test scalable web services\n- Collaborate with cross-functional engineering teams\n- Requirements: ${skills || 'Problem Solving, Algorithms, Data Structures'}\n\nApply via NEXUS Alumni Job Portal.`;
    } else if (promptType === 'REFERRAL_PITCH') {
      responseText = `Dear ${name || 'Senior Alumnus'},\n\nI am excited to apply for the ${targetRole || 'Software Engineer'} role at ${company || 'your company'}. Given my academic background in Computer Science and hands-on projects in ${skills || 'Full-Stack Development'}, I would be deeply grateful if you could consider referring my profile internally. Thank you!`;
    } else {
      responseText = `AI Career Assistant Ready. Please specify prompt type.`;
    }

    res.status(200).json({
      status: 'success',
      generatedContent: responseText,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
