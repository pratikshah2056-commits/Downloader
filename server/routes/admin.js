const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getStats, getUsers, deleteUser, getDownloads, deleteDownload } = require('../controllers/adminController');

// All routes here require authentication and administrative access
router.use(auth, admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/downloads', getDownloads);
router.delete('/downloads/:id', deleteDownload);

module.exports = router;
