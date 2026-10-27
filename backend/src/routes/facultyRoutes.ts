import { Router } from 'express';
import { getTimetable } from '../controllers/academicsController';
import {
  getFacultyDashboard,
  getFacultyClasses,
  getFacultyStudents,
  transferStudentClass,
  deactivateStudent,
  changeClassIncharge,
  getFacultyAssignments,
  getAssignmentStats,
  createFacultyAssignment,
  updateFacultyAssignment,
  deleteFacultyAssignment,
  getAssignmentSubmissions,
  createStudentSubmission,
  gradeSubmission,
  getFacultyLeaves,
  approveLeave,
  createAnnouncement,
  getFacultyAnnouncements,
  updateFacultyAnnouncement,
  deleteFacultyAnnouncement,
  acknowledgeAnnouncement,
  getAnnouncementAcknowledgements,
  askAnnouncementQuestion,
  respondAnnouncementQuestion,
  sendFacultyReminder,
  getMyClassOverview,
  getOtherClasses,
  createClassBroadcast,
  getBroadcastHistory,
  sendStudentAlert,
  sendStudentReminder,
  getStudentDetails,
  sendStudentMessageApi,
  addStudentRemark,
  getFacultyNotes,
  createFacultyNote,
  updateFacultyNote,
  deleteFacultyNote,
  getFacultyTasks,
  createFacultyTask,
  updateFacultyTask,
  deleteFacultyTask,
  draftAIEmail,
  generateQuestionPaper,
  aiFacultyAssistant,
  draftAIMessage,
  processAIDocument,
  generateNoticeDraft,
  generateClassReport,
  getFacultyTemplates,
  createFacultyTemplate,
  updateFacultyTemplate,
  deleteFacultyTemplate,
  getFacultyAiHistory,
  getAssessmentSchemes,
  createAssessmentScheme,
  getStudentAssessmentMarks,
  calculateAttendanceMarks,
  saveStudentAssessmentMarks,
  publishStudentAssessmentMarks,
  correctStudentAssessmentMarks,
  getStudentPublishedResults,
  getAvailableSubjects,
  saveFlexibleMarks,
  applyFacultyLeave,
  getMyFacultyLeaves,
  withdrawFacultyLeave,
  reviewFacultyLeave,
  getActiveEmergencyAlerts,
  claimEmergencyResponderSlot,
  resolveEmergencyAlert,
  getResearchProjects,
  createResearchProject,
  applyResearchProject,
  getFacultyProfile,
  updateFacultyProfile,
  getParentDirectory,
  getParentMeetings,
  createParentMeeting,
  updateParentMeetingStatus,
  getParentInvitations,
  createParentInvitation,
  getParentFeedback,
  respondParentFeedback,
  getParentAcademicContext,
  getCentralApprovalsOverview,
  getCentralApprovals,
  handleCentralApprovalDecision,
} from '../controllers/facultyController';

const router = Router();

// Faculty Dashboard & Classes REST Endpoints
router.get('/dashboard', getFacultyDashboard);
router.get('/classes', getFacultyClasses);
router.get('/classes/:classId/students', getFacultyStudents);
router.get('/students', getFacultyStudents);
router.get('/students/:studentId', getStudentDetails);
router.post('/students/:studentId/message', sendStudentMessageApi);
router.post('/students/:studentId/remarks', addStudentRemark);
router.post('/students/transfer', transferStudentClass);
router.post('/students/deactivate', deactivateStudent);
router.post('/classes/assign-incharge', changeClassIncharge);
router.post('/classes/:classId/broadcast', createClassBroadcast);

// My Students & Classes Routes
router.get('/my-students-classes/my-class', getMyClassOverview);
router.get('/my-students-classes/other-classes', getOtherClasses);
router.post('/my-students-classes/broadcast', createClassBroadcast);
router.get('/my-students-classes/broadcast-history', getBroadcastHistory);
router.post('/my-students-classes/alert', sendStudentAlert);
router.post('/my-students-classes/reminder', sendStudentReminder);

// Faculty Utilities Workspace Routes
router.get('/utilities/notes', getFacultyNotes);
router.post('/utilities/notes', createFacultyNote);
router.put('/utilities/notes/:id', updateFacultyNote);
router.delete('/utilities/notes/:id', deleteFacultyNote);

router.get('/utilities/tasks', getFacultyTasks);
router.post('/utilities/tasks', createFacultyTask);
router.put('/utilities/tasks/:id', updateFacultyTask);
router.delete('/utilities/tasks/:id', deleteFacultyTask);

router.post('/utilities/ai/draft-email', draftAIEmail);
router.post('/utilities/ai/generate-question-paper', generateQuestionPaper);
router.post('/utilities/ai/assistant', aiFacultyAssistant);
router.post('/utilities/ai/draft-message', draftAIMessage);
router.post('/utilities/ai/process-document', processAIDocument);
router.post('/utilities/ai/generate-notice', generateNoticeDraft);
router.post('/utilities/ai/generate-class-report', generateClassReport);

router.get('/utilities/templates', getFacultyTemplates);
router.post('/utilities/templates', createFacultyTemplate);
router.put('/utilities/templates/:id', updateFacultyTemplate);
router.delete('/utilities/templates/:id', deleteFacultyTemplate);

router.get('/utilities/ai-history', getFacultyAiHistory);

// Assignments & Grading CRUD
router.get('/assignments', getFacultyAssignments);
router.get('/assignments/stats', getAssignmentStats);
router.post('/assignments/create', createFacultyAssignment);
router.put('/assignments/:assignmentId', updateFacultyAssignment);
router.delete('/assignments/:assignmentId', deleteFacultyAssignment);
router.get('/submissions', getAssignmentSubmissions);
router.post('/submissions/create', createStudentSubmission);
router.put('/submissions/grade', gradeSubmission);

// Leave & Medical Approvals
router.get('/leaves', getFacultyLeaves);
router.post('/leaves/approve', approveLeave);

// Phase 8 Announcements, Alerts, Broadcasts & Communication Routes
router.get('/announcements', getFacultyAnnouncements);
router.post('/announcements/create', createAnnouncement);
router.put('/announcements/:announcementId', updateFacultyAnnouncement);
router.delete('/announcements/:announcementId', deleteFacultyAnnouncement);
router.post('/announcements/:announcementId/acknowledge', acknowledgeAnnouncement);
router.get('/announcements/:announcementId/acknowledgements', getAnnouncementAcknowledgements);
router.post('/announcements/:announcementId/questions', askAnnouncementQuestion);
router.post('/announcements/questions/:questionId/respond', respondAnnouncementQuestion);
router.post('/reminders/send', sendFacultyReminder);

// Convenience / Direct Aliases for Timetable, Utilities, and AI
router.get('/timetable', getTimetable);
router.post('/announcements', createAnnouncement);
router.post('/announcements/:announcementId/remind', sendFacultyReminder);
router.get('/notes', getFacultyNotes);
router.post('/notes', createFacultyNote);
router.put('/notes/:id', updateFacultyNote);
router.delete('/notes/:id', deleteFacultyNote);
router.get('/tasks', getFacultyTasks);
router.post('/tasks', createFacultyTask);
router.put('/tasks/:id', updateFacultyTask);
router.delete('/tasks/:id', deleteFacultyTask);
router.post('/ai-assistant', aiFacultyAssistant);
router.get('/class-report', generateClassReport);
router.post('/class-report', generateClassReport);
router.get('/my-class-overview', getMyClassOverview);
router.get('/student-details/:studentId', getStudentDetails);

// Phase C: Exams & Results Analytics Routes
router.get('/exams/schemes', getAssessmentSchemes);
router.post('/exams/schemes', createAssessmentScheme);
router.post('/exams/scheme', createAssessmentScheme);
router.get('/exams/marks', getStudentAssessmentMarks);
router.post('/exams/calculate-attendance-marks', calculateAttendanceMarks);
router.post('/exams/save-marks', saveStudentAssessmentMarks);
router.post('/exams/publish-marks', publishStudentAssessmentMarks);
router.post('/exams/publish', publishStudentAssessmentMarks);
router.post('/exams/correct-mark', correctStudentAssessmentMarks);
router.get('/exams/student-results', getStudentPublishedResults);
router.get('/exams/subjects', getAvailableSubjects);
router.post('/exams/flexible-marks', saveFlexibleMarks);

// Phase D: Faculty Leave Applications Routes
router.post('/leaves/apply', applyFacultyLeave);
router.get('/leaves/my-leaves', getMyFacultyLeaves);
router.get('/leaves/my', getMyFacultyLeaves);
router.post('/leaves/withdraw', withdrawFacultyLeave);
router.post('/leaves/review', reviewFacultyLeave);

// Phase H: Student Safety Response Centre Routes
router.get('/safety/active-alerts', getActiveEmergencyAlerts);
router.post('/safety/claim-responder-slot', claimEmergencyResponderSlot);
router.post('/safety/claim-slot', claimEmergencyResponderSlot);
router.post('/safety/resolve-alert', resolveEmergencyAlert);
router.post('/safety/resolve', resolveEmergencyAlert);

// Phase K: Research & Collaborations Routes
router.get('/research/projects', getResearchProjects);
router.post('/research/projects', createResearchProject);
router.post('/research/apply', applyResearchProject);

// Phase L1: Faculty Profile Routes
router.get('/profile', getFacultyProfile);
router.put('/profile', updateFacultyProfile);

// Module 1: Parent Connect Routes
router.get('/parent-connect/directory', getParentDirectory);
router.get('/parent-connect/meetings', getParentMeetings);
router.post('/parent-connect/meetings', createParentMeeting);
router.put('/parent-connect/meetings/:meetingId', updateParentMeetingStatus);
router.patch('/parent-connect/meetings/:meetingId', updateParentMeetingStatus);
router.patch('/parent-connect/meetings/:meetingId/status', updateParentMeetingStatus);
router.get('/parent-connect/invitations', getParentInvitations);
router.post('/parent-connect/invitations', createParentInvitation);
router.get('/parent-connect/feedback', getParentFeedback);
router.post('/parent-connect/feedback/:feedbackId/respond', respondParentFeedback);
router.get('/parent-connect/academic-context', getParentAcademicContext);

// Module 2: Student Approvals Central Workspace Routes
router.get('/approvals/overview', getCentralApprovalsOverview);
router.get('/approvals/requests', getCentralApprovals);
router.get('/approvals', getCentralApprovals);
router.post('/approvals/decision', handleCentralApprovalDecision);
router.post('/approvals/action', handleCentralApprovalDecision);

export default router;

