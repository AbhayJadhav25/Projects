const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }, // activated after 10-15 min schedule
    otp: { type: String },
    otpExpiry: { type: Date },
    activationScheduledAt: { type: Date }, // when activation is scheduled
    profileCompleted: { type: Boolean, default: false },

    // Profile
    name: { type: String, trim: true },
    profilePhoto: { type: String, default: '' },
    profilePhotoPublicId: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    location: { type: String },

    // Skills
    skillsToTeach: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
      },
    ],
    skillsToLearn: [
      {
        name: { type: String, required: true },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
      },
    ],

    // Stats
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
