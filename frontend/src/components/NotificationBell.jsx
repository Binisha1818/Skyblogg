import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Heart, MessageCircle } from "lucide-react";
import axios from "../api/axios";
import "./Notification.css";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/notifications");
      const now = Date.now();
      const formatTimeAgoAt = (nowTs, dateStr) => {
        const seconds = Math.floor((nowTs - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
      };

      setNotifications(
        res.data.notifications.map((n) => ({
          ...n,
          time_ago: formatTimeAgoAt(now, n.created_at),
        }))
      );
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
    };

    loadNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      try {
        await axios.patch("/notifications/read-all");
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    }
  };

  const timeAgo = (dateStr) => {
    // fallback in case time_ago wasn't provided
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="notification-wrapper" ref={menuRef}>
      <button className="notification-bell" onClick={toggleOpen}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">Notifications</div>

          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet</div>
          ) : (
            <div className="notification-list">
              {notifications.map((n) => (
                
                <a  key={n.id}
            href={`/post/${n.post_id}`}
                  className={`notification-item ${!n.is_read ? "unread" : ""}`}>
                
                  <span className="notification-icon">
                    {n.type === "like" ? (
                      <Heart size={16} fill="#e0245e" color="#e0245e" />
                    ) : (
                      <MessageCircle size={16} color="#1d9bf0" />
                    )}
                  </span>
                  <span className="notification-text">
                    <strong>{n.sender_name}</strong>{" "}
                    {n.type === "like" ? "liked" : "commented on"} your post "
                    <em>{n.post_title}</em>"
                  </span>
                  <span className="notification-time">
                    {n.time_ago ?? timeAgo(n.created_at)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}