const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' || req.token === 'mock-bypass-token') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Real admin authentication required.',
    });
  }
  next();
};

module.exports = admin;
