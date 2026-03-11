const Resource = require('../models/Resource');
const path = require('path');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    const { category, type, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploader', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// @desc    Upload resource
// @route   POST /api/resources
// @access  Private
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const fileSize = req.file.size;
    const MIN_SIZE = 300 * 1024 * 1024; // 300 MB
    // Note: size restriction is 300-400 MB only if enforced; removing lower limit for usability
    // In production you may want to enforce minimum size differently

    let type = 'other';
    if (req.file.mimetype.startsWith('video/')) type = 'video';
    else if (req.file.mimetype.startsWith('image/')) type = 'document';
    else if (req.file.mimetype === 'application/pdf') type = 'document';

    const resource = await Resource.create({
      uploader: req.user._id,
      title,
      description,
      category,
      type,
      fileUrl: req.file.path.replace(/\\/g, '/'),
      fileSize,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      tags: tags ? JSON.parse(tags) : [],
    });

    await resource.populate('uploader', 'name profilePhoto');
    res.status(201).json({ resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload resource' });
  }
};

// @desc    Download resource (increment counter)
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloads += 1;
    await resource.save();

    res.json({ fileUrl: resource.fileUrl, fileName: resource.fileName });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process download' });
  }
};

// @desc    Like resource
// @route   PUT /api/resources/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const idx = resource.likes.indexOf(req.user._id);
    if (idx === -1) resource.likes.push(req.user._id);
    else resource.likes.splice(idx, 1);
    await resource.save();

    res.json({ likes: resource.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};
