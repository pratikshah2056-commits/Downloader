const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Dynamic yt-dlp binary resolver
const checkGlobalYtdlp = () => {
  try {
    const { execSync } = require('child_process');
    execSync('yt-dlp --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const BIN_DIR = path.resolve(__dirname, '../bin');
const BIN_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const COOKIES_PATH = path.resolve(__dirname, '../cookies.txt');
const TEMP_COOKIES_PATH = path.resolve(__dirname, '../bin/cookies.txt');
let binaryPathPromise = null;

const getCookieArg = () => {
  if (fs.existsSync(COOKIES_PATH)) {
    return ['--cookies', COOKIES_PATH];
  }
  if (process.env.YT_COOKIES_CONTENT) {
    if (!fs.existsSync(TEMP_COOKIES_PATH)) {
      if (!fs.existsSync(BIN_DIR)) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
      }
      fs.writeFileSync(TEMP_COOKIES_PATH, process.env.YT_COOKIES_CONTENT, 'utf8');
    }
    return ['--cookies', TEMP_COOKIES_PATH];
  }
  return [];
};

const getBinaryPath = () => {
  if (binaryPathPromise) return binaryPathPromise;

  binaryPathPromise = (async () => {
    if (checkGlobalYtdlp()) {
      return 'yt-dlp';
    }

    if (fs.existsSync(BIN_PATH)) {
      return BIN_PATH;
    }

    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    console.log(`yt-dlp is not globally installed. Downloading binary to ${BIN_PATH}...`);
    const YTDlpWrap = require('yt-dlp-wrap').default;
    await YTDlpWrap.downloadFromGithub(BIN_PATH);

    if (os.platform() !== 'win32') {
      try {
        fs.chmodSync(BIN_PATH, 0o755);
      } catch (err) {
        console.warn('Failed to chmod local yt-dlp binary:', err.message);
      }
    }

    console.log('yt-dlp binary downloaded successfully.');
    return BIN_PATH;
  })();

  return binaryPathPromise;
};


// Ensure downloads directory exists
const DOWNLOAD_DIR = path.resolve(process.env.DOWNLOAD_DIR || './downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// FFmpeg presence cache
let ffmpegAvailable = null;
const checkFfmpeg = () => {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    const { execSync } = require('child_process');
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegAvailable = true;
  } catch {
    console.warn('⚠️ FFmpeg/FFprobe not found. Video downloads will fallback to pre-merged streams and audio will fallback to raw streams.');
    ffmpegAvailable = false;
  }
  return ffmpegAvailable;
};

/**
 * Detect platform from URL
 */
const detectPlatform = (url) => {
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  }
  if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
    return 'facebook';
  }
  if (hostname.includes('instagram.com')) {
    return 'instagram';
  }
  if (hostname.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  }
  if (hostname.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (hostname.includes('reddit.com')) {
    return 'reddit';
  }
  if (hostname.includes('soundcloud.com')) {
    return 'soundcloud';
  }
  if (hostname.includes('twitch.tv')) {
    return 'twitch';
  }
  if (hostname.includes('pinterest.com')) {
    return 'pinterest';
  }
  if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  }

  return 'other';
};

/**
 * Get extractor arguments based on platform (e.g. bypass YouTube bot challenges)
 */
const getExtractorArgs = (url) => {
  try {
    const platform = detectPlatform(url);
    if (platform === 'youtube') {
      return ['--extractor-args', 'youtube:player_client=android,web'];
    }
  } catch (err) {
    // Ignore parsing errors
  }
  return [];
};

/**
 * Sanitize URL to prevent command injection
 */
const sanitizeUrl = (url) => {
  // Remove any shell metacharacters
  const sanitized = url.replace(/[;&|`$(){}[\]!#~]/g, '');
  // Validate it's still a valid URL
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    throw new Error('Invalid URL after sanitization');
  }
};

/**
 * Get media information from URL
 */
const getMediaInfo = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUrl = sanitizeUrl(url);
      const binaryPath = await getBinaryPath();

      const args = [
        '--dump-json',
        '--no-download',
        '--no-warnings',
        '--no-playlist',
        ...getCookieArg(),
        ...getExtractorArgs(url),
        sanitizedUrl,
      ];

      execFile(binaryPath, args, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', stderr || error.message);
          return reject(new Error('Failed to fetch media information. Please check the URL.'));
        }

        try {
          const info = JSON.parse(stdout);

          // Extract available formats
          const formats = (info.formats || [])
            .filter((f) => f.vcodec !== 'none' || f.acodec !== 'none')
            .map((f) => ({
              formatId: f.format_id,
              ext: f.ext,
              quality: f.height ? `${f.height}p` : (f.format_note || 'audio'),
              height: f.height || 0,
              filesize: f.filesize || f.filesize_approx || 0,
              hasVideo: f.vcodec !== 'none',
              hasAudio: f.acodec !== 'none',
              vcodec: f.vcodec,
              acodec: f.acodec,
            }));

          // Get unique video qualities
          const videoQualities = [...new Set(
            formats
              .filter((f) => f.hasVideo && f.height > 0)
              .map((f) => f.height)
          )]
            .sort((a, b) => a - b)
            .map((h) => `${h}p`);

          const result = {
            title: info.title || 'Untitled',
            thumbnail: info.thumbnail || '',
            duration: info.duration || 0,
            platform: detectPlatform(url),
            uploader: info.uploader || info.channel || 'Unknown',
            viewCount: info.view_count || 0,
            uploadDate: info.upload_date || '',
            description: (info.description || '').substring(0, 500),
            videoQualities,
            formats,
            availableVideoFormats: ['mp4', 'webm'],
            availableAudioFormats: ['mp3', 'm4a'],
          };

          resolve(result);
        } catch (parseError) {
          reject(new Error('Failed to parse media information.'));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Download video with specified format and quality
 */
const downloadVideo = (url, format = 'mp4', quality = 'best') => {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUrl = sanitizeUrl(url);
      const binaryPath = await getBinaryPath();
      const fileId = uuidv4();
      const outputPath = path.join(DOWNLOAD_DIR, `${fileId}.${format}`);

      // Build quality filter
      let formatFilter;
      if (!checkFfmpeg()) {
        if (quality === 'best') {
          formatFilter = `best[ext=${format}]/best`;
        } else {
          const height = quality.replace('p', '');
          formatFilter = `best[height<=${height}][ext=${format}]/best[height<=${height}]/best`;
        }
      } else if (quality === 'best') {
        formatFilter = `bestvideo[ext=${format}]+bestaudio/best[ext=${format}]/bestvideo+bestaudio/best`;
      } else {
        const height = quality.replace('p', '');
        formatFilter = `bestvideo[height<=${height}][ext=${format}]+bestaudio/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
      }

      const outputTemplate = checkFfmpeg() 
        ? outputPath 
        : path.join(DOWNLOAD_DIR, `${fileId}.%(ext)s`);

      const args = [
        '-f', formatFilter,
        '--no-playlist',
        '--no-warnings',
        ...getCookieArg(),
        ...getExtractorArgs(url),
        '-o', outputTemplate,
        sanitizedUrl,
      ];

      if (checkFfmpeg()) {
        args.unshift('--merge-output-format', format);
      }

      const process = spawn(binaryPath, args, { timeout: 300000 });

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('yt-dlp download error:', stderr);
          return reject(new Error('Failed to download video.'));
        }

        // Check if file exists
        if (!fs.existsSync(outputPath)) {
          // yt-dlp might have added a different extension
          const possibleFiles = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(fileId));
          if (possibleFiles.length > 0) {
            const actualPath = path.join(DOWNLOAD_DIR, possibleFiles[0]);
            const stats = fs.statSync(actualPath);
            return resolve({
              filePath: actualPath,
              fileName: possibleFiles[0],
              fileSize: stats.size,
            });
          }
          return reject(new Error('Download completed but file not found.'));
        }

        const stats = fs.statSync(outputPath);
        resolve({
          filePath: outputPath,
          fileName: `${fileId}.${format}`,
          fileSize: stats.size,
        });
      });

      process.on('error', (error) => {
        reject(new Error(`Download process error: ${error.message}`));
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Download audio only
 */
const downloadAudio = (url, format = 'mp3', quality = 'best') => {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUrl = sanitizeUrl(url);
      const binaryPath = await getBinaryPath();
      const fileId = uuidv4();
      const outputPath = path.join(DOWNLOAD_DIR, `${fileId}.${format}`);

      // Map audio quality parameter
      let qArg = '0'; // best default
      if (quality === '320' || quality === '320k') qArg = '320K';
      else if (quality === '240' || quality === '240k') qArg = '240K';
      else if (quality === '192' || quality === '192k') qArg = '192K';
      else if (quality === '128' || quality === '128k') qArg = '128K';

      let args;
      if (!checkFfmpeg()) {
        // Without FFmpeg: just download best audio stream as-is
        args = [
          '-f', 'bestaudio/best',
          '--no-playlist',
          '--no-warnings',
          ...getCookieArg(),
          ...getExtractorArgs(url),
          '-o', path.join(DOWNLOAD_DIR, `${fileId}.%(ext)s`),
          sanitizedUrl,
        ];
      } else {
        args = [
          '-x',
          '--audio-format', format,
          '--audio-quality', qArg,
          '--no-playlist',
          '--no-warnings',
          ...getCookieArg(),
          ...getExtractorArgs(url),
          '-o', path.join(DOWNLOAD_DIR, `${fileId}.%(ext)s`),
          sanitizedUrl,
        ];
      }

      const process = spawn(binaryPath, args, { timeout: 300000 });

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('yt-dlp audio error:', stderr);
          return reject(new Error('Failed to download audio.'));
        }

        // yt-dlp extracts audio and may change extension
        const possibleFiles = fs.readdirSync(DOWNLOAD_DIR).filter((f) => f.startsWith(fileId));
        if (possibleFiles.length > 0) {
          const actualPath = path.join(DOWNLOAD_DIR, possibleFiles[0]);
          const stats = fs.statSync(actualPath);
          return resolve({
            filePath: actualPath,
            fileName: possibleFiles[0],
            fileSize: stats.size,
          });
        }

        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          return resolve({
            filePath: outputPath,
            fileName: `${fileId}.${format}`,
            fileSize: stats.size,
          });
        }

        reject(new Error('Audio extraction completed but file not found.'));
      });

      process.on('error', (error) => {
        reject(new Error(`Audio process error: ${error.message}`));
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Delete a downloaded file
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error.message);
  }
};

module.exports = {
  detectPlatform,
  getMediaInfo,
  downloadVideo,
  downloadAudio,
  deleteFile,
  DOWNLOAD_DIR,
};
