import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CommentSheet from '../components/CommentSheet';
import DOMPurify from "dompurify";
import './PostView.css';

export default function PostView() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${id}`)
      .then(res => setPost(res.data.post))
      .catch(() => setError('Post not found'));

    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/likes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      })
      .catch(() => {});
  }, [id]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setLikeLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {
      alert('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
  };

  if (error) return <p>{error}</p>;
  if (!post) return <p>Loading...</p>;

  const isAuthor = user && Number(user.id) === Number(post.author_id);

  return (
    <div className="post-view">
  

      <h1 className="head">{post.title}</h1>
          {post.image && (
        <img
          className="post-view__image"
          src={`http://localhost:5000${post.image}`}
          alt={post.title}
        />
      )}

   <div
  className="post-view__content"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(post.content),
  }}
/>
       <p className="post-view__author">By {post.author_name}</p>
      {showLoginPrompt && <p className="post-view__prompt">Please log in to like this post.</p>}

      <div className="post-view__reactions">
        <button
          className={`like-button ${liked ? 'like-button--liked' : ''}`}
          onClick={handleLikeToggle}
          disabled={likeLoading}
        >
          <Heart
            size={20}
            fill={liked ? '#ad0d0d' : 'none'}
            color={liked ? 'hsl(0, 93%, 26%)' : 'rgb(116, 95, 95)'}
          />
          <span>{likeCount}</span>
        </button>

        <button className="comment-trigger-btn" onClick={() => setActiveCommentPostId(post.id)}>
          <MessageCircle size={16} />
          {post.comment_count}
        </button>
      </div>

      {isAuthor && (
        <div className="post-act">
          <Link to={`/posts/${post.id}/edit`}>
            <button>Edit</button>
          </Link>
          <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
            Delete
          </button>
        </div>
      )}

      {activeCommentPostId && (
        <CommentSheet
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Delete Confirmation</h3>
            <p>Delete "{post.title}"? This cannot be undone.</p>

            <div className="admin-modal__actions">
              <button
                className="admin-modal__cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="admin-modal__delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}