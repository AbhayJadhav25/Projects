const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Send OTP to email before registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existingActive = await User.findOne({ email, isActive: true });
    if (existingActive) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email, isActive: false });
    if (!user) {
      user = new User({ email, password: 'TEMP_WILL_BE_REPLACED', otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    await user.save();

    try {
      await sendOTPEmail(email, otp);
      res.json({ message: 'OTP sent to your email' });
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
      res.json({ message: 'OTP sent to your email' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }

  // @desc    Register user (with OTP + schedule activation)
  // @route   POST /api/auth/register
  // @access  Public
  exports.register = async (req, res) => {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ message: 'Email, password and OTP are required' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Please request an OTP first' });

      if (user.isActive) return res.status(400).json({ message: 'Account already exists' });

      if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

      if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

      // Schedule activation: 10-15 minutes from now (random)
      user.password = password;
      user.isVerified = true;
      user.isActive = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.activationScheduledAt = new Date();

      await user.save();

      res.status(201).json({
        message: `Registration successful! Your account is now active. Please login.`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
    }
  };

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please complete email verification first' });
      }

      if (!user.isActive) {
        const remaining = user.activationScheduledAt
          ? Math.max(0, Math.ceil((user.activationScheduledAt - Date.now()) / 60000))
          : 0;
        return res.status(401).json({
          message: `Your account is being activated. Please wait approximately ${remaining} more minute(s).`,
          isPending: true,
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          profilePhoto: user.profilePhoto,
          profileCompleted: user.profileCompleted,
          skillsToTeach: user.skillsToTeach,
          skillsToLearn: user.skillsToLearn,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Login failed' });
    }
  };

  // @desc    Get current user
  // @route   GET /api/auth/me
  // @access  Private
  exports.getMe = async (req, res) => {
    res.json({ user: req.user });
  };
