const db = require('../config/db');

const PostModel = {
  async create({ title, content, image, author_id, status, category }) {
    const [result] = await db.query(
      'INSERT INTO posts (title, content, image, author_id, status, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, image, author_id, status || 'published', category || 'aviation_news']
    );
    return result.insertId;
  },

async findAll(userId = null, search = "", category = null) {

  let query = `
    SELECT posts.*, users.name AS author_name,

      (SELECT COUNT(*) 
       FROM likes 
       WHERE likes.post_id = posts.id) AS like_count,

      (SELECT COUNT(*) 
       FROM comments 
       WHERE comments.post_id = posts.id) AS comment_count,

      (SELECT COUNT(*) 
       FROM bookmark 
       WHERE bookmark.post_id = posts.id) AS bookmark_count,

      ${
        userId
          ? `(SELECT COUNT(*) 
              FROM likes 
              WHERE likes.post_id = posts.id 
              AND likes.user_id = ?) AS user_liked,`
          : `0 AS user_liked,`
      }

      ${
        userId
          ? `(SELECT COUNT(*) 
              FROM bookmark 
              WHERE bookmark.post_id = posts.id 
              AND bookmark.user_id = ?) AS user_bookmarked`
          : `0 AS user_bookmarked`
      }

    FROM posts
    JOIN users
    ON posts.author_id = users.id

    WHERE status = 'published'
  `;

    const params = [];

    if (userId) {
      params.push(userId, userId);
    }

    if (search) {
      const searchTerm = `%${search}%`;
       query += `
    AND (
      posts.title LIKE ?
      OR posts.content LIKE ?
      OR users.name LIKE ?
    )
  `;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== 'all') {
      query += `
    AND posts.category = ?
  `;
      params.push(category);
    }

    query += `
      ORDER BY posts.created_at DESC
    `;

    const [rows] = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT posts.*, users.name AS author_name 
       FROM posts 
       JOIN users ON posts.author_id = users.id 
       WHERE posts.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByAuthor(authorId) {
    const [rows] = await db.query(
      `SELECT posts.*, users.name AS author_name,
              (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS like_count
       FROM posts
       JOIN users ON posts.author_id = users.id
       WHERE posts.author_id = ?
       ORDER BY posts.created_at DESC`,
      [authorId]
    );
    return rows;
  },

  async update(id, { title, content, image, category }) {
    if (image) {
      await db.query(
        'UPDATE posts SET title = ?, content = ?, image = ?, category = COALESCE(?, category) WHERE id = ?',
        [title, content, image, category || null, id]
      );
    } else {
      await db.query(
        'UPDATE posts SET title = ?, content = ?, category = COALESCE(?, category) WHERE id = ?',
        [title, content, category || null, id]
      );
    }
  },

  async delete(id) {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
  }
};

module.exports = PostModel;
