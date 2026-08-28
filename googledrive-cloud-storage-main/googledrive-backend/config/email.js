const nodemailer = require('nodemailer');

// Send email via Brevo HTTP API (works on Render free tier)
const sendEmailViaBrevo = async (to, subject, html) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'CloudVault', email: process.env.EMAIL_USER || 'cloudvault59@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Brevo error:', data);
    throw new Error(data.message || 'Failed to send email');
  }
  
  console.log('Email sent via Brevo to:', to);
  return data;
};

// Send email - uses Brevo in production, SMTP locally
const sendEmail = async (to, subject, html) => {
  if (process.env.BREVO_API_KEY) {
    return sendEmailViaBrevo(to, subject, html);
  }
  
  // Local development: Use Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  console.log('Email sent via SMTP to:', to);
};

const sendActivationEmail = async (user, activationToken) => {
  const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?token=${activationToken}`;
  console.log('Activation Link:', activationUrl);

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Welcome to CloudVault!</h2>
      <p>Hi ${user.firstName} ${user.lastName},</p>
      <p>Thank you for registering. Please click the button below to activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationUrl}" 
           style="background-color: #4285f4; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Activate Account
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${activationUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 10 minutes. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail(user.email, 'Activate Your Account', html);
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${user.firstName} ${user.lastName},</p>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #ea4335; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 10 minutes. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail(user.email, 'Reset Your Password', html);
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail
};
