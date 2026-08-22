const db = require('../config/db');

const LikeModel = {
  async addLike(userId, postId) {
    await db.query(
      'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );
  },

  async removeLike(userId, postId) {
    await db.query(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
  },

  async countLikes(postId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );
    return rows[0].count;
  },

  async hasLiked(userId, postId) {
    const [rows] = await db.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    return rows.length > 0;
  }
};

module.exports = LikeModel;