const multer = require('multer');
const storage = multer.memoryStorage();

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
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadPostImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadResource = multer({
  storage,
  fileFilter: resourceFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});