const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const {
  getAllUsers,
  deleteUser,
  getAllPosts,
  deletePost,
  getAllComments,
  deleteComment
} = require('../controllers/adminController');

router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

router.get('/posts', protect, adminOnly, getAllPosts);
router.delete('/posts/:id', protect, adminOnly, deletePost);

router.get('/comments', protect, adminOnly, getAllComments);
router.delete('/comments/:id', protect, adminOnly, deleteComment);

module.exports = router;
