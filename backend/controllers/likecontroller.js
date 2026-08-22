const LikeModel = require('../models/likeModel');
const { createNotification } = require("./notificationController");
const db = require("../config/db"); // adjust path if your db config file is elsewhere

// Toggle like: if already liked, unlike. If not liked, like.
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;

    const alreadyLiked = await LikeModel.hasLiked(userId, postId);

    if (alreadyLiked) {
      await LikeModel.removeLike(userId, postId);
    } else {
      await LikeModel.addLike(userId, postId);

      // only notify on a fresh like, not on unlike
      const [[post]] = await db.query("SELECT author_id FROM posts WHERE id = ?", [postId]);

      if (post) {
        await createNotification({
          recipientId: post.author_id,
          senderId: userId,
          postId: postId,
          type: "like",
        });
      }
    }

    const count = await LikeModel.countLikes(postId);

    res.status(200).json({
      liked: !alreadyLiked,
      likeCount: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get like status + count for a post (used when loading the post page)
exports.getLikeStatus = async (req, res) => {
  try {
    const postId = req.params.postId;
    const count = await LikeModel.countLikes(postId);

    let liked = false;
    if (req.userId) {
      liked = await LikeModel.hasLiked(req.userId, postId);
    }

    res.status(200).json({ liked, likeCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};