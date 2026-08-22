const db = require("../config/db");

exports.toggleBookmark = async (req, res) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId;

        const [bookmark] = await db.query(
            "SELECT * FROM bookmark WHERE user_id=? AND post_id=?",
            [userId, postId]
        );

        if (bookmark.length > 0) {
            await db.query(
                "DELETE FROM bookmark WHERE user_id=? AND post_id=?",
                [userId, postId]
            );

            return res.json({
                bookmarked: false
            });
        }

        await db.query(
            "INSERT INTO bookmark(user_id, post_id) VALUES(?, ?)",
            [userId, postId]
        );

        res.json({
            bookmarked: true
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.userId;

        const [posts] = await db.query(`
            SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.image,
                posts.created_at,
                users.name AS author,
                1 AS bookmarked
            FROM bookmark
            JOIN posts
                ON bookmark.post_id = posts.id
            JOIN users
                ON posts.author_id = users.id
            WHERE bookmark.user_id = ?
            ORDER BY bookmark.created_at DESC
        `, [userId]);

        res.json(posts);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
