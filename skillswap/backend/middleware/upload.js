const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary config check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
});
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
});
// Profile photo storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillswap/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

// Resource storage
const resourceStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video/')) resourceType = 'video';
    else if (file.mimetype === 'application/pdf') resourceType = 'raw';
    else if (file.mimetype.startsWith('image/')) resourceType = 'image';
    else resourceType = 'raw';

    return {
      folder: 'skillswap/resources',
      resource_type: resourceType,
      public_id: `resource_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    };
  },
});

// Post image storage
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillswap/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Filters
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB (Cloudinary free limit)
});
