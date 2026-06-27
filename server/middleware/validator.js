const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Registration validation rules
const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

// Login validation rules
const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// URL validation rules for download
const urlRules = [
  body('url')
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL')
    .custom((value) => {
      const supportedDomains = [
        'youtube.com',
        'youtu.be',
        'facebook.com',
        'fb.watch',
        'instagram.com',
        'tiktok.com',
        'twitter.com',
        'x.com',
        'vimeo.com',
        'reddit.com',
        'soundcloud.com',
        'twitch.tv',
        'pinterest.com',
        'pin.it',
        'linkedin.com',
      ];

      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();

      if (!supportedDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain))) {
        throw new Error(
          'Unsupported platform. We support YouTube, Facebook, Instagram, TikTok, Twitter/X, Vimeo, Reddit, SoundCloud, Twitch, Pinterest, and LinkedIn.'
        );
      }

      return true;
    }),
];

// Download request validation
const downloadRules = [
  ...urlRules,
  body('format')
    .optional()
    .isIn(['mp4', 'webm', 'mp3', 'm4a'])
    .withMessage('Format must be mp4, webm, mp3, or m4a'),
  body('quality')
    .optional()
    .custom((value) => {
      const allowed = ['144', '144p', '240', '240p', '360', '360p', '480', '480p', '720', '720p', '1080', '1080p', '1440', '1440p', '2160', '2160p', '4320', '4320p', 'best'];
      if (!allowed.includes(value.toString().toLowerCase())) {
        throw new Error('Invalid quality option');
      }
      return true;
    }),
];

// Audio download validation
const audioRules = [
  ...urlRules,
  body('format')
    .optional()
    .isIn(['mp3', 'm4a', 'webm', 'ogg'])
    .withMessage('Format must be mp3, m4a, webm, or ogg'),
  body('quality')
    .optional()
    .isIn(['320', '320k', '240', '240k', '192', '192k', '128', '128k', 'best'])
    .withMessage('Invalid audio quality option'),
];

// History ID validation
const historyIdRules = [
  param('id').isMongoId().withMessage('Invalid history entry ID'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  urlRules,
  downloadRules,
  audioRules,
  historyIdRules,
};
