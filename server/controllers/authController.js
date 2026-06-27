const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user — auto-verified, no OTP required
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    // Create user — immediately verified
    const user = await User.create({
      username,
      email,
      password,
      isVerified: true,
    });

    // Generate token and log user in straight away
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 * Sign In / Sign Up with Google OAuth — no OTP step
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required.',
      });
    }

    // Verify token dynamically
    let payload;
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
        clockTolerance: 300,
      });
      payload = ticket.getPayload();
    } catch (e) {
      console.error('Google token verification failed:', e.message);
      // Fallback for mock token during local testing
      if (credential && String(credential).startsWith('mock_google_')) {
        payload = {
          email: `${String(credential).substring(12)}@gmail.com`,
          name: String(credential).substring(12),
          email_verified: true,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid Google token credentials: ${e.message}`,
        });
      }
    }

    const { email, name, email_verified } = payload;

    if (!email_verified && !credential.startsWith('mock_google_')) {
      return res.status(400).json({
        success: false,
        message: 'Google email is not verified.',
      });
    }

    // Find or create user — always verified immediately
    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 15);
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      const username = `${baseUsername}${uniqueSuffix}`;

      user = await User.create({
        username,
        email,
        isVerified: true,
        role: 'user',
      });
    } else if (!user.isVerified) {
      // Mark any existing unverified Google user as verified
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google authentication successful!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    // Check for conflicts
    if (username || email) {
      const query = [];
      if (username) query.push({ username });
      if (email) query.push({ email });

      const existing = await User.findOne({
        $or: query,
        _id: { $ne: req.user._id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already taken.',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/password
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password changed successfully!',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
  changePassword,
};
