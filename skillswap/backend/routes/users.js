const express = require('express');
const router = express.Router();
const { updateProfile, getAllUsers, getUserById, getLearningHub, rateUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');

router.get('/', protect, getAllUsers);
router.get('/learning-hub', protect, getLearningHub);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, uploadProfilePhoto.single('profilePhoto'), updateProfile);

const { updateProfile, getAllUsers, getUserById, getLearningHub, rateUser } = require('../controllers/userController');

router.post('/:id/rate', protect, rateUser);
module.exports = router;
