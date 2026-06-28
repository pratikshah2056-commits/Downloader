const express = require('express');
const router = express.Router();
const {
  getMediaInfo,
  downloadVideo,
  downloadAudio,
  getHistory,
  deleteHistoryItem,
  getStats,
} = require('../controllers/downloadController');
const auth = require('../middleware/auth');
const { downloadLimiter } = require('../middleware/rateLimiter');
const { urlRules, downloadRules, audioRules, historyIdRules, validate } = require('../middleware/validator');

// All download routes require authentication
router.use(auth);

// Media info
router.post('/info', urlRules, validate, getMediaInfo);

// Download routes (with stricter rate limiting)
router.post('/video', downloadLimiter, downloadRules, validate, downloadVideo);
router.post('/audio', downloadLimiter, audioRules, validate, downloadAudio);

// History routes
router.get('/history', getHistory);
router.delete('/history/:id', historyIdRules, validate, deleteHistoryItem);

// Stats
router.get('/stats', getStats);

module.exports = router;
