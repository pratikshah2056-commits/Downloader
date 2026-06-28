const User = require('../models/User');
const Download = require('../models/Download');
const fs = require('fs');
const path = require('path');
const { validateCookies, parseCookiesContent } = require('../utils/diagnostics');

/**
 * GET /api/admin/stats
 * Retrieve administrative metrics
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDownloads, platformDistribution] = await Promise.all([
      User.countDocuments(),
      Download.countDocuments(),
      Download.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDownloads,
        platformDistribution: platformDistribution.map((p) => ({
          platform: p._id,
          count: p.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Get paginated list of users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-otp -otpExpiry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all their download records
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account.',
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Delete user download records
    await Download.deleteMany({ userId });

    res.json({
      success: true,
      message: 'User and all associated download history deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/downloads
 * Get paginated download log history across all users
 */
const getDownloads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      Download.find()
        .populate('userId', 'username email')
        .sort({ downloadDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Download.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        downloads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/downloads/:id
 * Remove a specific download record
 */
const deleteDownload = async (req, res, next) => {
  try {
    const download = await Download.findByIdAndDelete(req.params.id);

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download record not found.',
      });
    }

    res.json({
      success: true,
      message: 'Download history record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getActiveCookiesPath = () => {
  const configCookiesPath = process.env.COOKIES_PATH || process.env.YOUTUBE_COOKIES_PATH;
  if (configCookiesPath) {
    return configCookiesPath;
  }
  return path.resolve(__dirname, '../cookies.txt');
};

/**
 * GET /api/admin/cookies
 * Retrieve active cookie settings and diagnostics
 */
const getCookies = async (req, res, next) => {
  try {
    const cookiesPath = getActiveCookiesPath();
    let exists = false;
    let content = '';
    let diagnostics = null;

    if (fs.existsSync(cookiesPath)) {
      exists = true;
      content = fs.readFileSync(cookiesPath, 'utf8');
      diagnostics = validateCookies(cookiesPath);
    } else {
      const envContent = process.env.COOKIES_CONTENT || process.env.YT_COOKIES_CONTENT;
      if (envContent) {
        exists = true;
        content = envContent;
        diagnostics = parseCookiesContent(envContent);
      }
    }

    res.json({
      success: true,
      data: {
        exists,
        path: cookiesPath,
        content,
        diagnostics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/cookies
 * Save new cookie settings
 */
const updateCookies = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cookies content is required.',
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent === '') {
      const cookiesPath = getActiveCookiesPath();
      if (fs.existsSync(cookiesPath)) {
        fs.unlinkSync(cookiesPath);
      }
      return res.json({
        success: true,
        message: 'Cookies cleared successfully.',
        data: {
          exists: false,
          content: '',
          diagnostics: null,
        },
      });
    }

    const validation = parseCookiesContent(trimmedContent);
    if (!validation.valid && validation.reason !== 'expired') {
      return res.status(400).json({
        success: false,
        message: `Invalid cookies format: ${validation.reason || 'unknown parsing error'}`,
      });
    }

    const cookiesPath = getActiveCookiesPath();
    const parentDir = path.dirname(cookiesPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(cookiesPath, trimmedContent, 'utf8');

    res.json({
      success: true,
      message: 'Cookies updated successfully.',
      data: {
        exists: true,
        path: cookiesPath,
        content: trimmedContent,
        diagnostics: validation,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getDownloads,
  deleteDownload,
  getCookies,
  updateCookies,
};
