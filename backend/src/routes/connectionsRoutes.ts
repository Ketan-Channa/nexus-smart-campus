import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  searchStudents,
  discoverColleges,
  sendConnectionRequest,
  getConnectionRequestsAndFriends,
  respondConnectionRequest,
  cancelConnectionRequest,
  getFeed,
  createPost,
  getCollaborations,
  createCollaboration,
  getReels,
  sendMessage,
  getMessages,
  getNotifications,
  markNotificationRead,
  submitReport,
} from '../controllers/connectionsController';

const router = Router();

// Profile CRUD
router.get('/profile/:emailOrUsername', getProfile);
router.put('/profile', updateProfile);

// Discovery & Search
router.get('/search', searchStudents);
router.get('/colleges', discoverColleges);

// Friend Connections & Requests REST API
router.get('/requests', getConnectionRequestsAndFriends);
router.post('/friends/request', sendConnectionRequest);
router.post('/friends/accept', (req, res) => {
  req.body.action = 'ACCEPT';
  req.body.senderEmail = req.body.targetEmail || req.body.senderEmail;
  respondConnectionRequest(req, res);
});
router.post('/requests/respond', respondConnectionRequest);
router.post('/requests/cancel', cancelConnectionRequest);

// Account Isolated Notifications
router.get('/notifications', getNotifications);
router.post('/notifications/mark-read', markNotificationRead);

// Social Feed & Posts
router.get('/posts', getFeed);
router.post('/posts', createPost);

// Reels
router.get('/reels', getReels);

// Collaborations
router.get('/collaborations', getCollaborations);
router.post('/collaborations', createCollaboration);

// Real-Time Chat / Messages
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/messages/send', sendMessage);

// Content & User Moderation Reports
router.post('/report', submitReport);

export default router;
