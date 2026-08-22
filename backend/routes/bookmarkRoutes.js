const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
    toggleBookmark,
    getBookmarks
} = require("../controllers/bookmarkController");

router.post("/:postId", auth, toggleBookmark);

router.get("/", auth, getBookmarks);

module.exports = router;