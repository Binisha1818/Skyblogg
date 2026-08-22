const rateLimit = require('express-rate-limit');

// Applies to login only — prevents brute-force password guessing
const loginLimiter = rateLimit({
  windowMs: 50 * 1000, // 50 seconds
  max: 5,              // 5 attempts per IP per window
  message: {
    message: 'Too many login attempts. Please try again after 50 seconds.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Applies to register — prevents spam account creation
const registerLimiter = rateLimit({
  windowMs: 50 * 1000, // 50 seconds
  max: 10,             // 10 attempts per IP per window
  message: {
    message: 'Too many accounts created from this IP. Please try again after 50 seconds.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter, registerLimiter };