const nodemailer = require('nodemailer');

// Create reusable transporter with explicit Gmail SMTP settings
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ Email configuration missing (EMAIL_USER / EMAIL_PASS). OTP emails will only be logged to console.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

// Verify transporter on startup
const verifyTransporter = async () => {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    await transporter.verify();
    console.log(`✅ Email transporter ready: ${process.env.EMAIL_USER}`);
  } catch (err) {
    console.error(`❌ Email transporter verification failed: ${err.message}`);
    console.error('   → Check EMAIL_USER and EMAIL_PASS in .env (use Gmail App Password)');
  }
};

// Run verify on module load
verifyTransporter();

/**
 * Send OTP email (works for both verification and password reset)
 */
const sendOTPEmail = async (toEmail, otp, subject = 'Your OTP Code - MediaDL') => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MediaDL" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">⬇ MediaDL</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your verification code</p>
        </div>
        <div style="padding: 32px; background: #1e293b;">
          <p style="color: #94a3b8; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
            Use the code below to verify your request. This code is valid for <strong style="color: #e2e8f0;">10 minutes</strong>.
          </p>
          <div style="background: #0f172a; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <span style="font-family: 'Courier New', monospace; font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #a5b4fc;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">
            If you did not request this code, please ignore this email. Do not share this code with anyone.
          </p>
        </div>
        <div style="padding: 16px 32px; background: #0f172a; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #334155; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} MediaDL. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  if (!transporter) {
    console.log(`\n📧 [EMAIL SIMULATION] OTP for ${toEmail}: [${otp}]\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${toEmail} | Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${toEmail}: ${error.message}`);
    console.log(`📧 [FALLBACK] OTP for ${toEmail}: [${otp}]`);
    return false;
  }
};

module.exports = { sendOTPEmail };

