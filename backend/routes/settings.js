import express from 'express';
import { getSettings, updateSettings, forgotPassword, verifyOtp, resetPassword, updateEmailSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/email-setup', updateEmailSettings);

export default router;
