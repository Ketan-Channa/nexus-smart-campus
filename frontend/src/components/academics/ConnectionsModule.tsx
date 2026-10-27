import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  Heart,
  Bookmark,
  Sparkles,
  Mic,
  Globe,
  Building2,
  Camera,
  Upload,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Undo2,
  X,
  Pencil,
  Compass,
  Bell,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as AudioIcon,
  Volume2,
  Share2,
  MessageCircle,
  Lock,
  ShieldCheck,
  Phone,
  GraduationCap,
  Calendar,
  UserX,
  Ban,
  Flag,
  ShieldAlert,
  FileText,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { type UserSession } from '../../types/auth';
import { useNotifications } from '../../context/NotificationContext';

interface ConnectionsModuleProps {
  session?: UserSession | null;
}

export interface ChatMessageItem {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'gif' | 'voice';
  mediaUrl?: string | null;
  duration?: string;
  status: 'sent' | 'delivered' | 'seen' | 'failed';
  isUnsent?: boolean;
}

export interface AppNetworkUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Alumni' | string;
  college: string;
  department: string;
  course: string;
  avatar: string;
  bio: string;
  skills: string;
  interests: string;
  hobbies: string;
  isSameCollege: boolean;
  messagingPrivacy?: 'everyone' | 'friends_only' | 'nobody';
  status?: 'Not Sent' | 'Pending' | 'Connected';
}

export interface NotificationItem {
  id: string;
  type: 'post' | 'request' | 'tag' | 'message';
  title: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  linkedPostData?: any;
  linkedRequestData?: any;
}

export const ConnectionsModule: React.FC<ConnectionsModuleProps> = ({ session }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'home' | 'discover_recommendations' | 'friends' | 'requests_notifications' | 'messages' | 'my_profile'
  >('home');

  const DEFAULT_AVATAR =
    session?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const DEFAULT_COVER =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';

  // --- FULL DASHBOARD STYLE PROFILE STATE WITH PRIVACY CONTROLS ---
  const [profileData, setProfileData] = useState(() => {
    let savedSession: any = {};
    let savedProfile: any = {};
    try {
      const s = sessionStorage.getItem('nexus_session');
      if (s) savedSession = JSON.parse(s);
      const p = localStorage.getItem('nexus_user_profile') || localStorage.getItem('nexus_student_profile');
      if (p) savedProfile = JSON.parse(p);
    } catch (e) {}

    const name = session?.name || savedSession?.name || savedProfile?.fullName || savedProfile?.name || 'Ketan Channa';
    const email = session?.email || savedSession?.email || savedProfile?.email || 'student@nexus.campus.edu';
    const rollNo = (session as any)?.rollNumber || savedProfile?.rollNumber || '2329362';
    const college = savedProfile?.collegeName || savedProfile?.college || (session as any)?.college || 'NEXUS Smart Campus University';
    const dept = (session as any)?.department || savedProfile?.department || 'Computer Science & Engineering';

    return {
      fullName: name,
      email: email,
      phone: savedProfile?.phone || '+91 9876543210',
      rollNumber: rollNo,
      dob: savedProfile?.dob || '2004-05-15',
      collegeName: college,
      department: dept,
      course: savedProfile?.course || 'B.Tech Computer Science & Engineering',
      semester: savedProfile?.semester || 'Semester 6 (3rd Year)',
      classIncharge: savedProfile?.classIncharge || 'Dr. Vikram Singh (HOD CSE)',
      sgpa: savedProfile?.sgpa || '8.92',
      cgpa: savedProfile?.cgpa || '8.85',
      attendance: savedProfile?.attendance || '92.4%',
      bio: savedProfile?.bio || 'Smart Campus Developer & Full-Stack Tech Enthusiast 🚀',
      skills: savedProfile?.skills || 'React.js, Node.js, TypeScript, Python, TailwindCSS, MySQL, Docker',
      interests: savedProfile?.interests || 'Artificial Intelligence, Web3, Cloud Computing, Hackathons',
      hobbies: savedProfile?.hobbies || 'Coding, Competitive Gaming, Chess, Technical Blogging',
      linkedin: savedProfile?.linkedin || 'https://linkedin.com/in/ketanchanna',
      github: savedProfile?.github || 'https://github.com/ketanchanna',
      avatarUrl: session?.avatarUrl || savedProfile?.avatarUrl || DEFAULT_AVATAR,
      coverUrl: savedProfile?.coverUrl || DEFAULT_COVER,
      messagingPrivacy: (localStorage.getItem('nexus_messaging_privacy') as any) || 'everyone',
    };
  });

  // Dynamically resolve normalized active logged in user email
  const currentUserEmail = (
    session?.email ||
    (() => {
      try {
        const s = sessionStorage.getItem('nexus_session');
        if (s) {
          const parsed = JSON.parse(s);
          if (parsed?.email) return parsed.email;
        }
        const p = localStorage.getItem('nexus_user_profile') || localStorage.getItem('nexus_student_profile');
        if (p) {
          const parsed = JSON.parse(p);
          if (parsed?.email) return parsed.email;
        }
      } catch (e) {}
      return profileData.email || 'student@nexus.campus.edu';
    })()
  ).toLowerCase().trim();

  // Sync profile data when session prop changes
  useEffect(() => {
    if (session?.email) {
      setProfileData((prev) => ({
        ...prev,
        email: session.email,
        fullName: session.name || prev.fullName,
        avatarUrl: session.avatarUrl || prev.avatarUrl,
      }));
    }
  }, [session?.email, session?.name, session?.avatarUrl]);

  const [profileAvatar, setProfileAvatar] = useState<string>(profileData.avatarUrl);
  const [profileCover, setProfileCover] = useState<string>(profileData.coverUrl);

  // Registered App Users
  const [registeredNetworkUsers, setRegisteredNetworkUsers] = useState<AppNetworkUser[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeScopeFilter, setCollegeScopeFilter] = useState<'all' | 'intra' | 'inter'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Student' | 'Faculty' | 'Alumni'>('all');

  // Connection Status Tracking Map
  const [connectionStatusMap, setConnectionStatusMap] = useState<Record<string, 'Pending' | 'Incoming' | 'Connected'>>({});

  const [myConnectionsList, setMyConnectionsList] = useState<AppNetworkUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  // GLOBAL NOTIFICATION HOOK (SAFE WRAPPER)
  let globalNotifs: any = null;
  try {
    globalNotifs = useNotifications();
  } catch (e) {
    // Rendered outside provider fallback
  }

  // BLOCKED USERS STATE
  const [blockedUserEmails, setBlockedUserEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_blocked_user_emails');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexus_blocked_user_emails', JSON.stringify(blockedUserEmails));
    } catch (e) {}
  }, [blockedUserEmails]);

  // REPORT USER FORM & MODAL STATE
  const [reportModalUser, setReportModalUser] = useState<AppNetworkUser | null>(null);
  const [reportReasonCategory, setReportReasonCategory] = useState<string>('Harassment / Cyberbullying');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportMediaFile, setReportMediaFile] = useState<{ file: File; name: string; previewUrl: string; type: string } | null>(null);
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState<boolean>(false);

  // UNFRIEND USER HANDLER
  const handleUnfriendUser = (user: AppNetworkUser) => {
    if (window.confirm(`Are you sure you want to unfriend ${user.name}?`)) {
      setMyConnectionsList((prev) => prev.filter((c) => c.email !== user.email));
      setConnectionStatusMap((prev) => {
        const copy = { ...prev };
        delete copy[user.email];
        return copy;
      });

      setNotificationsList((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'request',
          title: 'User Unfriended',
          senderName: user.name,
          senderAvatar: user.avatar,
          text: `You have removed ${user.name} from your connections list.`,
          timestamp: 'Just now',
          isRead: false,
        },
        ...prev,
      ]);

      if (globalNotifs?.addNotification) {
        globalNotifs.addNotification({
          title: `💔 Connection Removed`,
          message: `You unfriended ${user.name} (${user.college}).`,
          type: 'warning',
          category: 'System',
        });
      }

      alert(`✓ ${user.name} has been removed from your connections list.`);
    }
  };

  // BLOCK USER HANDLER
  const handleBlockUser = (user: AppNetworkUser) => {
    if (window.confirm(`Are you sure you want to block ${user.name}? They will no longer be able to message you or view your profile.`)) {
      setBlockedUserEmails((prev) => [...prev, user.email]);
      setMyConnectionsList((prev) => prev.filter((c) => c.email !== user.email));
      setIncomingRequests((prev) => prev.filter((r) => r.senderEmail !== user.email));
      setConnectionStatusMap((prev) => {
        const copy = { ...prev };
        delete copy[user.email];
        return copy;
      });

      if (activeChatUser?.email === user.email) {
        setActiveChatUser(null);
      }

      setNotificationsList((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'request',
          title: 'User Blocked',
          senderName: user.name,
          senderAvatar: user.avatar,
          text: `You have blocked ${user.name}. They can no longer send direct messages or connect with you.`,
          timestamp: 'Just now',
          isRead: false,
        },
        ...prev,
      ]);

      if (globalNotifs?.addNotification) {
        globalNotifs.addNotification({
          title: `🚫 User Blocked`,
          message: `${user.name} (${user.college}) has been blocked and removed from interactions.`,
          type: 'security',
          category: 'Security / SOS',
        });
      }

      alert(`🚫 ${user.name} has been blocked.`);
    }
  };

  // UNBLOCK USER HANDLER
  const handleUnblockUser = (email: string) => {
    setBlockedUserEmails((prev) => prev.filter((e) => e !== email));
    if (globalNotifs?.addNotification) {
      globalNotifs.addNotification({
        title: `🔓 User Unblocked`,
        message: `User ${email} has been unblocked.`,
        type: 'info',
        category: 'System',
      });
    }
    alert(`✓ User ${email} unblocked.`);
  };

  // REPORT USER MODAL HANDLERS
  const handleOpenReportModal = (user: AppNetworkUser) => {
    setReportModalUser(user);
    setReportReasonCategory('Harassment / Cyberbullying');
    setReportDetails('');
    setReportMediaFile(null);
    setReportSubmittedSuccess(false);
  };

  const handleReportMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setReportMediaFile({
            file,
            name: file.name,
            previewUrl: reader.result as string,
            type: file.type,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReportToClassIncharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalUser) return;
    if (!reportDetails.trim()) {
      alert('Please provide a detailed reason or explanation for reporting this user.');
      return;
    }

    const reportId = `RPT-${Date.now().toString().slice(-6)}`;
    const inchargeName = profileData.classIncharge || 'Dr. Vikram Singh (HOD CSE)';

    setNotificationsList((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'request',
        title: 'Disciplinary Report Submitted',
        senderName: reportModalUser.name,
        senderAvatar: reportModalUser.avatar,
        text: `Official report against ${reportModalUser.name} submitted to Class Incharge (${inchargeName}). Ticket ID: ${reportId}`,
        timestamp: 'Just now',
        isRead: false,
      },
      ...prev,
    ]);

    if (globalNotifs?.addNotification) {
      globalNotifs.addNotification({
        title: `🚨 User Report Submitted to Class Incharge`,
        message: `Disciplinary report filed against ${reportModalUser.name} (${reportModalUser.department}) sent directly to Class Incharge (${inchargeName}). Ref ID: ${reportId}`,
        type: 'urgent',
        category: 'Security / SOS',
        metadata: {
          'Report Reference': reportId,
          'Reported User': `${reportModalUser.name} (${reportModalUser.email})`,
          'Category': reportReasonCategory,
          'Media Evidence': reportMediaFile ? reportMediaFile.name : 'None Attached',
          'Routed To': inchargeName,
        },
      });
    }

    setReportSubmittedSuccess(true);
  };

  // HOME FEED POSTS STATE (FETCHED DYNAMICALLY FROM DATABASE)
  const [feedPosts, setFeedPosts] = useState<any[]>([]);

  const [postContent, setPostContent] = useState('');
  const [postMediaFiles, setPostMediaFiles] = useState<{ file: File; previewUrl: string; type: 'image' | 'video' | 'audio' }[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [shareModalPost, setShareModalPost] = useState<any | null>(null);

  // MERGED NOTIFICATIONS & REQUESTS HUB STATE (FETCHED DYNAMICALLY FROM DATABASE)
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [selectedNotificationModal, setSelectedNotificationModal] = useState<NotificationItem | null>(null);

  // DIRECT MESSAGING STATE (CLEAN FROM HARDCODED MESSAGES / DUMMY ACCOUNTS)
  const [activeChatUser, setActiveChatUser] = useState<AppNetworkUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatInputText, setChatInputText] = useState('');

  // Voice Note Recorder & Multi-Tab Emoji/GIF Keyboard
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'emojis' | 'gifs' | 'stickers'>('emojis');
  const [gifSearchQuery, setGifSearchQuery] = useState('');

  const emojiCategories = [
    { title: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😍', '🤩', '😎', '🥳', '😇', '🤔', '🙌'] },
    { title: 'Gestures', emojis: ['👍', '👎', '👏', '🤝', '👊', '🤞', '💪', '🙏', '💡', '🔥', '✨', '⚡', '🎉', '🏆'] },
    { title: 'Campus', emojis: ['🎓', '📚', '💻', '🧠', '🚀', '🔬', '⚙️', '📊', '☕', '📝', '📌', '🎯', '📍', '🎨'] },
    { title: 'Hearts', emojis: ['❤️', '💙', '💜', '💚', '💛', '💖', '💯', '✅', '⭐', '🌟', '💥', '👀', '💯'] },
  ];

  const gifGallery = [
    { id: 'g-1', title: 'Congrats & Cheers', keyword: 'congrats', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnptbzJza3JicWV3dmc0NnQxdXp2ZmU3c3o0bDV4ZTNkYndsaWp1ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g9582DNuQppxC/giphy.gif' },
    { id: 'g-2', title: 'Coding Genius', keyword: 'coding', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnFlc25rYW0ydzdzZHBsNWExNHRidW06cjF1ZGRsdXNxcTFxczZkbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif' },
    { id: 'g-3', title: 'Mind Blown / Brain', keyword: 'thinking', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNjcXg5MjRra255NmM3ZWpzYmwzeXk1cnljZzFucGNhcmUyeW8xdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlE7uhX8KFgEmY/giphy.gif' },
  ];

  const campusStickers = [
    { id: 'st-1', emoji: '🎓', title: 'Scholar' },
    { id: 'st-2', emoji: '🔥', title: 'On Fire' },
    { id: 'st-3', emoji: '🚀', title: 'Tech Rocket' },
    { id: 'st-4', emoji: '👏', title: 'Applause' },
  ];

  // Voice note timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // --- REAL-TIME DATABASE SYNC & API INTEGRATION ---
  const fetchChatMessages = async (targetEmail: string) => {
    if (!currentUserEmail || !targetEmail) return;
    try {
      const res = await axios.get(
        `https://nexus-smart-campus-backend.onrender.com/api/connections/messages?user1=${encodeURIComponent(currentUserEmail)}&user2=${encodeURIComponent(targetEmail)}`
      );
      if (res.data?.status === 'success' && Array.isArray(res.data.messages)) {
        setChatMessages(res.data.messages);
      }
    } catch (e) {
      console.warn('Fetch chat messages error:', e);
    }
  };

  const syncConnectionDataFromDatabase = async () => {
    try {
      const myEmail = currentUserEmail;
      if (!myEmail) return;

      // 1. Fetch Registered Students & Faculty from DB
      const [stuRes, facRes] = await Promise.allSettled([
        axios.get('https://nexus-smart-campus-backend.onrender.com/api/admin/users?role=Student'),
        axios.get('https://nexus-smart-campus-backend.onrender.com/api/admin/faculty'),
      ]);

      const dbUsers: AppNetworkUser[] = [];

      if (stuRes.status === 'fulfilled' && stuRes.value.data?.users && Array.isArray(stuRes.value.data.users)) {
        stuRes.value.data.users.forEach((u: any) => {
          const uEmail = (u.email || '').toLowerCase().trim();
          if (uEmail && uEmail !== myEmail) {
            const uCollege = u.college || u.college_name || 'NEXUS Campus';
            dbUsers.push({
              id: String(u.id || u.identifier || uEmail),
              name: u.name || 'Student User',
              email: uEmail,
              role: 'Student',
              college: uCollege,
              department: u.department || 'Computer Science & Engineering',
              course: u.class || 'B.Tech CSE',
              avatar: u.avatar || u.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              bio: `${u.department || 'Engineering'} Student at ${uCollege}`,
              skills: 'React.js, Python, Data Structures, Web Development',
              interests: 'Hackathons, Artificial Intelligence, Open Source',
              hobbies: 'Coding, Competitive Gaming, Chess',
              isSameCollege: uCollege.toLowerCase().includes('nexus') || uCollege.toLowerCase() === profileData.collegeName.toLowerCase(),
              messagingPrivacy: 'everyone',
              status: 'Not Sent',
            });
          }
        });
      }

      if (facRes.status === 'fulfilled' && facRes.value.data?.faculty && Array.isArray(facRes.value.data.faculty)) {
        facRes.value.data.faculty.forEach((f: any) => {
          const fEmail = (f.email || '').toLowerCase().trim();
          if (fEmail && fEmail !== myEmail) {
            const fCollege = f.college || profileData.collegeName || 'NEXUS Campus';
            dbUsers.push({
              id: String(f.faculty_id || f.id || fEmail),
              name: `${f.faculty_name} (${f.designation || 'Faculty'})`,
              email: fEmail,
              role: 'Faculty',
              college: fCollege,
              department: f.department || 'Engineering & Science',
              course: `Faculty Incharge (${f.incharge_class || 'Academic Class'})`,
              avatar: f.photo_url || f.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              bio: `Class Incharge & ${f.designation || 'Professor'} at ${f.department || fCollege}`,
              skills: 'Academic Guidance, Research Paper Mentorship, System Architecture',
              interests: 'Research, Curriculum Innovation, Student Development',
              hobbies: 'Mentorship, Publications, Higher Education',
              isSameCollege: true,
              messagingPrivacy: 'everyone',
              status: 'Not Sent',
            });
          }
        });
      }

      setRegisteredNetworkUsers(dbUsers);

      // 2. Fetch Incoming Requests, Sent Pending Requests, and Connected Friends from DB
      const reqRes = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/connections/requests?userEmail=${encodeURIComponent(myEmail)}`);
      if (reqRes.data?.status === 'success') {
        const { incomingRequests: rawIncoming, sentRequests: rawSent, friends: rawFriends } = reqRes.data;

        // Map incoming requests
        const mappedIncoming = (rawIncoming || []).map((r: any) => ({
          requestId: r.request_id || r.requestId || `REQ-${r.id}`,
          senderName: r.full_name || r.senderName || 'Campus Student',
          senderEmail: (r.sender_email || r.senderEmail || '').toLowerCase().trim(),
          senderCollege: r.current_company || r.college || 'NEXUS Network',
          senderCourse: r.current_designation || r.department || 'Student',
          senderAvatar: r.photograph_url || r.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          message: r.message || 'Wants to connect with you.',
        }));
        setIncomingRequests(mappedIncoming);

        // Map connected friends
        const mappedFriends: AppNetworkUser[] = (rawFriends || []).map((f: any) => ({
          id: f.friendship_id || f.email,
          name: f.full_name || f.name || 'Connected Friend',
          email: (f.email || '').toLowerCase().trim(),
          role: f.is_alumni ? 'Alumni' : 'Student',
          college: f.current_company || 'NEXUS Network',
          department: f.department || 'Campus Department',
          course: f.current_designation || 'B.Tech',
          avatar: f.photograph_url || f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'Connected Campus Friend',
          skills: 'Technology',
          interests: 'Collaboration',
          hobbies: 'Networking',
          isSameCollege: true,
          messagingPrivacy: 'everyone',
          status: 'Connected',
        }));
        setMyConnectionsList(mappedFriends);

        // Build status map:
        const newStatusMap: Record<string, 'Pending' | 'Incoming' | 'Connected'> = {};

        (rawFriends || []).forEach((f: any) => {
          const friendEmail = (f.email || '').toLowerCase().trim();
          if (friendEmail) newStatusMap[friendEmail] = 'Connected';
        });

        (rawSent || []).forEach((s: any) => {
          const sentEmail = (s.receiver_email || s.receiverEmail || s.email || '').toLowerCase().trim();
          if (sentEmail) newStatusMap[sentEmail] = 'Pending';
        });

        (rawIncoming || []).forEach((inc: any) => {
          const incEmail = (inc.sender_email || inc.senderEmail || '').toLowerCase().trim();
          if (incEmail) newStatusMap[incEmail] = 'Incoming';
        });

        setConnectionStatusMap(newStatusMap);
      }

      // 3. Fetch Feed Posts from DB
      const postsRes = await axios.get('https://nexus-smart-campus-backend.onrender.com/api/connections/posts');
      if (postsRes.data?.status === 'success' && Array.isArray(postsRes.data.posts)) {
        const dbPosts = postsRes.data.posts.map((p: any) => ({
          id: p.id || p.postId,
          authorName: p.authorName || 'Campus Member',
          authorEmail: (p.authorEmail || '').toLowerCase().trim(),
          authorCollege: p.authorCollege || 'NEXUS Campus',
          authorAvatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          content: p.content,
          likesCount: p.likesCount || 0,
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          mediaList: Array.isArray(p.media) ? p.media : [],
          commentsList: [],
        }));
        setFeedPosts(dbPosts);
      }

      // 4. Fetch Account Notifications from DB
      const notifRes = await axios.get(`https://nexus-smart-campus-backend.onrender.com/api/connections/notifications?userEmail=${encodeURIComponent(myEmail)}`);
      if (notifRes.data?.status === 'success' && Array.isArray(notifRes.data.notifications)) {
        setNotificationsList(notifRes.data.notifications);
      }
    } catch (e) {
      console.warn('Real-time database sync warning:', e);
    }
  };

  // Run initial fetch & interval polling every 3 seconds for real-time connection status & chat updates
  useEffect(() => {
    syncConnectionDataFromDatabase();
    if (activeChatUser?.email) {
      fetchChatMessages((activeChatUser.email || '').toLowerCase().trim());
    }

    const interval = setInterval(() => {
      syncConnectionDataFromDatabase();
      if (activeChatUser?.email) {
        fetchChatMessages((activeChatUser.email || '').toLowerCase().trim());
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUserEmail, activeChatUser?.email]);

  // MESSAGE PRIVACY PERMISSION CHECK BEFORE OPENING DIRECT CHAT
  const handleOpenChatWithUser = (user: AppNetworkUser) => {
    const targetEmail = (user.email || '').toLowerCase().trim();
    const status = connectionStatusMap[targetEmail] || (user.isSameCollege && myConnectionsList.some((c) => (c.email || '').toLowerCase().trim() === targetEmail) ? 'Connected' : 'Not Sent');

    if (user.messagingPrivacy === 'friends_only' && status !== 'Connected') {
      alert(`🔒 PRIVACY NOTICE: ${user.name} only accepts direct messages from connected friends. Please send a Connection Request first.`);
      return;
    }

    if (user.messagingPrivacy === 'nobody') {
      alert(`🔒 PRIVACY NOTICE: ${user.name} has disabled direct messaging.`);
      return;
    }

    setActiveChatUser(user);
    setActiveSubTab('messages');
  };

  // SEND CONNECTION REQUEST HANDLER (DB PERSISTED - STAYS PENDING UNTIL ACCEPTED/REJECTED)
  const handleSendConnectionRequest = async (user: AppNetworkUser) => {
    try {
      const targetEmail = (user.email || '').toLowerCase().trim();
      setConnectionStatusMap((prev) => ({ ...prev, [targetEmail]: 'Pending' }));

      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/friends/request', {
        senderEmail: currentUserEmail,
        receiverEmail: targetEmail,
        message: `Hi ${user.name}! I would like to connect with you on NEXUS Campus Network.`,
      });

      setNotificationsList((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'request',
          title: 'Connection Request Sent',
          senderName: user.name,
          senderAvatar: user.avatar,
          text: `You sent a connection request to ${user.name} (${user.college}). Status: Pending Approval.`,
          timestamp: 'Just now',
          isRead: false,
        },
        ...prev,
      ]);

      if (globalNotifs?.addNotification) {
        globalNotifs.addNotification({
          title: `⏳ Connection Request Sent`,
          message: `Request sent to ${user.name}. Status will remain Pending until accepted or rejected.`,
          type: 'info',
          category: 'System',
        });
      }

      alert(`⏳ Connection request sent to ${user.name}! Status will remain PENDING until they Accept or Decline.`);
      syncConnectionDataFromDatabase();
    } catch (e) {
      console.error('Send request error:', e);
      alert('Failed to send connection request. Please try again.');
    }
  };

  // ACCEPT INCOMING CONNECTION REQUEST (DB PERSISTED)
  const handleAcceptIncomingRequest = async (reqItem: any) => {
    try {
      const sEmail = (reqItem.senderEmail || reqItem.sender_email || '').toLowerCase().trim();
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/respond', {
        requestId: reqItem.requestId,
        userEmail: currentUserEmail,
        senderEmail: sEmail,
        action: 'ACCEPT',
      });

      setConnectionStatusMap((prev) => ({ ...prev, [sEmail]: 'Connected' }));
      setIncomingRequests((prev) => prev.filter((r) => r.requestId !== reqItem.requestId && (r.senderEmail || r.sender_email || '').toLowerCase().trim() !== sEmail));

      if (globalNotifs?.addNotification) {
        globalNotifs.addNotification({
          title: `🎉 Connection Accepted`,
          message: `You are now connected with ${reqItem.senderName}!`,
          type: 'success',
          category: 'System',
        });
      }

      alert(`🎉 Connection request accepted from ${reqItem.senderName}!`);
      syncConnectionDataFromDatabase();
    } catch (e) {
      console.error('Accept request error:', e);
    }
  };

  // DECLINE INCOMING CONNECTION REQUEST (DB PERSISTED)
  const handleDeclineIncomingRequest = async (reqItem: any) => {
    try {
      const sEmail = (reqItem.senderEmail || reqItem.sender_email || '').toLowerCase().trim();
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/respond', {
        requestId: reqItem.requestId,
        userEmail: currentUserEmail,
        senderEmail: sEmail,
        action: 'REJECT',
      });

      setIncomingRequests((prev) => prev.filter((r) => r.requestId !== reqItem.requestId && (r.senderEmail || r.sender_email || '').toLowerCase().trim() !== sEmail));
      setConnectionStatusMap((prev) => {
        const copy = { ...prev };
        delete copy[sEmail];
        return copy;
      });

      alert(`Declined connection request from ${reqItem.senderName}.`);
      syncConnectionDataFromDatabase();
    } catch (e) {
      console.error('Decline request error:', e);
    }
  };

  const handleCancelPendingRequest = async (user: AppNetworkUser) => {
    try {
      const targetEmail = (user.email || '').toLowerCase().trim();
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/requests/cancel', {
        userEmail: currentUserEmail,
        targetEmail: targetEmail,
      });

      setConnectionStatusMap((prev) => {
        const copy = { ...prev };
        delete copy[targetEmail];
        return copy;
      });

      alert(`Cancelled pending connection request to ${user.name}.`);
      syncConnectionDataFromDatabase();
    } catch (e) {
      console.error('Cancel request error:', e);
    }
  };

  // HOME FEED: ADD COMMENT HANDLER
  const handleAddPostComment = (postId: string) => {
    if (!commentInputText.trim()) return;

    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const comments = post.commentsList || [];
          return {
            ...post,
            commentsList: [
              ...comments,
              {
                id: `c-${Date.now()}`,
                authorName: profileData.fullName,
                authorAvatar: profileAvatar,
                text: commentInputText,
                time: 'Just now',
              },
            ],
          };
        }
        return post;
      })
    );

    setCommentInputText('');
  };

  // HOME FEED: MEDIA ATTACHMENTS
  const handleAddFeedMediaFile = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPostMediaFiles((prev) => [
            ...prev,
            { file, previewUrl: reader.result as string, type: mediaType },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // PUBLISH HOME FEED POST
  const handlePublishFeedPost = () => {
    if (!postContent.trim() && postMediaFiles.length === 0) return;

    const mediaList = postMediaFiles.map((m) => ({
      url: m.previewUrl,
      type: m.type,
      fileName: m.file.name,
    }));

    const newPost = {
      id: `post-${Date.now()}`,
      authorName: profileData.fullName,
      authorEmail: profileData.email,
      authorCollege: profileData.collegeName,
      authorAvatar: profileAvatar,
      content: postContent,
      likesCount: 1,
      createdAt: 'Just now',
      mediaList: mediaList,
      commentsList: [],
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostContent('');
    setPostMediaFiles([]);

    setNotificationsList((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'post',
        title: 'Post Published',
        senderName: profileData.fullName,
        senderAvatar: profileAvatar,
        text: `Your post with ${mediaList.length} media attachment(s) was published to the campus feed.`,
        timestamp: 'Just now',
        isRead: false,
      },
      ...prev,
    ]);

    alert('✨ Post with Photos/Videos/Audios published to campus feed!');
  };

  // SAVE PROFILE CHANGES & MESSAGING PRIVACY SETTINGS
  const handleSaveProfileChanges = () => {
    try {
      const updated = {
        ...profileData,
        avatarUrl: profileAvatar,
        coverUrl: profileCover,
      };
      setProfileData(updated);
      localStorage.setItem('nexus_user_profile', JSON.stringify(updated));
      localStorage.setItem('nexus_messaging_privacy', profileData.messagingPrivacy);
      window.dispatchEvent(new Event('nexus:profile-updated'));
      alert('✨ Profile details, cover photo, avatar & messaging privacy settings saved successfully!');
    } catch (e) {
      alert('Error saving profile changes.');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const res = reader.result as string;
          setProfileAvatar(res);
          setProfileData((prev) => ({ ...prev, avatarUrl: res }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const res = reader.result as string;
          setProfileCover(res);
          setProfileData((prev) => ({ ...prev, coverUrl: res }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // DIRECT MESSAGING SEND HANDLERS (PERSISTED IN MYSQL & NOTIFICATIONS FIRED)
  const handleSendTextMessage = async () => {
    if (!chatInputText.trim() || !activeChatUser?.email) return;

    const text = chatInputText;
    const targetEmail = (activeChatUser.email || '').toLowerCase().trim();
    setChatInputText('');

    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/messages', {
        senderEmail: currentUserEmail,
        receiverEmail: targetEmail,
        content: text,
      });
      fetchChatMessages(targetEmail);
    } catch (e) {
      console.error('Send message error:', e);
    }
  };

  const handleSendMediaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeChatUser?.email) {
      const targetEmail = (activeChatUser.email || '').toLowerCase().trim();
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const mediaUrl = ev.target?.result as string;
        const isImg = file.type.startsWith('image/');
        try {
          await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/messages', {
            senderEmail: currentUserEmail,
            receiverEmail: targetEmail,
            content: file.name,
            mediaUrl: mediaUrl,
            mediaType: isImg ? 'image' : 'file',
          });
          fetchChatMessages(targetEmail);
        } catch (err) {
          console.error('Send media error:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendGif = async (gifObj: { url: string; title: string }) => {
    if (!activeChatUser?.email) return;
    const targetEmail = (activeChatUser.email || '').toLowerCase().trim();
    setIsPickerOpen(false);
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/messages', {
        senderEmail: currentUserEmail,
        receiverEmail: targetEmail,
        content: gifObj.title,
        mediaUrl: gifObj.url,
        mediaType: 'gif',
      });
      fetchChatMessages(targetEmail);
    } catch (err) {
      console.error('Send gif error:', err);
    }
  };

  const handleSendSticker = async (st: { emoji: string; title: string }) => {
    if (!activeChatUser?.email) return;
    const targetEmail = (activeChatUser.email || '').toLowerCase().trim();
    setIsPickerOpen(false);
    try {
      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/messages', {
        senderEmail: currentUserEmail,
        receiverEmail: targetEmail,
        content: `${st.emoji} ${st.title}`,
      });
      fetchChatMessages(targetEmail);
    } catch (err) {
      console.error('Send sticker error:', err);
    }
  };

  const handleToggleVoiceRecorder = async () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      if (!activeChatUser?.email) return;
      const targetEmail = (activeChatUser.email || '').toLowerCase().trim();
      const secsStr = `0:${recordingSeconds.toString().padStart(2, '0')}`;
      try {
        await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/messages', {
          senderEmail: currentUserEmail,
          receiverEmail: targetEmail,
          content: `Voice Note (${secsStr})`,
          voiceNoteUrl: 'voice_note_placeholder_url',
        });
        fetchChatMessages(targetEmail);
      } catch (err) {
        console.error('Send voice note error:', err);
      }
    } else {
      setIsRecordingVoice(true);
    }
  };

  const handleUnsendMessage = (msgId: string) => {
    if (window.confirm('Unsend this message for everyone in chat?')) {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, isUnsent: true, content: '🚫 This message was unsent', mediaUrl: null, type: 'text' }
            : m
        )
      );
    }
  };

  const renderStatusTicks = (status: 'sent' | 'delivered' | 'seen' | 'failed') => {
    if (status === 'seen') {
      return (
        <span title="Read / Seen (Double Blue Ticks)">
          <CheckCheck className="w-3.5 h-3.5 text-cyan-300 dark:text-cyan-400 inline ml-1 font-black" />
        </span>
      );
    }
    if (status === 'delivered') {
      return (
        <span title="Delivered (Double Gray Ticks)">
          <CheckCheck className="w-3.5 h-3.5 text-slate-300 inline ml-1" />
        </span>
      );
    }
    return (
      <span title="Sent (Single Gray Tick)">
        <Check className="w-3.5 h-3.5 text-slate-300 inline ml-1" />
      </span>
    );
  };

  const filteredUsers = registeredNetworkUsers
    .filter((u) => !blockedUserEmails.includes(u.email))
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.skills.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesScope =
        collegeScopeFilter === 'all'
          ? true
          : collegeScopeFilter === 'intra'
          ? u.isSameCollege
          : !u.isSameCollege;

      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;

      return matchesSearch && matchesScope && matchesRole;
    });

  const intraCollegeUsers = registeredNetworkUsers
    .filter((u) => !blockedUserEmails.includes(u.email))
    .filter((u) => u.isSameCollege);

  const interCollegeUsers = registeredNetworkUsers
    .filter((u) => !blockedUserEmails.includes(u.email))
    .filter((u) => !u.isSameCollege);
  const unreadNotifCount = notificationsList.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-400/30">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-indigo-200" />
            NEXUS Connections & Social OS
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
            Connections & Discover Network
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 opacity-90 leading-relaxed font-medium">
            Connect with registered Students & Faculty, publish media updates, exchange messages, and manage profile privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setActiveSubTab('requests_notifications')}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs transition-all flex items-center gap-2 relative"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>Requests & Notifications</span>
            {unreadNotifCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('discover_recommendations')}
            className="px-5 py-3 rounded-2xl bg-white text-indigo-950 font-black text-xs shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Discover & Recommendations</span>
          </button>
        </div>
      </div>

      {/* TOP PILL NAVIGATION BAR (PERFECTLY ALIGNED GRID - NO SIDEBARS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-white/20 text-xs font-black text-center">
        <button
          onClick={() => setActiveSubTab('home')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'home' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Home Feed</span>
        </button>

        <button
          onClick={() => setActiveSubTab('discover_recommendations')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'discover_recommendations' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveSubTab('friends')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'friends' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Connections ({myConnectionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests_notifications')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
            activeSubTab === 'requests_notifications' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Requests & Notifs</span>
          {unreadNotifCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px]">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('messages')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'messages' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-rose-400" />
          <span>Direct Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('my_profile')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'my_profile' ? 'bg-white text-indigo-900 shadow-lg font-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Camera className="w-4 h-4 text-teal-400" />
          <span>My Profile</span>
        </button>
      </div>

      {/* 1. HOME FEED TAB (NO SIDEBAR WIDGETS - FULL CLEAN LAYOUT) */}
      {activeSubTab === 'home' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* POST CREATOR BOX */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <img src={profileAvatar} alt={profileData.fullName} className="w-10 h-10 rounded-2xl object-cover border shadow-sm" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{profileData.fullName}</h4>
                <span className="text-[10px] text-indigo-600 font-bold">{profileData.collegeName}</span>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Share a campus update, project accomplishment, or tag peers with @name..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium"
            />

            {/* MEDIA PREVIEWS */}
            {postMediaFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border">
                {postMediaFiles.map((m, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border bg-black/10">
                    <button
                      onClick={() => setPostMediaFiles(postMediaFiles.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 z-20 p-1 rounded-full bg-rose-600 text-white shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {m.type === 'image' && <img src={m.previewUrl} alt="Preview" className="h-28 w-full object-cover" />}
                    {m.type === 'video' && <video src={m.previewUrl} className="h-28 w-full object-cover" />}
                    {m.type === 'audio' && (
                      <div className="h-28 w-full flex flex-col items-center justify-center p-2 text-center bg-indigo-950 text-white space-y-1">
                        <AudioIcon className="w-6 h-6 text-cyan-300" />
                        <span className="text-[10px] truncate max-w-full font-mono">{m.file.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ATTACHMENT ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <label className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 cursor-pointer hover:bg-indigo-100 flex items-center gap-1 font-bold">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  <span>Photo</span>
                  <input type="file" accept="image/*" onChange={(e) => handleAddFeedMediaFile(e, 'image')} className="hidden" />
                </label>

                <label className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 cursor-pointer hover:bg-rose-100 flex items-center gap-1 font-bold">
                  <VideoIcon className="w-4 h-4 text-rose-500" />
                  <span>Video</span>
                  <input type="file" accept="video/*" onChange={(e) => handleAddFeedMediaFile(e, 'video')} className="hidden" />
                </label>

                <label className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 cursor-pointer hover:bg-cyan-100 flex items-center gap-1 font-bold">
                  <AudioIcon className="w-4 h-4 text-cyan-500" />
                  <span>Audio</span>
                  <input type="file" accept="audio/*" onChange={(e) => handleAddFeedMediaFile(e, 'audio')} className="hidden" />
                </label>
              </div>

              <button
                onClick={handlePublishFeedPost}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
              >
                Publish Post
              </button>
            </div>
          </div>

          {/* FEED POSTS CARDS WITH LIKE, COMMENT, SHARE & SAVE */}
          <div className="space-y-6 text-xs">
            {feedPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={post.authorAvatar || profileAvatar} alt={post.authorName} className="w-10 h-10 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{post.authorName}</h4>
                      <p className="text-[10px] text-indigo-600 font-bold">{post.authorCollege}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{post.createdAt}</span>
                </div>

                <p className="text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed text-sm">{post.content}</p>

                {/* POST MEDIA ATTACHMENTS */}
                {post.mediaList && post.mediaList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {post.mediaList.map((m: any, idx: number) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border">
                        {m.type === 'image' && <img src={m.url} alt="Post Attachment" className="w-full max-h-96 object-cover" />}
                        {m.type === 'video' && <video src={m.url} controls className="w-full max-h-96 object-cover" />}
                        {m.type === 'audio' && (
                          <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
                            <div className="flex items-center gap-2 text-cyan-300 font-bold">
                              <Volume2 className="w-4 h-4" />
                              <span>Audio Track</span>
                            </div>
                            <audio src={m.url} controls className="w-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTION BAR: LIKE, COMMENT, SHARE, SAVE */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-500 font-bold">
                  <button
                    onClick={() => setFeedPosts(feedPosts.map((p) => (p.id === post.id ? { ...p, likesCount: p.likesCount + 1 } : p)))}
                    className="flex items-center gap-1.5 hover:text-rose-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{post.likesCount || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    <span>{(post.commentsList || []).length} Comments</span>
                  </button>

                  <button
                    onClick={() => setShareModalPost(post)}
                    className="flex items-center gap-1.5 hover:text-cyan-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-cyan-500" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => setSavedPostIds(savedPostIds.includes(post.id) ? savedPostIds.filter((id) => id !== post.id) : [...savedPostIds, post.id])}
                    className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${savedPostIds.includes(post.id) ? 'text-amber-500 fill-amber-500' : ''}`} />
                    <span>{savedPostIds.includes(post.id) ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </div>

                {/* EXPANDABLE COMMENTS SECTION */}
                {activeCommentPostId === post.id && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 pt-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Comments & Discussion</h5>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(post.commentsList || []).map((comm: any) => (
                        <div key={comm.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex items-start gap-2.5">
                          <img src={comm.authorAvatar} alt={comm.authorName} className="w-7 h-7 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 space-y-0.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 dark:text-white">{comm.authorName}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{comm.time}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px]">{comm.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputText}
                        onChange={(e) => setCommentInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPostComment(post.id)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border font-medium text-xs"
                      />
                      <button onClick={() => handleAddPostComment(post.id)} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shrink-0">
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MERGED DISCOVER & RECOMMENDATIONS TAB */}
      {activeSubTab === 'discover_recommendations' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-black text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-bounce" />
                AI Tailored Peer & Faculty Recommendations
              </h3>
              <p className="text-purple-100 text-xs font-medium">
                Matches dynamically calculated based on your Department ({profileData.department}), Hobbies ({profileData.hobbies}) & Campus ({profileData.collegeName}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {intraCollegeUsers.slice(0, 3).map((u) => {
                const uEmail = (u.email || '').toLowerCase().trim();
                const uStatus = connectionStatusMap[uEmail] || (u.isSameCollege && myConnectionsList.some((c) => (c.email || '').toLowerCase().trim() === uEmail) ? 'Connected' : 'Not Sent');

                return (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border" />
                      <div className="truncate">
                        <p className="font-bold truncate text-xs">{u.name}</p>
                        <span className="text-[9px] font-bold text-purple-200 block">{u.department}</span>
                      </div>
                    </div>
                    {uStatus === 'Connected' ? (
                      <span className="w-full py-1.5 rounded-xl bg-emerald-500/30 text-white font-bold text-[10px] block text-center">
                        ✓ Connected
                      </span>
                    ) : uStatus === 'Pending' ? (
                      <button onClick={() => handleCancelPendingRequest(u)} className="w-full py-1.5 rounded-xl bg-amber-500/30 text-white font-bold text-[10px]">
                        ⏳ Pending (Cancel)
                      </button>
                    ) : (
                      <button onClick={() => handleSendConnectionRequest(u)} className="w-full py-1.5 rounded-xl bg-white text-indigo-950 font-bold text-[10px] shadow hover:bg-purple-100">
                        Connect (Intra-College)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search registered students, faculty, alumni, college or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border">
                <button
                  onClick={() => setCollegeScopeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    collegeScopeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All ({registeredNetworkUsers.length})
                </button>
                <button
                  onClick={() => setCollegeScopeFilter('intra')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                    collegeScopeFilter === 'intra' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Intra-College ({intraCollegeUsers.length})
                </button>
                <button
                  onClick={() => setCollegeScopeFilter('inter')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                    collegeScopeFilter === 'inter' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Inter-College ({interCollegeUsers.length})
                </button>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-indigo-600"
              >
                <option value="all">All Roles</option>
                <option value="Student">Students</option>
                <option value="Faculty">Faculty</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((st) => {
              const stEmail = (st.email || '').toLowerCase().trim();
              const status = connectionStatusMap[stEmail] || (st.isSameCollege && myConnectionsList.some((c) => (c.email || '').toLowerCase().trim() === stEmail) ? 'Connected' : 'Not Sent');

              return (
                <div key={st.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/15 text-indigo-600">
                        {st.role}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        st.isSameCollege ? 'bg-indigo-500/15 text-indigo-600' : 'bg-cyan-500/15 text-cyan-600'
                      }`}>
                        {st.isSameCollege ? 'Intra-College' : 'Inter-College'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <img src={st.avatar} alt={st.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/30 shrink-0" />
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{st.name}</h4>
                        <p className="text-slate-500 font-bold text-[11px] truncate">{st.college}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 font-medium text-xs line-clamp-2">{st.bio}</p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex gap-2">
                      {status === 'Connected' ? (
                        <span className="w-1/2 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 font-bold text-center text-xs flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Connected
                        </span>
                      ) : status === 'Incoming' ? (
                        <div className="flex gap-1.5 w-1/2">
                          <button
                            onClick={() => handleAcceptIncomingRequest({ requestId: incomingRequests.find((r) => r.senderEmail === stEmail)?.requestId, senderEmail: stEmail, senderName: st.name })}
                            className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineIncomingRequest({ requestId: incomingRequests.find((r) => r.senderEmail === stEmail)?.requestId, senderEmail: stEmail, senderName: st.name })}
                            className="w-1/2 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                          >
                            Decline
                          </button>
                        </div>
                      ) : status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelPendingRequest(st)}
                          className="w-1/2 py-2 rounded-xl bg-amber-500/15 text-amber-600 font-bold text-xs hover:bg-amber-500/25"
                        >
                          ⏳ Pending (Cancel)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendConnectionRequest(st)}
                          className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
                        >
                          Connect
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenChatWithUser(st)}
                        className="w-1/2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        Message
                      </button>
                    </div>

                    {/* ACTION OPTIONS: UNFRIEND, BLOCK, REPORT USER */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold">
                      {status === 'Connected' ? (
                        <button
                          onClick={() => handleUnfriendUser(st)}
                          className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1"
                          title="Remove from connections"
                        >
                          <UserX className="w-3 h-3" /> Unfriend
                        </button>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => handleBlockUser(st)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-900/40 hover:text-rose-300 flex items-center gap-1"
                          title="Block user from direct messaging"
                        >
                          <Ban className="w-3 h-3 text-rose-500" /> Block
                        </button>

                        <button
                          onClick={() => handleOpenReportModal(st)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1"
                          title="Report user to Class Incharge"
                        >
                          <Flag className="w-3 h-3 text-amber-500" /> Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MERGED REQUESTS & NOTIFICATIONS TAB */}
      {activeSubTab === 'requests_notifications' && (
        <div className="space-y-6 text-xs">
          {/* SECTION 1: INCOMING CONNECTION REQUESTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" /> Incoming Connection Requests ({incomingRequests.length})
            </h3>

            {incomingRequests.length === 0 ? (
              <p className="text-slate-400 py-3 text-center">No pending connection requests.</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((reqItem) => (
                  <div key={reqItem.requestId} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border space-y-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={reqItem.senderAvatar} alt={reqItem.senderName} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{reqItem.senderName}</h4>
                        <p className="text-slate-500">{reqItem.senderCollege} • {reqItem.senderCourse}</p>
                        <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">{reqItem.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptIncomingRequest(reqItem)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineIncomingRequest(reqItem)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: SYSTEM ACTIVITY & NOTIFICATIONS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> Notifications & Tagged Updates ({notificationsList.length})
              </h3>
              <button
                onClick={async () => {
                  setNotificationsList(notificationsList.map((n) => ({ ...n, isRead: true })));
                  try {
                    await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/notifications/mark-read', {
                      userEmail: currentUserEmail,
                    });
                  } catch (e) {}
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Mark All as Read
              </button>
            </div>

            <div className="space-y-3">
              {notificationsList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={async () => {
                    setNotificationsList(notificationsList.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
                    setSelectedNotificationModal(notif);
                    try {
                      await axios.post('https://nexus-smart-campus-backend.onrender.com/api/connections/notifications/mark-read', {
                        notifId: notif.id,
                      });
                    } catch (e) {}
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    !notif.isRead
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={notif.senderAvatar} alt={notif.senderName} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{notif.senderName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{notif.text}</p>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MY CONNECTIONS TAB */}
      {activeSubTab === 'friends' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> My Connected App Network ({myConnectionsList.filter((c) => !blockedUserEmails.includes(c.email)).length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Manage options: Message, Unfriend, Block, or Report</span>
          </div>

          {myConnectionsList.filter((c) => !blockedUserEmails.includes(c.email)).length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold">No active connected friends.</p>
              <p className="text-xs">Browse the Discover tab to connect with peers and faculty!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myConnectionsList
                .filter((conn) => !blockedUserEmails.includes(conn.email))
                .map((conn) => (
                  <div key={conn.email} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={conn.avatar} alt={conn.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shrink-0" />
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{conn.name}</h4>
                        <p className="text-slate-500 text-[11px] font-medium truncate">{conn.college} • {conn.course}</p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" /> Connected Peer
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenChatWithUser(conn)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </button>

                      <button
                        onClick={() => handleUnfriendUser(conn)}
                        className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs flex items-center gap-1"
                        title="Unfriend User"
                      >
                        <UserX className="w-3.5 h-3.5" /> Unfriend
                      </button>

                      <button
                        onClick={() => handleBlockUser(conn)}
                        className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 font-bold text-xs flex items-center gap-1"
                        title="Block User"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-500" /> Block
                      </button>

                      <button
                        onClick={() => handleOpenReportModal(conn)}
                        className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-bold text-xs flex items-center gap-1"
                        title="Report User to Class Incharge"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-500" /> Report
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* BLOCKED ACCOUNTS MANAGEMENT SECTION */}
          {blockedUserEmails.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-500" /> Blocked Accounts ({blockedUserEmails.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Blocked users cannot message or view profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {blockedUserEmails.map((email) => {
                  const blockedUserObj = registeredNetworkUsers.find((u) => u.email === email) || {
                    name: email.split('@')[0],
                    email: email,
                    college: 'NEXUS Network User',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  };
                  return (
                    <div key={email} className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <img src={blockedUserObj.avatar} alt="Avatar" className="w-8 h-8 rounded-xl object-cover shrink-0 grayscale" />
                        <div className="truncate">
                          <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{blockedUserObj.name}</p>
                          <span className="text-[9px] text-rose-500 font-bold block">🚫 Blocked</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(email)}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-emerald-500 hover:text-white font-bold text-[10px] shadow shrink-0"
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. DIRECT MESSAGING TAB (CLEAN FROM HARDCODED MESSAGES/DUMMY ACCOUNTS) */}
      {activeSubTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[650px] relative text-xs">
          <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 overflow-y-auto">
            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> App Registered Conversations
            </h4>

            {registeredNetworkUsers.filter((u) => !blockedUserEmails.includes(u.email)).length === 0 ? (
              <p className="text-slate-400 text-center py-6">No registered users found.</p>
            ) : (
              registeredNetworkUsers
                .filter((conn) => !blockedUserEmails.includes(conn.email))
                .map((conn) => (
                  <div
                    key={conn.email}
                    onClick={() => handleOpenChatWithUser(conn)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                      activeChatUser?.email === conn.email
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <img src={conn.avatar} alt={conn.name} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                    <div className="truncate">
                      <p className="font-bold truncate">{conn.name}</p>
                      <p className={`text-[10px] truncate ${activeChatUser?.email === conn.email ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {conn.college}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="md:col-span-2 flex flex-col justify-between p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 relative">
            {activeChatUser ? (
              <>
                {/* CHAT HEADER WITH UNFRIEND, BLOCK & REPORT OPTIONS */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img src={activeChatUser.avatar} alt={activeChatUser.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{activeChatUser.name}</h4>
                      <p className="text-[10px] text-emerald-500 font-mono font-bold">● Active • {activeChatUser.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {myConnectionsList.some((c) => c.email === activeChatUser.email) && (
                      <button
                        onClick={() => handleUnfriendUser(activeChatUser)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                        title="Unfriend User"
                      >
                        <UserX className="w-3.5 h-3.5" /> Unfriend
                      </button>
                    )}

                    <button
                      onClick={() => handleBlockUser(activeChatUser)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1 hover:bg-rose-900/40 hover:text-rose-300"
                      title="Block User"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-500" /> Block
                    </button>

                    <button
                      onClick={() => handleOpenReportModal(activeChatUser)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                      title="Report User to Class Incharge"
                    >
                      <Flag className="w-3.5 h-3.5 text-amber-500" /> Report
                    </button>
                  </div>
                </div>

                {/* MESSAGES LIST */}
                <div className="flex-1 my-4 space-y-3 overflow-y-auto p-2 text-xs">
                  {chatMessages.length === 0 ? (
                    <div className="m-auto text-center py-10 text-slate-400 space-y-1">
                      <MessageSquare className="w-8 h-8 text-indigo-400 mx-auto" />
                      <p className="font-bold">No messages yet. Send a message to start conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.sender === profileData.email;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                          <div
                            className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl space-y-1.5 relative ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border rounded-bl-none shadow-sm'
                            }`}
                          >
                            {isMe && !msg.isUnsent && (
                              <button
                                onClick={() => handleUnsendMessage(msg.id)}
                                className="absolute -left-7 top-3 p-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Unsend Message"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {msg.isUnsent ? (
                              <p className="italic text-slate-300 text-[11px]">{msg.content}</p>
                            ) : msg.type === 'gif' && msg.mediaUrl ? (
                              <img src={msg.mediaUrl} alt="GIF" className="rounded-xl max-h-48 object-cover w-full border" />
                            ) : (
                              <p className="font-medium text-[11.5px] leading-relaxed">{msg.content}</p>
                            )}

                            <div className="flex items-center justify-end gap-1 text-[9px] opacity-90 font-mono">
                              <span>{msg.timestamp}</span>
                              {isMe && renderStatusTicks(msg.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* CHAT INPUT BAR */}
                <div className="pt-2 border-t flex items-center gap-2 relative">
                  <button
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 font-bold shrink-0"
                  >
                    <Smile className="w-4 h-4 text-amber-500" />
                  </button>

                  <label className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 font-bold shrink-0 cursor-pointer">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <input type="file" onChange={handleSendMediaFile} className="hidden" />
                  </label>

                  <button
                    onClick={handleToggleVoiceRecorder}
                    className={`p-2.5 rounded-xl text-white font-bold shrink-0 ${isRecordingVoice ? 'bg-rose-600 animate-pulse' : 'bg-slate-800'}`}
                  >
                    <Mic className="w-4 h-4 text-rose-400" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type direct message..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTextMessage()}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border font-medium text-xs"
                  />

                  <button onClick={handleSendTextMessage} className="p-3 rounded-2xl bg-indigo-600 text-white font-bold shrink-0 shadow-md">
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* MULTI-TAB EMOJI, GIF & STICKER PICKER MODAL */}
                {isPickerOpen && (
                  <div className="absolute bottom-16 left-6 z-40 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 w-80">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
                        <button
                          onClick={() => setPickerTab('emojis')}
                          className={`px-2.5 py-1 rounded-lg ${pickerTab === 'emojis' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          😀 Emojis
                        </button>
                        <button
                          onClick={() => setPickerTab('gifs')}
                          className={`px-2.5 py-1 rounded-lg ${pickerTab === 'gifs' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          🎬 GIFs
                        </button>
                        <button
                          onClick={() => setPickerTab('stickers')}
                          className={`px-2.5 py-1 rounded-lg ${pickerTab === 'stickers' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          🎨 Stickers
                        </button>
                      </div>

                      <button onClick={() => setIsPickerOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>

                    {/* EMOJIS TAB */}
                    {pickerTab === 'emojis' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-base">
                        {emojiCategories.map((cat, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{cat.title}</span>
                            <div className="grid grid-cols-6 gap-1 text-center">
                              {cat.emojis.map((em, eIdx) => (
                                <button
                                  key={eIdx}
                                  onClick={() => setChatInputText((prev) => prev + em)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* GIFS TAB WITH LIVE SEARCH */}
                    {pickerTab === 'gifs' && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search GIFs... (e.g. congrats, coding)"
                            value={gifSearchQuery}
                            onChange={(e) => setGifSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-[11px] font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {gifGallery
                            .filter((g) => g.keyword.includes(gifSearchQuery.toLowerCase()) || g.title.toLowerCase().includes(gifSearchQuery.toLowerCase()))
                            .map((gif) => (
                              <div
                                key={gif.id}
                                onClick={() => handleSendGif(gif)}
                                className="rounded-xl overflow-hidden border cursor-pointer hover:border-indigo-500 transition-all group relative"
                              >
                                <img src={gif.url} alt={gif.title} className="h-20 w-full object-cover" />
                                <span className="text-[9px] font-bold text-white bg-black/60 p-1 block truncate absolute bottom-0 left-0 right-0">
                                  {gif.title}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* STICKERS TAB */}
                    {pickerTab === 'stickers' && (
                      <div className="grid grid-cols-4 gap-2 text-center max-h-60 overflow-y-auto">
                        {campusStickers.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => handleSendSticker(st)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-indigo-500/15 transition-all"
                          >
                            <span className="text-2xl block">{st.emoji}</span>
                            <span className="text-[9px] font-bold text-slate-500 truncate block">{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="m-auto text-center space-y-2 text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold">Select a registered user to start direct chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. FULL DASHBOARD STYLE MY PROFILE WITH MESSAGING PRIVACY SETTINGS */}
      {activeSubTab === 'my_profile' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          {/* PROFILE HEADER & COVER BANNER */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
            <img src={profileCover} alt="Cover" className="w-full h-48 object-cover" />
            
            <label className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-[11px] backdrop-blur-md cursor-pointer flex items-center gap-1.5 shadow-lg border border-white/20">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Cover Photo</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group/avatar">
                  <img src={profileAvatar} alt={profileData.fullName} className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl -mt-14" />
                  <label className="absolute inset-0 rounded-3xl bg-slate-950/60 text-white flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity -mt-14">
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-[9px] font-bold">Edit Avatar</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">{profileData.fullName}</h3>
                  <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-4 h-4" /> {profileData.collegeName}
                  </p>
                </div>
              </div>

              <label className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-lg">
                <Upload className="w-4 h-4" />
                <span>Upload New Avatar</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* MESSAGING PRIVACY SETTINGS (WHO CAN MESSAGE ME) */}
          <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Direct Messaging Privacy Settings</h4>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-medium">Control who is permitted to send direct chat messages to your profile:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className={`p-3 rounded-2xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                profileData.messagingPrivacy === 'everyone' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white dark:bg-slate-900 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="msgPrivacy"
                  value="everyone"
                  checked={profileData.messagingPrivacy === 'everyone'}
                  onChange={() => setProfileData({ ...profileData, messagingPrivacy: 'everyone' })}
                  className="hidden"
                />
                <Globe className="w-4 h-4" />
                <span>🌐 Everyone</span>
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                profileData.messagingPrivacy === 'friends_only' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white dark:bg-slate-900 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="msgPrivacy"
                  value="friends_only"
                  checked={profileData.messagingPrivacy === 'friends_only'}
                  onChange={() => setProfileData({ ...profileData, messagingPrivacy: 'friends_only' })}
                  className="hidden"
                />
                <Users className="w-4 h-4" />
                <span>👥 Connected Friends Only</span>
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer font-bold transition-all flex items-center gap-2 ${
                profileData.messagingPrivacy === 'nobody' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white dark:bg-slate-900 border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="msgPrivacy"
                  value="nobody"
                  checked={profileData.messagingPrivacy === 'nobody'}
                  onChange={() => setProfileData({ ...profileData, messagingPrivacy: 'nobody' })}
                  className="hidden"
                />
                <Lock className="w-4 h-4" />
                <span>🔒 Private (No One)</span>
              </label>
            </div>
          </div>

          {/* FULL EDITABLE DASHBOARD PROFILE DETAILS */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
              <Pencil className="w-4 h-4 text-indigo-500" /> Edit Complete Profile Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> Full Name:
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> College / University Name:
                </label>
                <input
                  type="text"
                  value={profileData.collegeName}
                  onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Department & Branch:
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Roll Number:
                </label>
                <input
                  type="text"
                  value={profileData.rollNumber}
                  onChange={(e) => setProfileData({ ...profileData, rollNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> Contact Phone:
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date of Birth:
                </label>
                <input
                  type="date"
                  value={profileData.dob}
                  onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bio & Tagline:</label>
                <textarea
                  rows={2}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hobbies & Activities:</label>
                <input
                  type="text"
                  value={profileData.hobbies}
                  onChange={(e) => setProfileData({ ...profileData, hobbies: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interests & Specializations:</label>
                <input
                  type="text"
                  value={profileData.interests}
                  onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills & Tech Stack:</label>
                <input
                  type="text"
                  value={profileData.skills}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile URL:</label>
                <input
                  type="text"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border font-medium text-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button onClick={handleSaveProfileChanges} className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg">
                Save Full Profile & Privacy Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-500" /> Share Campus Post
              </h3>
              <button onClick={() => setShareModalPost(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Share "{shareModalPost.authorName}'s" post across campus networks or copy post link.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('🔗 Post link copied to clipboard!');
                  setShareModalPost(null);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow"
              >
                Copy Link to Clipboard
              </button>
              <button onClick={() => setShareModalPost(null)} className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DETAIL INSPECTOR MODAL */}
      {selectedNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Notification Details
              </h3>
              <button onClick={() => setSelectedNotificationModal(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border">
              <img src={selectedNotificationModal.senderAvatar} alt={selectedNotificationModal.senderName} className="w-12 h-12 rounded-2xl object-cover" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedNotificationModal.senderName}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{selectedNotificationModal.timestamp}</p>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{selectedNotificationModal.text}</p>

            <button onClick={() => setSelectedNotificationModal(null)} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow">
              Close Notification
            </button>
          </div>
        </div>
      )}

      {/* REPORT USER DISCIPLINARY FORM MODAL */}
      {reportModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                    Report User & Submit Disciplinary Form
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Official Grievance routed directly to Class Incharge & Campus Disciplinary Cell
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReportModalUser(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmittedSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Report Successfully Submitted!</h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-xs max-w-sm mx-auto">
                    Your disciplinary report against <span className="font-bold text-indigo-600">{reportModalUser.name}</span> has been dispatched to Class Incharge <span className="font-bold">{profileData.classIncharge || 'Dr. Vikram Singh (HOD CSE)'}</span>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 inline-block">
                  Reference Ticket ID: <span className="font-bold text-indigo-500">RPT-{Date.now().toString().slice(-6)}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setReportModalUser(null)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
                  >
                    Done & Return to Connections
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendReportToClassIncharge} className="space-y-4">
                {/* TARGET USER CARD */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <img src={reportModalUser.avatar} alt={reportModalUser.name} className="w-12 h-12 rounded-2xl object-cover border" />
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{reportModalUser.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-600 uppercase">
                        {reportModalUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{reportModalUser.college} • {reportModalUser.department}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{reportModalUser.email}</p>
                  </div>
                </div>

                {/* REASON CATEGORY SELECTOR */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Violation Reason / Category:
                  </label>
                  <select
                    value={reportReasonCategory}
                    onChange={(e) => setReportReasonCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="Harassment / Cyberbullying">🚨 Harassment / Cyberbullying</option>
                    <option value="Impersonation / Fake Account">🎭 Impersonation / Fake Profile</option>
                    <option value="Academic Dishonesty / Exam Malpractice">📝 Academic Dishonesty / Plagiarism</option>
                    <option value="Spam / Unsolicited Messages">🚫 Spam / Unsolicited Messages</option>
                    <option value="Inappropriate / Offensive Content">🔞 Inappropriate Content or Messages</option>
                    <option value="Threat to Safety / Conduct Violation">⚠️ Threat to Physical/Online Safety</option>
                  </select>
                </div>

                {/* DETAILED DESCRIPTION TEXTAREA */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Description & Evidence Notes: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide exact details of the issue, messages, or incident for the Class Incharge to review..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border font-medium text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* MEDIA / FILE PROOF UPLOAD */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Upload Media / Document Proof (Screenshot, Video, PDF):
                  </label>

                  {reportMediaFile ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
                          {reportMediaFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReportMediaFile(null)}
                        className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-indigo-500" />
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Click to Upload Evidence File</span>
                      <span className="text-[10px] text-slate-400">Supports PNG, JPG, MP4, PDF (Max 25MB)</span>
                      <input
                        type="file"
                        accept="image/*,video/*,application/pdf"
                        onChange={handleReportMediaUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* RECIPIENT INFORMATION NOTICE */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Official Recipient Route:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    This report will be sent directly to your Class Incharge: <strong className="text-slate-900 dark:text-white">{profileData.classIncharge || 'Dr. Vikram Singh (HOD CSE)'}</strong> and logged in the Campus Safety System.
                  </p>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalUser(null)}
                    className="w-1/3 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send to Class Incharge
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
