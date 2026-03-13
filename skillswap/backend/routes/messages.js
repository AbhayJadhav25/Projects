const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, generateMeetLink, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);
router.post('/:userId/meet', protect, generateMeetLink);
router.delete('/:messageId', protect, deleteMessage);


module.exports = router;
