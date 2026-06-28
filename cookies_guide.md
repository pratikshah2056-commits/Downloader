# 🍪 Bypassing YouTube Bot Challenges (cookies.txt Configuration)

When deploying to cloud servers like Render, AWS, or Vercel, YouTube will block requests with the error:
`YouTube blocked anonymous cloud requests. Configure cookies.txt or use a VPS.`

This happens because cloud server IP ranges are heavily flagged. To fix this, you must authenticate yt-dlp using cookies from a logged-in browser session.

---

## 📥 Step 1: Export Cookies from your Browser

1. Install the extension **Get cookies.txt LOCALLY**:
   - [Chrome Web Store](https://chromewebstore.google.com/detail/get-cookiestxt-locally/ccolpediomjjoihjpdfaeoegidofihcf)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/get-cookies-txt/)
2. Open [YouTube](https://www.youtube.com) and make sure you are logged in (you can use a secondary/throwaway account for safety).
3. Click the extension icon and click **Export** (choose "Netscape" format if asked).
4. Save the file as `cookies.txt`.

---

## 🛠️ Step 2: Configure on Localhost

To make it work locally:
1. Move the exported `cookies.txt` file to the root of your `server/` directory:
   ```text
   Downloader/
   ├── server/
   │   ├── cookies.txt  <-- Place here
   │   ├── utils/
   │   └── ...
   ```
2. The server's startup diagnostics will automatically detect it:
   `🍪 Analyzing cookies configured at: .../server/cookies.txt`
   `✅ Cookies loaded successfully. (Valid: 120, Expired: 0)`

---

## 🚀 Step 3: Configure on Render (Production)

Since Render does not persist files directly from git commits easily (especially if you put `cookies.txt` in `.gitignore` to protect your Google account), you should use the environment configuration:

1. Open your **Render Dashboard** and navigate to your Web Service.
2. Go to **Environment**.
3. Add a new Environment Variable:
   - **Key**: `YT_COOKIES_CONTENT`
   - **Value**: *Open the exported `cookies.txt` in a text editor (like Notepad), copy all text, and paste it directly into this field.*
4. Click **Save Changes**.
5. Render will automatically redeploy the backend. During boot, the wrapper will write these cookies to a temporary secure path and use them to authenticate all extraction downloads!

---

## 🔒 Security Best Practices
- **Do not commit cookies.txt to public GitHub repositories!** Keep `cookies.txt` in your `.gitignore` or use the `YT_COOKIES_CONTENT` environment variable.
- Cookies expire periodically. If you see the bot warning again, simply export fresh cookies from your browser and update `YT_COOKIES_CONTENT` on Render.
