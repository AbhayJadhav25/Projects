const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dirs exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Profile photo storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles/';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `profile_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Resource storage
const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resources/';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `resource_${Date.now()}_${safeName}`);
  },
});

// Community post image storage
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/posts/';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `post_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const resourceFilter = (req, file, cb) => {
  const allowed = [
    'image/', 'video/', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats',
    'text/', 'application/zip',
  ];
  if (allowed.some((t) => file.mimetype.startsWith(t) || file.mimetype.includes(t))) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

const MAX_RESOURCE_SIZE = 400 * 1024 * 1024; // 400 MB

exports.uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadPostImage = multer({
  storage: postStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

exports.uploadResource = multer({
  storage: resourceStorage,
  fileFilter: resourceFilter,
  limits: { fileSize: MAX_RESOURCE_SIZE },
});
