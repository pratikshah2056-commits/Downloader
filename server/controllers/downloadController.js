const path = require('path');
const fs = require('fs');
const Download = require('../models/Download');
const ytdlp = require('../utils/ytdlpWrapper');

/**
 * POST /api/download/info
 * Get media information from URL
 */
const getMediaInfo = async (req, res, next) => {
  try {
    const { url } = req.body;

    const info = await ytdlp.getMediaInfo(url);

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch media information.',
    });
  }
};

/**
 * POST /api/download/video
 * Download video file
 */
const downloadVideo = async (req, res, next) => {
  let filePath = null;

  try {
    const { url, format = 'mp4', quality = 'best' } = req.body;

    // Get media info first for metadata
    let mediaInfo;
    try {
      mediaInfo = await ytdlp.getMediaInfo(url);
    } catch {
      mediaInfo = { title: 'Unknown', thumbnail: '', duration: 0, platform: ytdlp.detectPlatform(url) };
    }

    // Download the video
    const result = await ytdlp.downloadVideo(url, format, quality);
    filePath = result.filePath;

    // Save to download history
    await Download.create({
      userId: req.user._id,
      platform: mediaInfo.platform || ytdlp.detectPlatform(url),
      url,
      title: mediaInfo.title,
      thumbnail: mediaInfo.thumbnail,
      format,
      quality,
      fileSize: result.fileSize,
      duration: mediaInfo.duration,
    });

    // Sanitize filename for Content-Disposition
    const safeTitle = (mediaInfo.title || 'download')
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .substring(0, 100)
      .trim();

    // Determine actual file extension and MIME type
    const ext = path.extname(result.fileName).replace('.', '').toLowerCase();
    const mimeType = ext === 'webm' ? 'video/webm' : 'video/mp4';

    // Stream file to client
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
    res.setHeader('Content-Length', result.fileSize);

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('end', () => {
      // Schedule file deletion after streaming
      setTimeout(() => ytdlp.deleteFile(filePath), 60000); // Delete after 1 minute
    });

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file.' });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    // Clean up file on error
    if (filePath) ytdlp.deleteFile(filePath);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download video.',
    });
  }
};

/**
 * POST /api/download/audio
 * Download audio file
 */
const downloadAudio = async (req, res, next) => {
  let filePath = null;

  try {
    const { url, format = 'mp3', quality = 'best' } = req.body;

    // Get media info first for metadata
    let mediaInfo;
    try {
      mediaInfo = await ytdlp.getMediaInfo(url);
    } catch {
      mediaInfo = { title: 'Unknown', thumbnail: '', duration: 0, platform: ytdlp.detectPlatform(url) };
    }

    // Download audio
    const result = await ytdlp.downloadAudio(url, format, quality);
    filePath = result.filePath;

    // Save to download history
    await Download.create({
      userId: req.user._id,
      platform: mediaInfo.platform || ytdlp.detectPlatform(url),
      url,
      title: mediaInfo.title,
      thumbnail: mediaInfo.thumbnail,
      format,
      quality: quality || 'audio',
      fileSize: result.fileSize,
      duration: mediaInfo.duration,
    });

    // Sanitize filename
    const safeTitle = (mediaInfo.title || 'download')
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .substring(0, 100)
      .trim();

    // Determine MIME type dynamically based on actual file extension
    const ext = path.extname(result.fileName).replace('.', '').toLowerCase();
    let mimeType;
    if (ext === 'mp3') mimeType = 'audio/mpeg';
    else if (ext === 'm4a') mimeType = 'audio/mp4';
    else if (ext === 'webm') mimeType = 'audio/webm';
    else if (ext === 'ogg') mimeType = 'audio/ogg';
    else mimeType = 'audio/octet-stream';

    // Stream file to client
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
    res.setHeader('Content-Length', result.fileSize);

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('end', () => {
      setTimeout(() => ytdlp.deleteFile(filePath), 60000);
    });

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file.' });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    if (filePath) ytdlp.deleteFile(filePath);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download audio.',
    });
  }
};

/**
 * GET /api/download/history
 * Get user's download history
 */
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const platform = req.query.platform;
    const search = req.query.search;

    // Build filter
    const filter = { userId: req.user._id };
    if (platform && platform !== 'all') {
      filter.platform = platform;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [downloads, total] = await Promise.all([
      Download.find(filter)
        .sort({ downloadDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Download.countDocuments(filter),
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
 * DELETE /api/download/history/:id
 * Delete a download history entry
 */
const deleteHistoryItem = async (req, res, next) => {
  try {
    const download = await Download.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download history entry not found.',
      });
    }

    res.json({
      success: true,
      message: 'History entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/download/stats
 * Get user's download statistics
 */
const getStats = async (req, res, next) => {
  try {
    const [totalDownloads, platformStats, recentDownloads] = await Promise.all([
      Download.countDocuments({ userId: req.user._id }),
      Download.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Download.find({ userId: req.user._id })
        .sort({ downloadDate: -1 })
        .limit(5)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalDownloads,
        platformStats: platformStats.map((p) => ({
          platform: p._id,
          count: p.count,
        })),
        recentDownloads,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMediaInfo,
  downloadVideo,
  downloadAudio,
  getHistory,
  deleteHistoryItem,
  getStats,
};
