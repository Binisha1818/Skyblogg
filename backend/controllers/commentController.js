const db = require('../config/db');
const { createNotification } = require("./notificationController");

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const [rows] = await db.query("SELECT author_id FROM posts WHERE id = ?", [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const [result] = await db.query(
      'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)',
      [content, userId, postId]
    );

    // notify the post author (skip if commenting on your own post)
    await createNotification({
      recipientId: rows[0].author_id,
      senderId: userId,
      postId: postId,
      type: "comment",
    });

    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {

    console.log("req.userId:", req.userId);
console.log("Authorization:", req.headers.authorization);
    const postId = req.params.id;
    const userId = req.userId || null; // null if request is unauthenticated

    const [rows] = await db.query(
      `SELECT
         comments.*,
         users.name AS author_name,
         COUNT(DISTINCT cl.id) AS like_count,
         MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END) AS user_liked
       FROM comments
       JOIN users ON comments.user_id = users.id
       LEFT JOIN comment_likes cl ON cl.comment_id = comments.id
       WHERE comments.post_id = ?
       GROUP BY comments.id
       ORDER BY comments.created_at ASC`,
      [userId, postId]
    );

    const map = {};
    rows.forEach(row => {
      map[row.id] = {
        ...row,
        like_count: Number(row.like_count),
        user_liked: Boolean(row.user_liked),
        replies: [],
      };
    });

    const roots = [];

    rows.forEach(row => {
      const node = map[row.id];
      if (row.parent_comment_id) {
        const parent = map[row.parent_comment_id];
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    res.status(200).json({ comments: roots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// TOGGLE LIKE ON A COMMENT
exports.toggleCommentLike = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;

    const [existing] = await db.query(
      'SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    let liked;
    if (existing.length > 0) {
      await db.query(
        'DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );
      liked = false;
    } else {
      await db.query(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)',
        [commentId, userId]
      );
      liked = true;
    }

    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );

    res.status(200).json({ liked, likeCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;

    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comments[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// ADD REPLY TO COMMENT
exports.replyComment = async (req, res) => {

  try {

    const { content } = req.body;

    const commentId = req.params.commentId;

    const userId = req.userId;



    // Check empty reply
    if (!content || !content.trim()) {

      return res.status(400).json({
        message: "Reply cannot be empty"
      });

    }



    // Check parent comment exists and get post id

    const [comments] = await db.query(

      "SELECT id, post_id FROM comments WHERE id = ?",

      [commentId]

    );



    if (comments.length === 0) {

      return res.status(404).json({
        message:"Parent comment not found"
      });

    }



    const postId = comments[0].post_id;



    // Insert reply

    const [result] = await db.query(

      `
      INSERT INTO comments
      (content, user_id, post_id, parent_comment_id)
      VALUES (?, ?, ?, ?)
      `,

      [
        content,
        userId,
        postId,
        commentId
      ]

    );



    res.status(201).json({

      message:"Reply added successfully",

      replyId: result.insertId

    });



  } catch(error) {


    console.log(error);


    res.status(500).json({

      message:"Server error",

      error:error.message

    });


  }

};