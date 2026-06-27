const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail SMTP transport
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ Email configuration missing (EMAIL_USER / EMAIL_PASS). OTP emails will only be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

/**
 * Send OTP verification email to user
 */
const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MediaDL" <${process.env.EMAIL_USER || 'noreply@mediadl.com'}>`,
    to: toEmail,
    subject: 'Verification Code - MediaDL',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">MediaDL Email Verification</h2>
        <p>Thank you for registering on MediaDL. Please use the following One-Time Password (OTP) to verify your account:</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} MediaDL. All rights reserved.</p>
      </div>
    `,
  };

  if (!transporter) {
    console.log(`\n📧 [EMAIL SIMULATION] Sending OTP to ${toEmail}: Code matches [${otp}]\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    // Fall back to simulator so registration doesn't break in dev if user has wrong config
    console.log(`📧 [EMAIL SIMULATION FALLBACK] Verification code for ${toEmail}: [${otp}]`);
    return false;
  }
};

module.exports = { sendOTPEmail };
