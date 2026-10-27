import { Router } from 'express';
import { registerUser, loginUser, updateUserProfile, getRegisteredStats, getStudentProfile } from '../controllers/authController';

const router = Router();

// POST /api/auth/register - Register user for any role in MySQL
router.post('/register', registerUser);

// POST /api/auth/login - Login user per role
router.post('/login', loginUser);

// PUT /api/auth/update-profile - Update profile details in MySQL
router.put('/update-profile', updateUserProfile);

// GET /api/auth/student-profile - Get complete student profile details
router.get('/student-profile', getStudentProfile);

// GET /api/auth/stats - Get count of registered users in MySQL
router.get('/stats', getRegisteredStats);

export default router;
