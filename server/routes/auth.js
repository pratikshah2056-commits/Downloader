const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../middleware/validator');

// Public routes
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/google', authLimiter, googleAuth);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
