const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

// @desc    Get conversation messages
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:userId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: req.params.userId,
      text,
    });

    await message.populate('sender', 'name profilePhoto');

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// @desc    Generate Google Meet link for a conversation
// @route   POST /api/messages/:userId/meet
// @access  Private
exports.generateMeetLink = async (req, res) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    // Generate a unique Meet-style link (in production, use Google Calendar/Meet API)
    const meetId = uuidv4().replace(/-/g, '').substring(0, 12);
    const formattedId = `${meetId.slice(0, 4)}-${meetId.slice(4, 8)}-${meetId.slice(8, 12)}`;
    const meetLink = `https://meet.google.com/${formattedId}`;

    // Send as a special message to both users
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: req.params.userId,
      text: `Google Meet link generated: ${meetLink}`,
      meetLink,
      isMeetInvite: true,
    });

    await message.populate('sender', 'name profilePhoto');

    res.json({ message, meetLink });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate meet link' });
  }
};
