const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'SkillSwap - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; font-size: 2rem; margin: 0;">SkillSwap</h1>
          <p style="color: #666; margin-top: 5px;">Connect. Learn. Grow.</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #555; line-height: 1.6;">Thank you for signing up! Please use the OTP below to verify your email address.</p>
          <div style="background: #6366f1; color: white; font-size: 2.5rem; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 0.9rem;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #888; font-size: 0.9rem;">After OTP verification, your account will be created within <strong>10-15 minutes</strong>.</p>
        </div>
        <p style="color: #aaa; text-align: center; margin-top: 20px; font-size: 0.8rem;">© 2024 SkillSwap. All rights reserved.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendAccountCreatedEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to SkillSwap - Your Account is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 12px;">
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 2.5rem; margin: 0;">SkillSwap</h1>
            <p style="color: #666; margin-top: 5px; font-size: 1.1rem;">Your Gateway to Skill Exchange</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #6366f1; margin-top: 0;">Welcome to the Community!</h2>
            <p style="color: #555; line-height: 1.8; font-size: 1rem;">
              Your SkillSwap account has been <strong>successfully created</strong>! You're now part of a vibrant community of learners and teachers.
            </p>
            <p style="color: #555; line-height: 1.8;">With SkillSwap, you can:</p>
            <ul style="color: #555; line-height: 2;">
              <li>Book <strong>Teach</strong> skills you're passionate about</li>
              <li>Seedling <strong>Learn</strong> new skills from experts</li>
              <li>Handshake <strong>Connect</strong> with like-minded people</li>
              <li>Chat <strong>Chat & collaborate</strong> in real-time</li>
              <li>Target <strong>Share resources</strong> with the community</li>
            </ul>
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.FRONTEND_URL}/login" style="background: #6366f1; color: white; padding: 14px 35px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 1rem; display: inline-block;">
                Get Started Now
              </a>
            </div>
          </div>
          <p style="color: #aaa; text-align: center; margin-top: 20px; font-size: 0.8rem;">
            You're receiving this because you registered at SkillSwap.<br/>
            © 2024 SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendAccountCreatedEmail };
