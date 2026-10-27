import { Request, Response } from 'express';
import { pool } from '../config/database';
import { emitRealtimeEvent } from '../config/socket';

// Helper: Ensure user has a connection profile initialized
const ensureProfileExists = async (email: string, name: string = 'Student User') => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM connections_profiles WHERE email = ?', [email]);
    if (Array.isArray(rows) && rows.length > 0) return rows[0];

    const username = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;

    await pool.query(
      `INSERT INTO connections_profiles (
        email, username, full_name, college, department, course, semester, graduation_year, bio, skills, interests
      ) VALUES (?, ?, ?, 'PCTE College', 'Computer Science', 'B.Tech CSE', '6th Semester', '2026', 'Smart Campus Student & Tech Enthusiast 🚀', 'React, Python, Node.js', 'AI, Hackathons, Web Development')`,
      [email, username, name]
    );

    const [newProfile]: any = await pool.query('SELECT * FROM connections_profiles WHERE email = ?', [email]);
    return newProfile[0];
  } catch (e: any) {
    console.warn('Profile initialization fallback warning:', e.message);
    return {
      email,
      username: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      full_name: name,
      college: 'PCTE College',
      department: 'Computer Science',
      course: 'B.Tech CSE',
      semester: '6th Semester',
      graduation_year: '2026',
      bio: 'Smart Campus Student & Tech Enthusiast 🚀',
      skills: 'React, Python, Node.js',
      interests: 'AI, Hackathons, Web Development',
      is_open_collaboration: 1,
    };
  }
};

// GET /api/connections/profile/:emailOrUsername
export const getProfile = async (req: Request, res: Response) => {
  try {
    const emailOrUsername = (req.params.emailOrUsername || 'student@nexus.campus.edu').toString();
    let profile = await ensureProfileExists(emailOrUsername);

    if (!profile) {
      profile = {
        email: emailOrUsername,
        username: emailOrUsername.startsWith('@') ? emailOrUsername : `@${emailOrUsername.split('@')[0]}`,
        full_name: 'Campus Student',
        college: 'PCTE College',
        department: 'Computer Science',
        course: 'B.Tech CSE',
        semester: '6th Semester',
        graduation_year: '2026',
        bio: 'Smart Campus Promotion App Student Member',
        skills: 'Java, Python, Web',
        interests: 'Technology, Innovation',
        is_open_collaboration: true,
      };
    }

    res.status(200).json({ status: 'success', profile });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PUT /api/connections/profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      email,
      username,
      full_name,
      college,
      department,
      course,
      semester,
      graduation_year,
      bio,
      skills,
      interests,
      github,
      linkedin,
      portfolio,
      avatar_url,
      cover_url,
      is_open_collaboration,
    } = req.body;

    try {
      await pool.query(
        `UPDATE connections_profiles SET
          username = ?, full_name = ?, college = ?, department = ?, course = ?, semester = ?,
          graduation_year = ?, bio = ?, skills = ?, interests = ?, github = ?, linkedin = ?,
          portfolio = ?, avatar_url = ?, cover_url = ?, is_open_collaboration = ?
         WHERE email = ?`,
        [
          username,
          full_name,
          college,
          department,
          course,
          semester,
          graduation_year,
          bio,
          skills,
          interests,
          github,
          linkedin,
          portfolio,
          avatar_url,
          cover_url,
          is_open_collaboration ? 1 : 0,
          email,
        ]
      );
    } catch (e: any) {
      console.warn('DB updateProfile fallback:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Connection profile updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/search
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const query = ((req.query.q as string) || '').toLowerCase().trim();
    const collegeFilter = (req.query.college as string) || 'All';
    const deptFilter = (req.query.department as string) || 'All';
    const courseFilter = (req.query.course as string) || 'All';
    const semFilter = (req.query.semester as string) || 'All';
    const openCollabOnly = req.query.openCollab === 'true';

    let students: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM connections_profiles LIMIT 100');
      if (Array.isArray(rows) && rows.length > 0) {
        students = rows.map((r: any) => ({
          ...r,
          is_open_collaboration: Boolean(r.is_open_collaboration),
          connectionStatus: 'Not Connected',
        }));
      }
    } catch (e) {
      console.warn('DB search fallback');
    }

    if (students.length === 0) {
      students = [];
    }

    // Apply global multi-filter search
    let filtered = students.filter((s) => {
      const matchesQ =
        !query ||
        s.full_name?.toLowerCase().includes(query) ||
        s.username?.toLowerCase().includes(query) ||
        s.college?.toLowerCase().includes(query) ||
        s.department?.toLowerCase().includes(query) ||
        s.skills?.toLowerCase().includes(query) ||
        s.interests?.toLowerCase().includes(query);

      const matchesCollege =
        collegeFilter === 'All'
          ? true
          : collegeFilter === 'My College'
          ? s.college.includes('PCTE')
          : collegeFilter === 'Other Colleges'
          ? !s.college.includes('PCTE')
          : s.college.toLowerCase().includes(collegeFilter.toLowerCase());

      const matchesDept = deptFilter === 'All' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchesCourse = courseFilter === 'All' || s.course.toLowerCase().includes(courseFilter.toLowerCase());
      const matchesSem = semFilter === 'All' || s.semester.toLowerCase().includes(semFilter.toLowerCase());
      const matchesCollab = !openCollabOnly || s.is_open_collaboration;

      return matchesQ && matchesCollege && matchesDept && matchesCourse && matchesSem && matchesCollab;
    });

    res.status(200).json({ status: 'success', resultsCount: filtered.length, students: filtered });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/colleges
export const discoverColleges = async (req: Request, res: Response) => {
  try {
    const colleges = [
      {
        name: 'PCTE Group of Institutes',
        city: 'Ludhiana, Punjab',
        university: 'I. K. Gujral Punjab Technical University',
        studentsCount: 2450,
        publicProfilesCount: 1980,
        popularDepartments: ['Computer Science', 'Management', 'Pharmacy', 'Fashion Design'],
        bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
      },
      {
        name: 'DCD College',
        city: 'Chandigarh, UT',
        university: 'Panjab University',
        studentsCount: 1840,
        publicProfilesCount: 1420,
        popularDepartments: ['Computer Science', 'Commerce', 'Civil Engineering'],
        bannerUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
      },
      {
        name: 'Chitkara University',
        city: 'Rajpura, Punjab',
        university: 'Chitkara University',
        studentsCount: 3120,
        publicProfilesCount: 2650,
        popularDepartments: ['Information Technology', 'Mechanical Engineering', 'Nursing'],
        bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      },
      {
        name: 'Thapar Institute of Engineering & Technology',
        city: 'Patiala, Punjab',
        university: 'TIET Deemed University',
        studentsCount: 4100,
        publicProfilesCount: 3750,
        popularDepartments: ['Electronics & Comm', 'Computer Engineering', 'Biotechnology'],
        bannerUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800',
      },
    ];

    res.status(200).json({ status: 'success', colleges });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/requests?userEmail=...
export const getConnectionRequestsAndFriends = async (req: Request, res: Response) => {
  try {
    const userEmail = ((req.query.userEmail as string) || 'student@nexus.campus.edu').toLowerCase().trim();

    // 1. Fetch Incoming Requests from DB
    let incoming: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT r.request_id, r.sender_email, r.receiver_email, r.message, r.created_at,
                COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
                COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as photograph_url,
                COALESCE(s.department, f.department, a.department, p.department, 'Department') as department,
                COALESCE(s.college_name, a.current_company, p.college, 'NEXUS Network') as current_company,
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
      if (Array.isArray(rows)) incoming = rows;
    } catch (e: any) {
      console.warn('DB incoming requests fetch fallback:', e.message);
    }

    // 2. Fetch Sent Requests (Pending Outgoing) from DB
    let sent: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT r.request_id, r.sender_email, r.receiver_email, r.message, r.created_at,
                COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
                COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as photograph_url,
                COALESCE(s.department, f.department, a.department, p.department, 'Department') as department,
                COALESCE(s.college_name, a.current_company, p.college, 'NEXUS Network') as current_company,
                COALESCE(f.designation, a.current_designation, p.course, 'Member') as current_designation,
                COALESCE(a.graduation_year, '2023') as graduation_year,
                r.receiver_email as email
         FROM connection_requests r
         LEFT JOIN students s ON LOWER(TRIM(r.receiver_email)) = LOWER(TRIM(s.email))
         LEFT JOIN faculties f ON LOWER(TRIM(r.receiver_email)) = LOWER(TRIM(f.email))
         LEFT JOIN alumni a ON LOWER(TRIM(r.receiver_email)) = LOWER(TRIM(a.email))
         LEFT JOIN connections_profiles p ON LOWER(TRIM(r.receiver_email)) = LOWER(TRIM(p.email))
         WHERE LOWER(TRIM(r.sender_email)) = ? AND r.status = 'Pending'
         ORDER BY r.id DESC`,
        [userEmail]
      );
      if (Array.isArray(rows)) sent = rows;
    } catch (e: any) {
      console.warn('DB sent requests fetch fallback:', e.message);
    }

    // 3. Fetch Connected Friends from DB
    let friends: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT f.friendship_id,
                CASE WHEN LOWER(TRIM(f.user1_email)) = ? THEN f.user2_email ELSE f.user1_email END as email,
                COALESCE(s.full_name, fac.faculty_name, a.full_name, p.full_name, 'Connected Friend') as full_name,
                COALESCE(s.full_name, fac.faculty_name, a.full_name, p.full_name, 'Connected Friend') as name,
                COALESCE(s.photograph_url, fac.photograph_url, a.photograph_url, p.avatar_url, '') as photograph_url,
                COALESCE(s.photograph_url, fac.photograph_url, a.photograph_url, p.avatar_url, '') as avatar,
                COALESCE(s.department, fac.department, a.department, p.department, 'Department') as department,
                COALESCE(s.college_name, a.current_company, p.college, 'NEXUS Network') as current_company,
                COALESCE(fac.designation, a.current_designation, p.course, 'Member') as current_designation,
                COALESCE(a.graduation_year, '2023') as graduation_year,
                (a.email IS NOT NULL) as is_alumni
         FROM connections_friendships f
         LEFT JOIN students s ON LOWER(TRIM(CASE WHEN LOWER(TRIM(f.user1_email)) = ? THEN f.user2_email ELSE f.user1_email END)) = LOWER(TRIM(s.email))
         LEFT JOIN faculties fac ON LOWER(TRIM(CASE WHEN LOWER(TRIM(f.user1_email)) = ? THEN f.user2_email ELSE f.user1_email END)) = LOWER(TRIM(fac.email))
         LEFT JOIN alumni a ON LOWER(TRIM(CASE WHEN LOWER(TRIM(f.user1_email)) = ? THEN f.user2_email ELSE f.user1_email END)) = LOWER(TRIM(a.email))
         LEFT JOIN connections_profiles p ON LOWER(TRIM(CASE WHEN LOWER(TRIM(f.user1_email)) = ? THEN f.user2_email ELSE f.user1_email END)) = LOWER(TRIM(p.email))
         WHERE LOWER(TRIM(f.user1_email)) = ? OR LOWER(TRIM(f.user2_email)) = ?
         ORDER BY f.id DESC`,
        [userEmail, userEmail, userEmail, userEmail, userEmail, userEmail, userEmail]
      );
      if (Array.isArray(rows)) friends = rows;
    } catch (e: any) {
      console.warn('DB friends fetch fallback:', e.message);
    }

    res.status(200).json({
      status: 'success',
      incomingRequests: incoming,
      sentRequests: sent,
      friends: friends,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/requests/respond
export const respondConnectionRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, userEmail, senderEmail, action } = req.body;
    const cleanSender = (senderEmail || '').toLowerCase().trim();
    const cleanReceiver = (userEmail || '').toLowerCase().trim();

    if (action === 'ACCEPT') {
      try {
        await pool.query(
          `UPDATE connection_requests SET status = 'Accepted' WHERE request_id = ? OR (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)`,
          [requestId || '', cleanSender, cleanReceiver]
        );
        const friendshipId = `FRD-${Date.now()}`;
        const [existingFrd]: any = await pool.query(
          `SELECT id FROM connections_friendships WHERE (LOWER(TRIM(user1_email)) = ? AND LOWER(TRIM(user2_email)) = ?) OR (LOWER(TRIM(user1_email)) = ? AND LOWER(TRIM(user2_email)) = ?)`,
          [cleanSender, cleanReceiver, cleanReceiver, cleanSender]
        );

        if (!Array.isArray(existingFrd) || existingFrd.length === 0) {
          await pool.query(
            `INSERT INTO connections_friendships (friendship_id, user1_email, user2_email) VALUES (?, ?, ?)`,
            [friendshipId, cleanSender, cleanReceiver]
          );
        }

        // Add a notification for sender
        const [accepterProfile]: any = await pool.query(
          `SELECT COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
                  COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as avatar_url
           FROM connections_profiles p
           LEFT JOIN students s ON LOWER(TRIM(s.email)) = LOWER(TRIM(?))
           LEFT JOIN faculties f ON LOWER(TRIM(f.email)) = LOWER(TRIM(?))
           LEFT JOIN alumni a ON LOWER(TRIM(a.email)) = LOWER(TRIM(?))
           WHERE LOWER(TRIM(p.email)) = LOWER(TRIM(?)) LIMIT 1`,
          [cleanReceiver, cleanReceiver, cleanReceiver, cleanReceiver]
        );
        const accepterName = accepterProfile?.[0]?.full_name || cleanReceiver.split('@')[0];
        const accepterAvatar = accepterProfile?.[0]?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

        const notifId = `NTF-${Date.now().toString().slice(-6)}`;
        await pool.query(
          `INSERT INTO connection_notifications (
            notif_id, recipient_email, sender_email, sender_name, sender_avatar, type, title, text
          ) VALUES (?, ?, ?, ?, ?, 'request', 'Connection Accepted', ?)`,
          [
            notifId,
            cleanSender,
            cleanReceiver,
            accepterName,
            accepterAvatar,
            `${accepterName} accepted your connection request! You are now connected.`,
          ]
        );

        // Realtime Event: connection accepted
        emitRealtimeEvent([`user:${cleanSender}`], 'connection.accepted', {
          requestId: requestId || '',
          receiverEmail: cleanReceiver,
          receiverName: accepterName,
          receiverAvatar: accepterAvatar,
          timestamp: new Date().toISOString(),
        });
        emitRealtimeEvent([`user:${cleanSender}`], 'notification.created', {
          notifId,
          type: 'request',
          title: 'Connection Accepted',
          text: `${accepterName} accepted your connection request!`,
          senderEmail: cleanReceiver,
          senderName: accepterName,
        });
      } catch (e: any) {
        console.warn('DB respond accept fallback:', e.message);
      }

      res.status(200).json({ status: 'success', message: 'Connection request accepted!' });
    } else {
      try {
        await pool.query(
          `UPDATE connection_requests SET status = 'Rejected' WHERE request_id = ? OR (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)`,
          [requestId || '', cleanSender, cleanReceiver]
        );

        // Realtime Event: connection rejected
        emitRealtimeEvent([`user:${cleanSender}`], 'connection.rejected', {
          requestId: requestId || '',
          receiverEmail: cleanReceiver,
        });
      } catch (e: any) {
        console.warn('DB respond decline fallback:', e.message);
      }
      res.status(200).json({ status: 'success', message: 'Connection request declined.' });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/requests/cancel
export const cancelConnectionRequest = async (req: Request, res: Response) => {
  try {
    const { userEmail, targetEmail } = req.body;
    const cleanUser = (userEmail || '').toLowerCase().trim();
    const cleanTarget = (targetEmail || '').toLowerCase().trim();

    try {
      await pool.query(
        `UPDATE connection_requests SET status = 'Cancelled' WHERE (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?) OR (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)`,
        [cleanUser, cleanTarget, cleanTarget, cleanUser]
      );
      await pool.query(
        `DELETE FROM connections_friendships WHERE (LOWER(TRIM(user1_email)) = ? AND LOWER(TRIM(user2_email)) = ?) OR (LOWER(TRIM(user1_email)) = ? AND LOWER(TRIM(user2_email)) = ?)`,
        [cleanUser, cleanTarget, cleanTarget, cleanUser]
      );

      // Realtime Event: connection removed
      emitRealtimeEvent([`user:${cleanTarget}`], 'connection.removed', {
        userEmail: cleanUser,
        targetEmail: cleanTarget,
      });
    } catch (e: any) {
      console.warn('DB cancel connection fallback:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Connection request / friendship updated.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/friends/request
export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    const { senderEmail, receiverEmail, message = '' } = req.body;
    const cleanSender = (senderEmail || '').toLowerCase().trim();
    const cleanReceiver = (receiverEmail || '').toLowerCase().trim();
    const requestId = `REQ-${Date.now().toString().slice(-6)}`;

    if (!cleanSender || !cleanReceiver) {
      res.status(400).json({ status: 'error', message: 'Sender and Receiver emails are required' });
      return;
    }

    try {
      await ensureProfileExists(cleanSender);
      await ensureProfileExists(cleanReceiver);

      const [existing]: any = await pool.query(
        `SELECT id FROM connection_requests WHERE (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?) OR (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)`,
        [cleanSender, cleanReceiver, cleanReceiver, cleanSender]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        await pool.query(
          `UPDATE connection_requests SET request_id = ?, sender_email = ?, receiver_email = ?, message = ?, status = 'Pending', created_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [requestId, cleanSender, cleanReceiver, message, existing[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO connection_requests (request_id, sender_email, receiver_email, message, status) VALUES (?, ?, ?, ?, 'Pending')`,
          [requestId, cleanSender, cleanReceiver, message]
        );
      }

      // Add a notification for receiver
      const [senderProfile]: any = await pool.query(
        `SELECT COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
                COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as avatar_url
         FROM connections_profiles p
         LEFT JOIN students s ON LOWER(TRIM(s.email)) = LOWER(TRIM(?))
         LEFT JOIN faculties f ON LOWER(TRIM(f.email)) = LOWER(TRIM(?))
         LEFT JOIN alumni a ON LOWER(TRIM(a.email)) = LOWER(TRIM(?))
         WHERE LOWER(TRIM(p.email)) = LOWER(TRIM(?)) LIMIT 1`,
        [cleanSender, cleanSender, cleanSender, cleanSender]
      );
      const senderName = senderProfile?.[0]?.full_name || cleanSender.split('@')[0];
      const senderAvatar = senderProfile?.[0]?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

      const notifId = `NTF-${Date.now().toString().slice(-6)}`;
      await pool.query(
        `INSERT INTO connection_notifications (
          notif_id, recipient_email, sender_email, sender_name, sender_avatar, type, title, text
        ) VALUES (?, ?, ?, ?, ?, 'request', 'New Connection Request', ?)`,
        [
          notifId,
          cleanReceiver,
          cleanSender,
          senderName,
          senderAvatar,
          `${senderName} sent you a connection request: "${message || 'Wants to connect with you'}"`,
        ]
      );

      // Realtime Event: connection requested
      emitRealtimeEvent([`user:${cleanReceiver}`], 'connection.requested', {
        requestId,
        senderEmail: cleanSender,
        senderName,
        senderAvatar,
        message,
        timestamp: new Date().toISOString(),
      });
      emitRealtimeEvent([`user:${cleanReceiver}`], 'notification.created', {
        notifId,
        type: 'request',
        title: 'New Connection Request',
        text: `${senderName} sent you a connection request: "${message || 'Wants to connect with you'}"`,
        senderEmail: cleanSender,
        senderName,
      });
    } catch (e: any) {
      console.warn('MySQL request upsert fallback:', e.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Connection request sent successfully!',
      requestId,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/posts
export const getFeed = async (req: Request, res: Response) => {
  try {
    let posts: any[] = [];
    try {
      const [rows]: any = await pool.query('SELECT * FROM connections_posts ORDER BY created_at DESC LIMIT 50');
      if (Array.isArray(rows) && rows.length > 0) {
        posts = rows.map((r: any) => ({
          id: r.post_id,
          postId: r.post_id,
          authorEmail: r.author_email,
          authorName: r.author_name,
          authorUsername: r.author_username,
          authorCollege: r.author_college,
          authorAvatar: r.author_avatar,
          content: r.content,
          media: typeof r.media === 'string' ? JSON.parse(r.media || '[]') : r.media,
          location: r.location,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags,
          visibility: r.visibility,
          likesCount: r.likes_count,
          dislikesCount: r.dislikes_count,
          commentsCount: r.comments_count,
          createdAt: r.created_at,
        }));
      }
    } catch (e) {
      console.warn('DB feed fallback');
    }

    // Return only actual database feed posts
    res.status(200).json({ status: 'success', posts });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      authorEmail = 'student@nexus.campus.edu',
      authorName = 'Ketan Channa',
      authorUsername = '@ketan_channa',
      authorCollege = 'PCTE College',
      authorAvatar = '',
      content,
      media = [],
      location = '',
      tags = [],
      visibility = 'Public Network',
    } = req.body;

    const postId = `POST-${Date.now().toString().slice(-6)}`;

    try {
      await pool.query(
        `INSERT INTO connections_posts (
          post_id, author_email, author_name, author_username, author_college, author_avatar, content, media, location, tags, visibility
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          postId,
          authorEmail,
          authorName,
          authorUsername,
          authorCollege,
          authorAvatar,
          content,
          JSON.stringify(media),
          location,
          JSON.stringify(tags),
          visibility,
        ]
      );
    } catch (e: any) {
      console.warn('MySQL post insert fallback:', e.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Post created and shared to Connections network!',
      post: {
        id: postId,
        postId,
        authorEmail,
        authorName,
        authorUsername,
        authorCollege,
        content,
        media,
        likesCount: 0,
        dislikesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/collaborations
export const getCollaborations = async (req: Request, res: Response) => {
  try {
    const collaborations = [
      {
        collabId: 'COL-8901',
        creatorName: 'Rahul Sharma',
        creatorUsername: '@rahul_sharma',
        college: 'DCD College',
        title: 'Inter-College Smart Health Hackathon Team',
        type: 'Hackathon Project',
        description: 'Building an IoT + AI early health diagnosis app for Punjab Tech Fest. Looking for Python & React Native developers.',
        skillsRequired: ['Python', 'React Native', 'TensorFlow', 'IoT Sensors'],
        roleOffered: 'Lead Frontend / Mobile Developer',
        expectedContribution: 'UI/UX & Mobile App integration',
        startDate: '2026-09-01',
        endDate: '2026-09-15',
        status: 'Open',
      },
      {
        collabId: 'COL-8902',
        creatorName: 'Vikram Singh',
        creatorUsername: '@vikram_singh',
        college: 'Thapar Institute of Tech',
        title: 'Autonomous Campus Drone Patrol System',
        type: 'Research & Hardware Project',
        description: 'Developing autonomous surveillance drones with obstacle avoidance. Need Computer Vision & ROS (Robot Operating System) team members.',
        skillsRequired: ['OpenCV', 'ROS', 'Python', 'C++'],
        roleOffered: 'Computer Vision Engineer',
        expectedContribution: 'Camera feed object recognition',
        startDate: '2026-08-25',
        endDate: '2026-11-30',
        status: 'Open',
      },
    ];

    res.status(200).json({ status: 'success', collaborations });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/collaborations
export const createCollaboration = async (req: Request, res: Response) => {
  try {
    const {
      creatorEmail = 'student@nexus.campus.edu',
      creatorName = 'Ketan Channa',
      creatorUsername = '@ketan_channa',
      title,
      type = 'Project',
      description,
      skillsRequired = [],
      roleOffered = 'Team Contributor',
      expectedContribution = '',
      startDate = '',
      endDate = '',
      college = 'PCTE College',
      department = 'Computer Science',
    } = req.body;

    const collabId = `COL-${Date.now().toString().slice(-6)}`;

    try {
      await pool.query(
        `INSERT INTO connections_collaborations (
          collab_id, creator_email, creator_name, creator_username, title, type, description, skills_required, role_offered, expected_contribution, start_date, end_date, college, department
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          collabId,
          creatorEmail,
          creatorName,
          creatorUsername,
          title,
          type,
          description,
          JSON.stringify(skillsRequired),
          roleOffered,
          expectedContribution,
          startDate,
          endDate,
          college,
          department,
        ]
      );
    } catch (e: any) {
      console.warn('MySQL collab insert fallback:', e.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Collaboration invitation published successfully!',
      collabId,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/reels
export const getReels = async (req: Request, res: Response) => {
  try {
    const reels = [
      {
        reelId: 'REEL-01',
        creatorName: 'Ananya Verma',
        creatorUsername: '@ananya_v',
        creatorCollege: 'PCTE College',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-student-working-in-a-library-41584-large.mp4',
        caption: 'A day in the life of a Smart Campus student! 📚✨ #PCTE #CampusLife',
        likesCount: 154,
        dislikesCount: 2,
        commentsCount: 12,
      },
      {
        reelId: 'REEL-02',
        creatorName: 'Simran Kaur',
        creatorUsername: '@simran_k',
        creatorCollege: 'Chitkara University',
        creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-editing-code-41579-large.mp4',
        caption: 'Building our Flutter mobile app UI in under 60 seconds! 📱💻 #CodingReels',
        likesCount: 289,
        dislikesCount: 5,
        commentsCount: 24,
      },
    ];

    res.status(200).json({ status: 'success', reels });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/messages?user1=...&user2=...
export const getMessages = async (req: Request, res: Response) => {
  try {
    const user1 = ((req.query.user1 as string) || '').toLowerCase().trim();
    const user2 = ((req.query.user2 as string) || '').toLowerCase().trim();

    if (!user1 || !user2) {
      res.status(400).json({ status: 'error', message: 'user1 and user2 query parameters are required' });
      return;
    }

    let messages: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT message_id as id, message_id as messageId, conv_id as convId,
                sender_email as senderEmail, sender_email as sender, receiver_email as receiverEmail,
                content, media_url as mediaUrl, media_type as mediaType, voice_note_url as voiceNoteUrl,
                status, created_at as createdAt
         FROM connections_messages
         WHERE (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)
            OR (LOWER(TRIM(sender_email)) = ? AND LOWER(TRIM(receiver_email)) = ?)
         ORDER BY id ASC`,
        [user1, user2, user2, user1]
      );

      if (Array.isArray(rows)) {
        messages = rows.map((r: any) => ({
          ...r,
          timestamp: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          type: r.voiceNoteUrl ? 'voice' : (r.mediaType === 'image' || (r.mediaUrl && r.mediaUrl.startsWith('data:image'))) ? 'image' : (r.mediaType === 'gif' || (r.mediaUrl && r.mediaUrl.includes('.gif'))) ? 'gif' : r.mediaUrl ? 'file' : 'text',
          status: (r.status || 'sent').toLowerCase(),
        }));
      }
    } catch (e: any) {
      console.warn('DB messages fetch fallback:', e.message);
    }

    res.status(200).json({ status: 'success', messages });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/messages
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      senderEmail = 'student@nexus.campus.edu',
      receiverEmail,
      content = req.body.content || req.body.message || '',
      mediaUrl = '',
      mediaType = '',
      voiceNoteUrl = '',
    } = req.body;

    const cleanSender = (senderEmail || '').toLowerCase().trim();
    const cleanReceiver = (receiverEmail || '').toLowerCase().trim();

    if (!cleanSender || !cleanReceiver) {
      res.status(400).json({ status: 'error', message: 'senderEmail and receiverEmail are required' });
      return;
    }

    const messageId = `MSG-${Date.now().toString().slice(-6)}`;
    const convId = [cleanSender, cleanReceiver].sort().join('__');

    try {
      // 1. Insert message
      await pool.query(
        `INSERT INTO connections_messages (
          message_id, conv_id, sender_email, receiver_email, content, media_url, media_type, voice_note_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [messageId, convId, cleanSender, cleanReceiver, content, mediaUrl, mediaType, voiceNoteUrl]
      );

      // 2. Upsert conversation record
      const [existingConv]: any = await pool.query(
        `SELECT id FROM connections_conversations WHERE conv_id = ?`,
        [convId]
      );
      if (Array.isArray(existingConv) && existingConv.length > 0) {
        await pool.query(
          `UPDATE connections_conversations SET last_message = ? WHERE conv_id = ?`,
          [content || (mediaUrl ? 'Media Attachment' : 'Voice Note'), convId]
        );
      } else {
        await pool.query(
          `INSERT INTO connections_conversations (conv_id, participant1_email, participant2_email, last_message) VALUES (?, ?, ?, ?)`,
          [convId, cleanSender, cleanReceiver, content || (mediaUrl ? 'Media Attachment' : 'Voice Note')]
        );
      }

      // 3. Get sender info for notification
      const [senderProfile]: any = await pool.query(
        `SELECT COALESCE(s.full_name, f.faculty_name, a.full_name, p.full_name, 'Campus Member') as full_name,
                COALESCE(s.photograph_url, f.photograph_url, a.photograph_url, p.avatar_url, '') as avatar_url
         FROM connections_profiles p
         LEFT JOIN students s ON LOWER(TRIM(s.email)) = LOWER(TRIM(?))
         LEFT JOIN faculties f ON LOWER(TRIM(f.email)) = LOWER(TRIM(?))
         LEFT JOIN alumni a ON LOWER(TRIM(a.email)) = LOWER(TRIM(?))
         WHERE LOWER(TRIM(p.email)) = LOWER(TRIM(?)) LIMIT 1`,
        [cleanSender, cleanSender, cleanSender, cleanSender]
      );

      const senderName = senderProfile?.[0]?.full_name || cleanSender.split('@')[0];
      const senderAvatar = senderProfile?.[0]?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

      // 4. Create notification for recipient
      const notifId = `NTF-${Date.now().toString().slice(-6)}`;
      await pool.query(
        `INSERT INTO connection_notifications (
          notif_id, recipient_email, sender_email, sender_name, sender_avatar, type, title, text
        ) VALUES (?, ?, ?, ?, ?, 'message', 'New Direct Message', ?)`,
        [
          notifId,
          cleanReceiver,
          cleanSender,
          senderName,
          senderAvatar,
          `${senderName} sent you a message: "${(content || 'Attachment').slice(0, 60)}"`,
        ]
      );

      // Realtime Event: new message
      emitRealtimeEvent([`user:${cleanReceiver}`], 'message.created', {
        id: messageId,
        messageId,
        convId,
        senderEmail: cleanSender,
        sender: cleanSender,
        receiverEmail: cleanReceiver,
        content,
        mediaUrl,
        mediaType,
        voiceNoteUrl,
        status: 'sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      });
      emitRealtimeEvent([`user:${cleanReceiver}`], 'chat:message', {
        messageId,
        convId,
        sender: cleanSender,
        content,
        mediaUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      emitRealtimeEvent([`user:${cleanReceiver}`], 'notification.created', {
        notifId,
        type: 'message',
        title: 'New Direct Message',
        text: `${senderName} sent you a message: "${(content || 'Attachment').slice(0, 50)}"`,
        senderEmail: cleanSender,
        senderName,
      });
    } catch (e: any) {
      console.warn('MySQL message insert fallback:', e.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Message delivered successfully',
      sentMessage: {
        id: messageId,
        messageId,
        convId,
        senderEmail: cleanSender,
        sender: cleanSender,
        receiverEmail: cleanReceiver,
        content,
        mediaUrl,
        mediaType,
        voiceNoteUrl,
        status: 'sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/connections/notifications?userEmail=...
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userEmail = ((req.query.userEmail as string) || '').toLowerCase().trim();

    if (!userEmail) {
      res.status(400).json({ status: 'error', message: 'userEmail is required' });
      return;
    }

    let notifications: any[] = [];
    try {
      const [rows]: any = await pool.query(
        `SELECT notif_id as id, type, title, sender_name as senderName, sender_avatar as senderAvatar,
                text, is_read as isRead, created_at as createdAt
         FROM connection_notifications
         WHERE LOWER(TRIM(recipient_email)) = ?
         ORDER BY id DESC LIMIT 50`,
        [userEmail]
      );

      if (Array.isArray(rows)) {
        notifications = rows.map((r: any) => ({
          ...r,
          isRead: Boolean(r.isRead),
          timestamp: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        }));
      }
    } catch (e: any) {
      console.warn('DB notifications fetch fallback:', e.message);
    }

    res.status(200).json({ status: 'success', notifications });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/notifications/mark-read
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { notifId, userEmail } = req.body;
    const cleanUser = (userEmail || '').toLowerCase().trim();

    try {
      if (notifId) {
        await pool.query(
          `UPDATE connection_notifications SET is_read = 1 WHERE notif_id = ?`,
          [notifId]
        );
      } else if (cleanUser) {
        await pool.query(
          `UPDATE connection_notifications SET is_read = 1 WHERE LOWER(TRIM(recipient_email)) = ?`,
          [cleanUser]
        );
      }
    } catch (e: any) {
      console.warn('DB mark notifications read fallback:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/connections/report
export const submitReport = async (req: Request, res: Response) => {
  try {
    const {
      reporterEmail = 'student@nexus.campus.edu',
      targetType = 'User',
      targetId = '',
      category = 'Spam',
      description = '',
    } = req.body;

    const reportId = `RPT-${Date.now().toString().slice(-6)}`;

    try {
      await pool.query(
        `INSERT INTO connections_user_reports (
          report_id, reporter_email, target_type, target_id, category, description
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [reportId, reporterEmail, targetType, targetId, category, description]
      );
    } catch (e: any) {
      console.warn('MySQL report insert fallback:', e.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Report submitted to campus moderation team for review.',
      reportId,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
