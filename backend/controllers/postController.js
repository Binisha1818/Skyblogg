const PostModel = require('../models/postModel');
const fs = require('fs');
const path = require('path');

exports.createPost = async (req, res) => {
  try {
    const { title, content, status, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const author_id = req.userId; // set by protect middleware

    const postId = await PostModel.create({ title, content, image, author_id, status, category });

    res.status(201).json({
      message: 'Post created successfully',
      postId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.userId || null;
    const search = req.query.search || "";
    const category = req.query.category || null;

    const posts = await PostModel.findAll(userId, search, category);

    res.status(200).json({ posts });

  } catch (error) {
    console.error("getAllPosts error:", error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await PostModel.findByAuthor(req.userId);
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ownership check — only the author can edit
    if (post.author_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, category } = req.body;
    let image = null;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      // Delete old image file if it exists
      if (post.image) {
        const oldPath = path.join(__dirname, '..', post.image);
        fs.unlink(oldPath, (err) => { if (err) console.log('Old image not found, skipping delete'); });
      }
    }

    await PostModel.update(req.params.id, { title, content, image, category });
    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    if (post.image) {
      const imagePath = path.join(__dirname, '..', post.image);
      fs.unlink(imagePath, (err) => { if (err) console.log('Image not found, skipping delete'); });
    }

    await PostModel.delete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
