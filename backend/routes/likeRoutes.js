const express = require('express');
const router = express.Router();
const { toggleLike, getLikeStatus } = require('../controllers/likecontroller');
const protect = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/:postId', optionalAuth, getLikeStatus);  // public, but shows liked:true if logged in
router.post('/:postId', protect, toggleLike);          // must be logged in to like

module.exports = router;