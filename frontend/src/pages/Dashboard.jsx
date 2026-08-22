import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import Toast from '../components/Toast';
import './Dashboard.css';
import DashboardLayout from '../components/Dashboardlayout';
import Bookmark from './Bookmark';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const location = useLocation();
  const justLoggedIn = location.state?.justLoggedIn;

  const [showToast, setShowToast] = useState(() => !!justLoggedIn);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then(res => setProfile(res.data.user))
      .catch(() => {});

    const token = localStorage.getItem('token');

    axios.get(
      'http://localhost:5000/api/posts/user/mine',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => setMyPosts(res.data.posts))
      .catch((err) => {
        console.error('Failed to fetch my posts:', err);
      })
      .finally(() => setLoadingPosts(false));

    if (justLoggedIn) {
      window.history.replaceState({}, document.title);
    }
  }, [justLoggedIn]);

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(
          'http://localhost:5000/api/bookmarks',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBookmarks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookmarks();
  }, []);

  const handleDelete = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/posts/${postToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMyPosts(prev =>
        prev.filter(post => post.id !== postToDelete)
      );

      setShowDeleteModal(false);
      setPostToDelete(null);

    } catch {
      alert('Failed to delete');
    }
  };

  const published = myPosts.filter(
    p => p.status === 'published'
  );

  const drafts = myPosts.filter(
    p => p.status === 'draft'
  );

  const renderPost = (post) => (
    <div key={post.id} className="post-card">
      <div className="post-card__image-wrapper">
        {post.image ? (
          <img
            src={`http://localhost:5000${post.image}`}
            alt={post.title}
            className="post-card__image"
          />
        ) : (
          <div className="post-card__image post-card__image--placeholder">
            No image
          </div>
        )}
      </div>
      <div className="post-card__body">
        <Link
          to={post.status === 'draft' ? `/posts/${post.id}/edit` : `/blog/${post.id}`}
          className="post-card__title"
        >
          {post.title}
        </Link>
        <div className="post-card__meta">
          {new Date(post.created_at).toLocaleDateString()} · {post.like_count || 0} likes
        </div>
        <div className="post-card__actions">
          <Link to={`/posts/${post.id}/edit`} className="post-card__action-link">
            <button className="post-card__edit-btn">Edit</button>
          </Link>
          <button
            onClick={() => handleDelete(post.id)}
            className="post-card__delete-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {showToast && (
        <Toast
          message="Successfully logged in!"
          onClose={() => setShowToast(false)}
        />
      )}

      {profile && (
        <div className="dashboard__header">
          <p className="dashboard__welcome">
            Welcome, {profile.name}
          </p>
        </div>
      )}

      {loadingPosts ? (
        <p className="dashboard__loading">Loading posts...</p>
      ) : (
        <DashboardLayout
          publishedContent={
            <>
              <h3 className="dashboard__section-title">
                Published Posts
              </h3>

              {published.length === 0 ? (
                <p className="dashboard__empty">
                  No published posts yet.
                </p>
              ) : (
                <div className="post-grid">
                  {published.map(renderPost)}
                </div>
              )}
            </>
          }

          draftsContent={
            <>
              <h3 className="dashboard__section-title">
                Drafts
              </h3>

              {drafts.length === 0 ? (
                <p className="dashboard__empty">
                  No drafts.
                </p>
              ) : (
                <div className="post-grid">
                  {drafts.map(renderPost)}
                </div>
              )}
            </>
          }

          bookmarksContent={
            <Bookmark
              posts={bookmarks}
              setPosts={setBookmarks}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="modal-confirm-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}