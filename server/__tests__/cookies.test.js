const { parseCookiesContent } = require('../utils/diagnostics');

describe('Cookie Parsing and Diagnostics', () => {
  it('should successfully parse valid Netscape format cookies', () => {
    const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
    const validCookieContent = `# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	${futureExpiry}	SID	mockvalue1
.facebook.com	TRUE	/	TRUE	${futureExpiry}	c_user	mockvalue2
`;
    const result = parseCookiesContent(validCookieContent);
    expect(result.valid).toBe(true);
    expect(result.validCount).toBe(2);
    expect(result.expiredCount).toBe(0);
    expect(result.domains).toHaveLength(2);
    
    const youtubeDiag = result.domains.find(d => d.domain === 'youtube.com');
    expect(youtubeDiag).toBeDefined();
    expect(youtubeDiag.validCount).toBe(1);
    expect(youtubeDiag.expiredCount).toBe(0);
  });

  it('should detect expired cookies', () => {
    const pastExpiry = Math.floor(Date.now() / 1000) - 3600;
    const expiredCookieContent = `# Netscape HTTP Cookie File
.tiktok.com	TRUE	/	TRUE	${pastExpiry}	tt_webid	mockvalue3
`;
    const result = parseCookiesContent(expiredCookieContent);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
    expect(result.validCount).toBe(0);
    expect(result.expiredCount).toBe(1);
    expect(result.domains[0].domain).toBe('tiktok.com');
    expect(result.domains[0].expiredCount).toBe(1);
  });

  it('should return error for invalid Netscape format', () => {
    const invalidContent = `This is not a netscape cookie file.
It does not have tab-separated values.
`;
    const result = parseCookiesContent(invalidContent);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid_format');
  });

  it('should return error for empty content', () => {
    const result = parseCookiesContent('   ');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('empty');
  });

  describe('getCookiePath environment variable resolving', () => {
    const originalEnv = process.env;
    let existsSpy;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
      delete process.env.COOKIES_PATH;
      delete process.env.YOUTUBE_COOKIES_PATH;
      delete process.env.COOKIE_FILE;
      delete process.env.COOKIES_CONTENT;
      delete process.env.YT_COOKIES_CONTENT;
      delete process.env.COOKIES;
      delete process.env.COOKIES_TXT;
      delete process.env.YOUTUBE_COOKIES;

      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
        if (p && typeof p === 'string' && p.endsWith('cookies.txt') && !p.includes('bin')) {
          return false;
        }
        return originalExistsSync.call(fs, p);
      });
    });

    afterEach(() => {
      if (existsSpy) {
        existsSpy.mockRestore();
      }
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return null when no environment variables or local files are configured', () => {
      const { getCookiePath } = require('../utils/ytdlpWrapper');
      expect(getCookiePath()).toBeNull();
    });

    it('should ignore cookies content env vars that do not start with Netscape header', () => {
      process.env.COOKIES_CONTENT = 'cookies.txt';
      const { getCookiePath } = require('../utils/ytdlpWrapper');
      expect(getCookiePath()).toBeNull();
    });

    it('should recognize valid Netscape cookies content env variables', () => {
      process.env.COOKIES_CONTENT = '# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t2147483647\tSID\tvalue';
      const { getCookiePath } = require('../utils/ytdlpWrapper');
      const resolvedPath = getCookiePath();
      expect(resolvedPath).not.toBeNull();
      expect(resolvedPath).toContain('cookies.txt');
    });
  });
});
