const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name profilePhoto')
      .populate('comments.user', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, type, tags } = req.body;
    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      type: type || 'post',
      tags: tags ? JSON.parse(tags) : [],
      image: req.file ? req.file.path.replace(/\\/g, '/') : undefined,
    });
    await post.populate('author', 'name profilePhoto');
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'name profilePhoto');

    const newComment = post.comments[post.comments.length - 1];
    res.json({ comment: newComment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
};
