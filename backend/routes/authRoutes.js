import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, sendOtp, verifyOtpAndReset } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp-reset', verifyOtpAndReset);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
