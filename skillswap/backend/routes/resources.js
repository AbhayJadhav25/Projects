const express = require('express');
const router = express.Router();
const { getResources, uploadResource, downloadResource, toggleLike } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { uploadResource: uploadFile } = require('../middleware/upload');

router.get('/', protect, getResources);
router.post('/', protect, uploadFile.single('file'), uploadResource);
router.get('/:id/download', protect, downloadResource);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
