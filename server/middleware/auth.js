const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // 1. If there is a real token, try to verify it
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader !== 'Bearer mock-bypass-token') {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          req.token = token;
          return next();
        }
      } catch (err) {
        console.warn('Real token verification failed, falling back to bypass:', err.message);
      }
    }

    // 2. Bypass authentication: automatically authenticate as the seeded admin user
    let user = await User.findOne({ email: 'pratikshah2056@gmail.com' });
    if (!user) {
      user = await User.findOne(); // Fallback to first user in database
    }
    if (!user) {
      // Create a dummy user if none exists in db
      user = await User.create({
        username: 'pratikadmin',
        email: 'pratikshah2056@gmail.com',
        role: 'admin',
        isVerified: true,
      });
    }
    req.user = user;
    req.token = 'mock-bypass-token';
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

module.exports = auth;
