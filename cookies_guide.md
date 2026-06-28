# 🍪 Multi-Platform Cookie Configuration Guide

When running this media downloader on cloud servers, VPS hosts (e.g., AWS, DigitalOcean, Linode), or hosting platforms (e.g., Render, Vercel), video platforms heavily throttle or block anonymous downloads with messages like:
`Sign in to confirm you are not a bot` or `This video is unavailable`.

To bypass these blocks, you must configure authentication cookies. This guides you through exporting, combining, and deploying cookies for all platforms (YouTube, Facebook, Instagram, TikTok, etc.).

---

## 📥 Step 1: Export Cookies from your Browser

To extract cookies, you need a browser extension that exports cookies in the standard **Netscape HTTP Cookie format** used by `yt-dlp`.

1. Install **Get cookies.txt LOCALLY** in your browser:
   - [Chrome/Brave/Edge Web Store](https://chromewebstore.google.com/detail/get-cookiestxt-locally/ccolpediomjjoihjpdfaeoegidofihcf)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/get-cookies-txt/)
2. Open each target platform, make sure you are logged in (you can use a throwaway or secondary account for privacy and safety), and export the cookies:
   - **YouTube**: Open [youtube.com](https://www.youtube.com), click the extension icon, and select **Export**.
   - **Facebook**: Open [facebook.com](https://www.facebook.com), click the extension icon, and select **Export**.
   - **Instagram**: Open [instagram.com](https://www.instagram.com), click the extension icon, and select **Export**.
   - **TikTok**: Open [tiktok.com](https://www.tiktok.com), click the extension icon, and select **Export**.

---

## 🔀 Step 2: Combine Cookies into a Single File

`yt-dlp` expects a single cookies file. You can easily combine the exported files from different platforms:

1. Create a blank text file named `cookies.txt`.
2. Open each platform's exported cookies file (e.g., `youtube.com_cookies.txt`, `tiktok.com_cookies.txt`) in a text editor (like Notepad, TextEdit, or VS Code).
3. Copy all the lines and paste them directly into your new `cookies.txt` file.
4. Save the file. The order of cookies does not matter. The downloader will automatically match the correct cookies to the platform URL.

---

## 🛠️ Step 3: Deployment & Configuration

There are three ways to apply your `cookies.txt` configuration:

### Method A: Admin Portal Dashboard (Recommended)
This is the easiest way to update cookies without restarting your VPS or updating environment variables:
1. Log in to the web application as an **Administrator**.
2. Go to the **Admin Portal** from the navigation bar.
3. Click the **Cookie Manager** tab.
4. Paste the combined text content of your `cookies.txt` file into the editor.
5. Click **Save Cookie Configuration**. The backend will validate and write the file dynamically.

### Method B: Environment Variable (Production/Serverless)
If you deploy to ephemeral cloud providers like **Render** or **Vercel** where files on disk are wiped out on rebuilds:
1. Open your host's dashboard (e.g., Render Dashboard).
2. Go to **Environment Settings**.
3. Add a new variable:
   - **Key**: `COOKIES_CONTENT` (or the legacy `YT_COOKIES_CONTENT`)
   - **Value**: *Paste the entire content of your combined cookies file.*
4. Save and redeploy. The server will dynamically write this content to a temporary location on boot.

### Method C: Local Storage File (VPS / Docker / Localhost)
For native VPS hosting or local developer environments:
1. Place your `cookies.txt` in the root of the backend directory (`server/cookies.txt`):
   ```text
   downloader/
   ├── server/
   │   ├── cookies.txt  <-- Place here
   │   └── index.js
   ```
2. The server's startup diagnostics will automatically detect it:
   `🍪 Analyzing cookies configured at: .../server/cookies.txt`
   `✅ Cookies loaded successfully. (Valid: 140, Expired: 0)`
   `   Detected cookie domains: youtube.com, facebook.com, tiktok.com`

---

## 🔒 Security Best Practices

> [!WARNING]
> **Never commit your cookies.txt file to GitHub!**
> Active cookies contain session tokens that allow access to your accounts. Make sure `cookies.txt` is listed in your `.gitignore` file.

- **Use a Secondary Account**: Always log in using a throwaway/secondary account before exporting cookies to isolate your primary personal account.
- **Update Expired Cookies**: Session cookies expire over time. If downloads start failing again, simply log back into the platforms, export a fresh cookie batch, and update them through the **Admin Portal**.
