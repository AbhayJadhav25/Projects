const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    if (skillsToTeach) {
      user.skillsToTeach = typeof skillsToTeach === 'string'
        ? JSON.parse(skillsToTeach)
        : skillsToTeach;
    }
    if (skillsToLearn) {
      user.skillsToLearn = typeof skillsToLearn === 'string'
        ? JSON.parse(skillsToLearn)
        : skillsToLearn;
    }

    // Check if profile is completed
    if (user.name && user.skillsToTeach.length > 0 && user.skillsToLearn.length > 0) {
      user.profileCompleted = true;
    }

    if (req.file) {
      // Delete old photo
      if (user.profilePhoto && fs.existsSync(user.profilePhoto)) {
        fs.unlinkSync(user.profilePhoto);
      }
      user.profilePhoto = req.file.path.replace(/\\/g, '/');
    }

    await user.save();
    res.json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Get all users (Skill Exchange page - show cards)
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const { search, skill } = req.query;
    const query = {
      _id: { $ne: req.user._id },
      isActive: true,
      profileCompleted: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skillsToTeach.name': { $regex: search, $options: 'i' } },
        { 'skillsToLearn.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (skill) {
      query['skillsToTeach.name'] = { $regex: skill, $options: 'i' };
    }

    const users = await User.find(query)
      .select('name email profilePhoto bio skillsToTeach skillsToLearn location rating')
      .limit(50);

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// @desc    Get my learning hub (conversation history)
// @route   GET /api/users/learning-hub
// @access  Private
exports.getLearningHub = async (req, res) => {
  try {
    const Message = require('../models/Message');
    
    // Get unique conversation partners
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profilePhoto skillsToTeach skillsToLearn')
      .populate('receiver', 'name profilePhoto skillsToTeach skillsToLearn');

    // Extract unique users
    const partnerMap = new Map();
    for (const msg of messages) {
      const partner = msg.sender._id.toString() === req.user._id.toString()
        ? msg.receiver
        : msg.sender;
      if (!partnerMap.has(partner._id.toString())) {
        partnerMap.set(partner._id.toString(), {
          user: partner,
          lastMessage: msg.text,
          lastActivity: msg.createdAt,
        });
      }
    }

    res.json({ contacts: Array.from(partnerMap.values()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch learning hub' });
  }
};
