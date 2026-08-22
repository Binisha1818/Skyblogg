import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Comment.css';

const MAX_INDENT_DEPTH = 4;
const API_URL = "https://sky-dlae.onrender.com";

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
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

const removeCommentById = (list, id) =>
  list
    .filter(c => c.id !== id)
    .map(c => ({ ...c, replies: removeCommentById(c.replies || [], id) }));

const updateCommentLike = (list, id, liked, likeCount) =>
  list.map(c =>
    c.id === id
      ? { ...c, user_liked: liked, like_count: likeCount, replies: c.replies || [] }
      : { ...c, replies: updateCommentLike(c.replies || [], id, liked, likeCount) }
  );

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [error, setError] = useState('');

  const { user } = useAuth();

  const fetchComments = useCallback(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/posts/${postId}/comments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setComments(res.data.comments))
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to comment');
      return;
    }

    setPosting(true);
    setError('');

    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewComment('');
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to reply');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/comments/${commentId}/reply`,
        { content: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplyText('');
      setReplyingTo(null);
      setError('');
      fetchComments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleDelete = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/api/comments/${commentToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => removeCommentById(prev, commentToDelete));

      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch {
      alert('Failed to delete comment');
    }
  };

  const handleLikeToggle = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to like comments');
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => updateCommentLike(prev, commentId, res.data.liked, res.data.likeCount));
    } catch {
      setError('Failed to update like');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="comments__form">
        <textarea
          placeholder={user ? 'Add a comment...' : 'Log in to comment'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          rows={3}
          className="comments__input"
        />

        {error && <p className="comments__error">{error}</p>}

        <button
          type="submit"
          disabled={!user || posting || !newComment.trim()}
          className="comments__submit"
        >
          {posting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {loading && <p className="comments__loading">Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p className="comments__empty">No comments yet. Be the first to comment.</p>
      )}

      <div className="comments__list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            user={user}
            replyingTo={replyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            setReplyingTo={setReplyingTo}
            onReplySubmit={handleReply}
            onDelete={handleDelete}
            onLikeToggle={handleLikeToggle}
          />
        ))}
      </div>

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
  );
}

function CommentItem({
  comment,
  depth,
  user,
  replyingTo,
  replyText,
  setReplyText,
  setReplyingTo,
  onReplySubmit,
  onDelete,
  onLikeToggle,
}) {
  const [showReplies, setShowReplies] = useState(depth > 0);

  const isOwner = user && Number(user.id) === Number(comment.user_id);
  const indent = Math.min(depth, MAX_INDENT_DEPTH) * 32;
  const replyCount = comment.replies?.length || 0;

  return (
    <div className="comment" style={{ marginLeft: `${indent}px` }}>
      <div className="comment__avatar">
        {comment.author_name?.[0]?.toUpperCase() || '?'}
      </div>

      <div className="comment__body">
        <p className="comment__line">
          <span className="comment__author">{comment.author_name}</span>{' '}
          <span className="comment__text">{comment.content}</span>
        </p>

        <div className="comment__meta">
          <span className="comment__date">{formatRelativeTime(comment.created_at)}</span>
          <button className="comment__meta-btn" onClick={() => setReplyingTo(comment.id)}>
            Reply
          </button>
          {isOwner && (
            <button className="comment__meta-btn comment__meta-btn--danger" onClick={() => onDelete(comment.id)}>
              Delete
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="comment__reply-box">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply..."
              className="comments__input"
              autoFocus
            />
            <div className="comment__reply-actions">
              <button type="button" onClick={() => onReplySubmit(comment.id)}>
                Post
              </button>
              <button type="button" onClick={() => setReplyingTo(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {replyCount > 0 && (
          <button className="comment__toggle-replies" onClick={() => setShowReplies(v => !v)}>
            <span className="comment__toggle-dash" />
            {showReplies ? 'Hide replies' : `View replies (${replyCount})`}
          </button>
        )}

        {showReplies && replyCount > 0 && (
          <div className="comment__replies">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                user={user}
                replyingTo={replyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                setReplyingTo={setReplyingTo}
                onReplySubmit={onReplySubmit}
                onDelete={onDelete}
                onLikeToggle={onLikeToggle}
              />
            ))}
          </div>
        )}
      </div>

      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Heart
          size={14}
          className="comment__like"
          fill={comment.user_liked ? '#ed4956' : 'none'}
          color={comment.user_liked ? '#ed4956' : undefined}
          onClick={() => onLikeToggle(comment.id)}
        />
        {comment.like_count > 0 && (
          <span style={{ fontSize: 11, color: '#8e8e8e' }}>{comment.like_count}</span>
        )}
      </span>
    </div>
  );
}
