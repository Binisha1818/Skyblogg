const express = require('express');
const router = express.Router();

const {
  createComment,
  getComments,
  deleteComment,
  replyComment,
  toggleCommentLike
} = require('../controllers/commentController');

const protect = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');


// Get all comments of a post (optional auth so user_liked reflects the viewer)
router.get(
  '/posts/:id/comments',
  optionalAuth,
  getComments
);


// Create new comment
router.post(
  '/posts/:id/comments',
  protect,
  createComment
);


// Delete comment
router.delete(
  '/comments/:commentId',
  protect,
  deleteComment
);


// Reply to comment
router.post(
  '/comments/:commentId/reply',
  protect,
  replyComment
);


// Toggle like on a comment
router.post(
  '/comments/:commentId/like',
  protect,
  toggleCommentLike
);


module.exports = router;