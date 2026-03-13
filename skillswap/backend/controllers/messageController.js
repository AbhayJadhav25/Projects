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

    // Add to connections if not already connected
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { connections: req.params.userId }
    });
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { connections: req.user._id }
    });

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ message: 'Message deleted', messageId: req.params.messageId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
// @desc    Generate Google Meet link for a conversation
// @route   POST /api/messages/:userId/meet
// @access  Private
exports.generateMeetLink = async (req, res) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);

    // Generate a unique Meet-style link (in production, use Google Calendar/Meet API)
    const roomId = `SkillSwap-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const meetLink = `https://meet.jit.si/${roomId}`;
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
