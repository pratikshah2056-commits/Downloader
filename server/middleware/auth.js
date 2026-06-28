const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Fully bypass authentication: automatically authenticate as the default admin user
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
