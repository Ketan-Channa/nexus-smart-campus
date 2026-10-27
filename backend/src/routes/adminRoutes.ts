import { Router } from 'express';
import {
  getAdminOverviewStats,
  getUsersList,
  createUser,
  resetUserPassword,
  updateUserStatus,
  getStudentsAdminList,
  updateStudentEnrollment,
  getFacultyAdminList,
  assignClassIncharge,
  updateFacultyDetails,
  getParentGovernance,
  updateParentRelationshipStatus,
  getPendingAlumni,
  getAlumniDirectory,
  verifyAlumniStatus,
  getDepartmentsAdminList,
  createDepartment,
  getClassesAdminList,
  createClass,
  getClassRoster,
  getSubjectsList,
  createSubject,
  assignFacultyToSubject,
  getTimetablesList,
  activateTimetableVersion,
  getAttendanceAdminSummary,
  getAttendanceSessions,
  overrideAttendanceRecord,
  getAssignmentsAdminList,
  getAssignmentSubmissions,
  getAssessmentSchemesAdmin,
  getStudentMarksAdmin,
  correctStudentMark,
  getCentralApprovalsList,
  processCentralApproval,
  getFacultyLeavesList,
  processFacultyLeave,
  getParentMeetingsAdmin,
  getParentFeedbackAdmin,
  resolveParentFeedback,
  getSafetyAdminOverview,
  updateSafetyAlertStatus,
  updateSafetyReportStatus,
  getCampusAnnouncements,
  createCampusAnnouncement,
  deleteCampusAnnouncement,
  getCampusEvents,
  createCampusEvent,
  getModerationReports,
  moderateContent,
  getAlumniMentorshipAdmin,
  updateGuestLectureStatus,
  getAlumniJobsAdmin,
  moderateAlumniJob,
  getResearchProjectsAdmin,
  getCanteenAdminOverview,
  updateCanteenItem,
  getHostelTransportAdmin,
  updateHostelTransportAllocation,
  getPaymentsAdminOverview,
  processRefund,
  getStudentDocumentsAdmin,
  verifyStudentDocument,
  getReportsAnalytics,
  runAdminAiUtility,
  getAdministratorsList,
  createAdministrator,
  updateAdminAccessLevel,
  getSystemHealth,
  getAdminAuditLogs,
  getMarksAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  getAdminProfile,
  updateAdminProfile,
} from '../controllers/adminController';

const router = Router();

// 1. Overview & Directory
router.get('/overview-stats', getAdminOverviewStats);
router.get('/users', getUsersList);
router.post('/users', createUser);
router.post('/users/reset-password', resetUserPassword);
router.put('/users/reset-password', resetUserPassword);
router.put('/users/status', updateUserStatus);

// 2. Students & Faculty
router.get('/students', getStudentsAdminList);
router.put('/students/enrollment', updateStudentEnrollment);
router.get('/faculty', getFacultyAdminList);
router.put('/faculty/assign-class-incharge', assignClassIncharge);
router.put('/faculty/assign-incharge', assignClassIncharge);
router.put('/faculty/details', updateFacultyDetails);

// 3. Parents & Alumni
router.get('/parent-governance', getParentGovernance);
router.put('/parent-relationship/status', updateParentRelationshipStatus);
router.put('/parent-governance/status', updateParentRelationshipStatus);
router.get('/alumni/pending', getPendingAlumni);
router.get('/alumni/directory', getAlumniDirectory);
router.put('/alumni/verify', verifyAlumniStatus);

// 4. Academic Structure & Subjects
router.get('/departments', getDepartmentsAdminList);
router.post('/departments', createDepartment);
router.get('/classes', getClassesAdminList);
router.post('/classes', createClass);
router.get('/classes/roster', getClassRoster);
router.get('/classes/:classCode/roster', getClassRoster);
router.get('/subjects', getSubjectsList);
router.post('/subjects', createSubject);
router.put('/subjects/assign-faculty', assignFacultyToSubject);

// 5. Timetable & Attendance
router.get('/timetables', getTimetablesList);
router.put('/timetables/activate', activateTimetableVersion);
router.get('/attendance/summary', getAttendanceAdminSummary);
router.get('/attendance/sessions', getAttendanceSessions);
router.put('/attendance/override', overrideAttendanceRecord);

// 6. Assignments & Marks / Results
router.get('/assignments', getAssignmentsAdminList);
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.get('/exams/schemes', getAssessmentSchemesAdmin);
router.get('/exams/marks', getStudentMarksAdmin);
router.put('/exams/marks/correct', correctStudentMark);

// 7. Approvals (Central Student Approvals & Faculty Leaves)
router.get('/approvals/central', getCentralApprovalsList);
router.put('/approvals/central/process', processCentralApproval);
router.get('/leaves/faculty', getFacultyLeavesList);
router.put('/leaves/faculty/process', processFacultyLeave);

// 8. Parent Connect & Feedback
router.get('/parents/meetings', getParentMeetingsAdmin);
router.get('/parents/feedback', getParentFeedbackAdmin);
router.put('/parents/feedback/resolve', resolveParentFeedback);

// 9. Safety & Voice
router.get('/safety/overview', getSafetyAdminOverview);
router.put('/safety/sos/status', updateSafetyAlertStatus);
router.put('/safety/reports/status', updateSafetyReportStatus);

// 10. Announcements & Events
router.get('/announcements', getCampusAnnouncements);
router.post('/announcements', createCampusAnnouncement);
router.delete('/announcements/:id', deleteCampusAnnouncement);
router.get('/events', getCampusEvents);
router.post('/events', createCampusEvent);

// 11. Moderation & Community
router.get('/moderation/reports', getModerationReports);
router.post('/moderation/action', moderateContent);

// 12. Alumni Connect, Jobs & Research
router.get('/alumni/mentorship', getAlumniMentorshipAdmin);
router.put('/alumni/guest-lectures/status', updateGuestLectureStatus);
router.get('/alumni/jobs', getAlumniJobsAdmin);
router.put('/alumni/jobs/moderate', moderateAlumniJob);
router.get('/research/projects', getResearchProjectsAdmin);

// 13. Campus Services: Canteen, Hostel & Transport
router.get('/canteen/overview', getCanteenAdminOverview);
router.post('/canteen/items', updateCanteenItem);
router.put('/canteen/items', updateCanteenItem);
router.get('/services/hostel-transport', getHostelTransportAdmin);
router.put('/services/hostel-transport', updateHostelTransportAllocation);

// 14. Payments, Documents, Reports & AI
router.get('/payments/overview', getPaymentsAdminOverview);
router.put('/payments/refund', processRefund);
router.get('/documents', getStudentDocumentsAdmin);
router.put('/documents/verify', verifyStudentDocument);
router.get('/reports/analytics', getReportsAnalytics);
router.post('/utilities/ai', runAdminAiUtility);

// 15. Roles, Health, Audit, Settings & Profile
router.get('/administrators', getAdministratorsList);
router.post('/administrators', createAdministrator);
router.put('/administrators/access-level', updateAdminAccessLevel);
router.get('/system/health', getSystemHealth);
router.get('/audit-logs', getAdminAuditLogs);
router.get('/audit-logs/marks', getMarksAuditLogs);
router.get('/system-settings', getSystemSettings);
router.put('/system-settings', updateSystemSettings);
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

export default router;
