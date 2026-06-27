const User = require('../models/User');
const Download = require('../models/Download');

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

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getDownloads,
  deleteDownload,
};
