const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, resetPassword, googleAuth } = require('../controllers/authControllers');

const protect = require('../middleware/authMiddleware');
const { registerRules, loginRules, validate } = require('../middleware/validators');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
router.post('/google', googleAuth);
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
