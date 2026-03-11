const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike, addComment, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadPostImage } = require('../middleware/upload');

router.get('/', protect, getPosts);
router.post('/', protect, uploadPostImage.single('image'), createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
