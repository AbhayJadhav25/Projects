const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    if (user.name && user.skillsToTeach.length > 0 && user.skillsToLearn.length > 0) {
      user.profileCompleted = true;
    }

    if (req.file) {
      console.log('File received:', req.file.originalname);
      console.log('File size:', req.file.size);
      console.log('File buffer exists:', !!req.file.buffer);
      console.log('Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
        api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
      });

      try {
        if (user.profilePhotoPublicId) {
          await cloudinary.uploader.destroy(user.profilePhotoPublicId);
        }

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'skillswap/profiles' },
            (error, result) => {
              if (error) {
                console.log('Cloudinary stream error:', error.message, error.http_code);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          console.log('Stream created, ending with buffer...');
          stream.end(req.file.buffer);
        });

        console.log('Upload success:', result.secure_url);
        user.profilePhoto = result.secure_url;
        user.profilePhotoPublicId = result.public_id;
      } catch (uploadErr) {
        console.log('UPLOAD FAILED:', uploadErr.message);
        console.log('UPLOAD ERROR CODE:', uploadErr.http_code);
        return res.status(500).json({ message: uploadErr.message || 'Cloudinary upload failed' });
      }
    }
    await user.save();
    res.json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Get all users
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

// @desc    Get my learning hub
// @route   GET /api/users/learning-hub
// @access  Private
exports.getLearningHub = async (req, res) => {
  try {
    const Message = require('../models/Message');

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profilePhoto skillsToTeach skillsToLearn')
      .populate('receiver', 'name profilePhoto skillsToTeach skillsToLearn');

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

// @desc    Rate a user
// @route   POST /api/users/:id/rate
// @access  Private
exports.rateUser = async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't rate yourself" });
    }
    if (user.ratedBy && user.ratedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already rated this user' });
    }
    const newTotal = user.totalRatings + 1;
    user.rating = Math.round((((user.rating * user.totalRatings) + rating) / newTotal) * 10) / 10;
    user.totalRatings = newTotal;
    if (!user.ratedBy) user.ratedBy = [];
    user.ratedBy.push(req.user._id);
    await user.save();
    res.json({ rating: user.rating, totalRatings: user.totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate user' });
  }
};
