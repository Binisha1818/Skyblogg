const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {

    const userId = req.params.id;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.userId || null;
     console.log("DEBUG userId:", userId, typeof userId);

    const [posts] = await db.query(
      `SELECT posts.*, users.name AS author_name,
              IF(bookmark.user_id IS NOT NULL, 1, 0) AS bookmarked
       FROM posts
       JOIN users ON posts.author_id = users.id
       LEFT JOIN bookmark
              ON bookmark.post_id = posts.id AND bookmark.user_id = ?
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT comments.*, users.name AS author_name, posts.title AS post_title
       FROM comments
       JOIN users ON comments.user_id = users.id
       JOIN posts ON comments.post_id = posts.id
       ORDER BY comments.created_at DESC`
    );
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalPosts }]] = await db.query('SELECT COUNT(*) AS totalPosts FROM posts');
    const [[{ totalComments }]] = await db.query('SELECT COUNT(*) AS totalComments FROM comments');

    res.status(200).json({
      totalUsers,
      totalPosts,
      totalComments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

