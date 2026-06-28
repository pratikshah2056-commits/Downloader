const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Validate Netscape cookies format and check for expired tokens
 * @param {string} filePath 
 */
const parseCookiesContent = (content) => {
  if (!content || !content.trim()) {
    return { valid: false, reason: 'empty' };
  }

  const lines = content.split('\n');
  let hasCookies = false;
  let expiredCount = 0;
  let validCount = 0;
  const now = Math.floor(Date.now() / 1000);
  const domains = {};

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length >= 7) {
      hasCookies = true;
      const rawDomain = parts[0].trim();
      const expiry = parseInt(parts[4]);
      const isExpired = isNaN(expiry) || expiry < now;
      
      if (isExpired) {
        expiredCount++;
      } else {
        validCount++;
      }

      // Determine matching domain/platform
      let domainKey = rawDomain;
      if (rawDomain.includes('youtube.com') || rawDomain.includes('googlevideo.com') || rawDomain.includes('youtube-nocookie.com')) {
        domainKey = 'youtube.com';
      } else if (rawDomain.includes('facebook.com') || rawDomain.includes('fbcdn.net')) {
        domainKey = 'facebook.com';
      } else if (rawDomain.includes('instagram.com')) {
        domainKey = 'instagram.com';
      } else if (rawDomain.includes('tiktok.com')) {
        domainKey = 'tiktok.com';
      } else if (rawDomain.includes('twitter.com') || rawDomain.includes('x.com')) {
        domainKey = 'x.com';
      } else {
        domainKey = rawDomain.replace(/^\./, '');
      }

      if (!domains[domainKey]) {
        domains[domainKey] = { validCount: 0, expiredCount: 0 };
      }
      if (isExpired) {
        domains[domainKey].expiredCount++;
      } else {
        domains[domainKey].validCount++;
      }
    }
  }

  if (!hasCookies) {
    return { valid: false, reason: 'invalid_format' };
  }

  const domainList = Object.keys(domains).map(domain => ({
    domain,
    validCount: domains[domain].validCount,
    expiredCount: domains[domain].expiredCount
  }));

  if (validCount === 0) {
    return { valid: false, reason: 'expired', validCount, expiredCount, domains: domainList };
  }

  return { valid: true, validCount, expiredCount, domains: domainList };
};

const validateCookies = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, reason: 'missing' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return parseCookiesContent(content);
  } catch (err) {
    return { valid: false, reason: 'error', error: err.message };
  }
};

/**
 * Perform startup diagnostic check on external binaries and authentication states
 */
const runStartupDiagnostics = async () => {
  console.log('🔍 Starting System Diagnostics...');

  // 1. Validate FFmpeg
  const ffmpegCmd = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    const ffmpegVersion = execSync(`${ffmpegCmd} -version`, { encoding: 'utf8' })
      .split('\n')[0]
      .trim();
    console.log(`✅ FFmpeg detected: ${ffmpegVersion}`);
  } catch (err) {
    console.warn(`⚠️ FFmpeg diagnostic failed using '${ffmpegCmd}'. Audio/Video merging will be disabled. Error: ${err.message}`);
  }

  // 2. Validate yt-dlp
  const ytdlpCmd = process.env.YTDLP_PATH || 'yt-dlp';
  try {
    const ytdlpVersion = execSync(`${ytdlpCmd} --version`, { encoding: 'utf8' }).trim();
    console.log(`✅ yt-dlp version verified: ${ytdlpVersion}`);
  } catch (err) {
    console.warn(`⚠️ Global yt-dlp check failed using '${ytdlpCmd}': ${err.message}. Wrapper will attempt local fallback binary download.`);
  }

  // 3. Validate Cookies config
  let cookiesPath = process.env.COOKIES_PATH || process.env.YOUTUBE_COOKIES_PATH;
  if (!cookiesPath) {
    // Check fallback path in root
    const fallbackPath = path.resolve(__dirname, '../../cookies.txt');
    if (fs.existsSync(fallbackPath)) {
      cookiesPath = fallbackPath;
    }
  }

  if (cookiesPath) {
    console.log(`🍪 Analyzing cookies configured at: ${cookiesPath}`);
    const check = validateCookies(cookiesPath);
    if (check.valid) {
      const domainsList = check.domains.map(d => d.domain).join(', ');
      console.log(`✅ Cookies loaded successfully. (Valid: ${check.validCount}, Expired: ${check.expiredCount})`);
      console.log(`   Detected cookie domains: ${domainsList}`);
    } else {
      if (check.reason === 'missing') {
        console.warn(`⚠️ Cookies file configured but not found: ${cookiesPath}`);
      } else if (check.reason === 'expired') {
        console.warn('❌ Cookies verification failed: All cookies inside the file are expired!');
      } else {
        console.warn(`❌ Cookies verification failed: File format invalid or corrupted (${check.reason}).`);
      }
    }
  } else {
    console.log('💡 No cookies.txt path configured. yt-dlp will perform anonymous requests for all platforms.');
  }

  console.log('🚀 System Diagnostics Completed.\n');
};

module.exports = {
  validateCookies,
  parseCookiesContent,
  runStartupDiagnostics,
};
