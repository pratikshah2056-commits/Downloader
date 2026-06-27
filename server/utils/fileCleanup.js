const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const DOWNLOAD_DIR = path.resolve(process.env.DOWNLOAD_DIR || './downloads');
const MAX_AGE_MINUTES = parseInt(process.env.FILE_MAX_AGE_MINUTES) || 60;
const CLEANUP_INTERVAL = parseInt(process.env.FILE_CLEANUP_INTERVAL_MINUTES) || 30;

/**
 * Clean up old downloaded files
 */
const cleanupOldFiles = () => {
  try {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      return;
    }

    const files = fs.readdirSync(DOWNLOAD_DIR);
    const now = Date.now();
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(DOWNLOAD_DIR, file);

      try {
        const stats = fs.statSync(filePath);

        // Skip directories
        if (stats.isDirectory()) return;

        const ageMinutes = (now - stats.mtimeMs) / (1000 * 60);

        if (ageMinutes > MAX_AGE_MINUTES) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error checking file ${file}:`, error.message);
      }
    });

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old file(s) from downloads directory`);
    }
  } catch (error) {
    console.error('❌ File cleanup error:', error.message);
  }
};

/**
 * Start the cleanup cron job
 */
const startCleanupJob = () => {
  // Ensure downloads directory exists
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  // Run cleanup on the specified interval
  const cronExpression = `*/${CLEANUP_INTERVAL} * * * *`;
  cron.schedule(cronExpression, cleanupOldFiles);

  console.log(`🧹 File cleanup scheduled: every ${CLEANUP_INTERVAL} minutes (max age: ${MAX_AGE_MINUTES} min)`);

  // Run once on startup
  cleanupOldFiles();
};

module.exports = { cleanupOldFiles, startCleanupJob };
