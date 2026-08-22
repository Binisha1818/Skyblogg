import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { X, Send, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./CommentSheet.css";

const API_URL = "https://sky-dlae.onrender.com";

const MAX_INDENT_DEPTH = 3;

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;

  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo` : `${Math.floor(days / 365)}y`;
}
function removeCommentById(comments, id) {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeCommentById(c.replies, id) : c.replies,
    }));
}
export default function CommentSheet({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Reply chip
  const [replyTarget, setReplyTarget] = useState(null);
  const inputRef = useRef(null);

  // Delete modal   👈 NEW
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const res = await axios.get(
        `${API_URL}/api/posts/${postId}/comments`,
        config
      );

      console.log("Comments response:", res.data);

      if (Array.isArray(res.data)) {
        setComments(res.data);
      } else if (Array.isArray(res.data.comments)) {
        setComments(res.data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function startReply(commentId, authorName) {
    setReplyTarget({
      id: commentId,
      authorName,
    });

    inputRef.current?.focus();
  }

  const cancelReply = () => {
    setReplyTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        replyTarget
          ? "Please log in to reply"
          : "Please log in to comment"
      );
      return;
    }

    setPosting(true);

    try {
      if (replyTarget) {
        await axios.post(
          `${API_URL}/api/comments/${replyTarget.id}/reply`,
          {
            content: newComment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/api/posts/${postId}/comments`,
          {
            content: newComment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setNewComment("");
      setReplyTarget(null);

      fetchComments();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          (replyTarget
            ? "Failed to post reply"
            : "Failed to post comment")
      );
    } finally {
      setPosting(false);
    }
  };

  // 👈 NEW — delete handlers
  const handleDelete = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/comments/${commentToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => removeCommentById(prev, commentToDelete));
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch {
      alert("Failed to delete comment");
    }
  };

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "?";
return (
  <div className="sheet-overlay" onClick={onClose}>
    <div className="sheet" onClick={(e) => e.stopPropagation()}>
      <div className="sheet__handle" />

      <div className="sheet__header">
        <h3>Comments</h3>

        <button
          className="sheet__close"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="sheet__list">
        {loading && (
          <p className="sheet__empty">
            Loading...
          </p>
        )}

        {!loading && comments.length === 0 && (
          <p className="sheet__empty">
            No comments yet. Be the first.
          </p>
        )}

        {comments.map((comment) => (
          <SheetCommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            user={user}
            onReplyClick={startReply}
            onDeleteClick={handleDelete}
          />
        ))}
      </div>

      {replyTarget && (
        <div className="sheet__replyChip">
          Replying to{" "}
          <strong>
            @{replyTarget.authorName}
          </strong>

          <button
            type="button"
            className="sheet__replyChip-close"
            onClick={cancelReply}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="sheet__inputRow"
      >
        <div className="sheet__avatar">
          {initial}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="sheet__input"
          disabled={!user}
          value={newComment}
          onChange={(e) =>
            setNewComment(e.target.value)
          }
          placeholder={
            !user
              ? "Log in to comment"
              : replyTarget
              ? `Reply to @${replyTarget.authorName}...`
              : "Join the conversation..."
          }
        />

    <button
          type="submit"
          className="sheet__send"
          disabled={posting}
        >
          <Send size={20} />
        </button>
      </form>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Comment</h3>
            <p>Are you sure you want to delete this comment?</p>
            <div className="delete-modal__buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
              >
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

function SheetCommentItem({
  comment,
  depth,
  user,
  onReplyClick,
  onDeleteClick,   // 👈 1. added prop
}) {
  const [showReplies, setShowReplies] = useState(depth > 0);

  const [liked, setLiked] = useState(comment.user_liked);
  const [likeCount, setLikeCount] = useState(comment.like_count);

  const commentInitial = comment.author_name
    .charAt(0)
    .toUpperCase();

  const indent =
    Math.min(depth, MAX_INDENT_DEPTH) * 24;

  const replyCount =
    comment.replies?.length || 0;

  const toggleLike = async () => {
    if (!user) {
      alert("Please log in to like comments");
      return;
    }

    const token =
      localStorage.getItem("token");

    try {
      await axios.post(
        `${API_URL}/api/comments/${comment.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (liked) {
        setLikeCount((prev) => prev - 1);
      } else {
        setLikeCount((prev) => prev + 1);
      }

      setLiked((prev) => !prev);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to like comment"
      );
    }
  };

  return (
    <div
      className="sheet-comment"
      style={{
        marginLeft: `${indent}px`,
      }}
    >
      <div className="sheet-comment__avatar">
        {commentInitial}
      </div>

      <div className="sheet-comment__body">

        <div className="sheet-comment__meta">
          <span className="sheet-comment__name">
            {comment.author_name}
          </span>

          <span className="sheet-comment__time">
            {formatRelativeTime(
              comment.created_at
            )}
          </span>
        </div>

        <p className="sheet-comment__text">
          {comment.content}
        </p>

        <div className="sheet-comment__actions">

          <button
            className="sheet-comment__action-btn"
            onClick={() =>
              onReplyClick(
                comment.id,
                comment.author_name
              )
            }
          >
            Reply
          </button>

          <button
            type="button"
            className="sheet-comment__like-btn"
            onClick={toggleLike}
          >
            <Heart
              size={15}
              className={`sheet-comment__like ${
                liked ? "liked" : ""
              }`}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>{likeCount}</span>
          </button>

          {user && Number(user.id) === Number(comment.user_id) && (
            <button
              type="button"
              className="sheet-comment__action-btn sheet-comment__delete-btn"
              onClick={() => onDeleteClick(comment.id)}
            >
              Delete
            </button>
          )}
          {/* 👆 2. added Delete button, only shows for comment owner */}

        </div>

        {replyCount > 0 && (
          <button
            className="sheet-comment__toggle-replies"
            onClick={() =>
              setShowReplies(
                (prev) => !prev
              )
            }
          >
            {showReplies
              ? "Hide replies"
              : `View replies (${replyCount})`}
          </button>
        )}
{showReplies &&
          replyCount > 0 && (
            <div className="sheet-comment__replies">
              {comment.replies.map(
                (reply) => (
                  <SheetCommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    user={user}
                    onReplyClick={
                      onReplyClick
                    }
                    onDeleteClick={
                      onDeleteClick
                    }
                  />
                )
              )}
            </div>
          )}

      </div>
    </div>
  );
}
