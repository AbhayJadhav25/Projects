const Resource = require('../models/Resource');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    let type = 'other';
    let resourceType = 'raw';
    if (req.file.mimetype.startsWith('video/')) { type = 'video'; resourceType = 'video'; }
    else if (req.file.mimetype.startsWith('image/')) { type = 'document'; resourceType = 'image'; }
    else if (req.file.mimetype === 'application/pdf') { type = 'document'; resourceType = 'raw'; }

    // Upload to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'skillswap/resources',
          resource_type: resourceType,
          access_mode: 'public',
          public_id: `resource_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const resource = await Resource.create({
      uploader: req.user._id,
      title,
      description,
      category,
      type,
      fileUrl: cloudinaryResult.secure_url,
      filePublicId: cloudinaryResult.public_id,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      tags: tags ? JSON.parse(tags) : [],
    });
    await resource.populate('uploader', 'name profilePhoto');
    res.status(201).json({ resource });
  } catch (err) {
    console.error('Upload error:', JSON.stringify(err, null, 2));
    console.error('Upload error message:', err.message);
    console.error('Upload error stack:', err.stack);
    res.status(500).json({ message: err.message || 'Failed to upload resource' });
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

    // Return the Cloudinary URL directly — browser handles download
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

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    // Delete from Cloudinary
    if (resource.filePublicId) {
      await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};
