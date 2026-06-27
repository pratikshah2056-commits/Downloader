const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['youtube', 'facebook', 'instagram', 'tiktok', 'twitter', 'vimeo', 'reddit', 'soundcloud', 'twitch', 'pinterest', 'linkedin', 'other'],
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      required: true,
      enum: ['mp4', 'webm', 'mp3', 'm4a'],
    },
    quality: {
      type: String,
      default: 'best',
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    downloadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient history queries
downloadSchema.index({ userId: 1, downloadDate: -1 });

module.exports = mongoose.model('Download', downloadSchema);
