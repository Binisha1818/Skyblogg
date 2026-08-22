const db = require("../config/db");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
const [notifications] = await db.query(
  `SELECT n.id, n.type, n.is_read, n.created_at, n.post_id,
          u.name AS sender_name,
          p.title AS post_title
   FROM notifications n
   JOIN users u ON n.sender_id = u.id
   JOIN posts p ON n.post_id = p.id
   WHERE n.recipient_id = ?
   ORDER BY n.created_at DESC
   LIMIT 30`,
  [userId]
);

    const [[{ unread_count }]] = await db.query(
      `SELECT COUNT(*) AS unread_count FROM notifications WHERE recipient_id = ? AND is_read = FALSE`,
      [userId]
    );

    res.json({ notifications, unreadCount: unread_count });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?`,
      [id, userId]
    );

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?`,
      [userId]
    );

    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

// Helper — imported and called from likeController and commentController
exports.createNotification = async ({ recipientId, senderId, postId, type }) => {
  if (recipientId === senderId) return; // don't notify yourself

  try {
    await db.query(
      `INSERT INTO notifications (recipient_id, sender_id, post_id, type) VALUES (?, ?, ?, ?)`,
      [recipientId, senderId, postId, type]
    );
  } catch (err) {
    console.error("Create notification error:", err);
  }
};