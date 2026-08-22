import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Toast from '../components/Toast';
import './AdminDashboard.css';

const API = 'http://localhost:5000/api/admin';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchData = async (which) => {
      setLoading(true);
      try {
        const currentHeaders = {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        if (which === 'users') {
          const res = await axios.get(`${API}/users`, { headers: currentHeaders });
          setUsers(res.data.users);
        } else if (which === 'posts') {
          const res = await axios.get(`${API}/posts`, { headers: currentHeaders });
          setPosts(res.data.posts);
        } else if (which === 'comments') {
          const res = await axios.get(`${API}/comments`, { headers: currentHeaders });
          setComments(res.data.comments);
        }
      } catch (err) {
        console.log('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(tab);
  }, [tab, user]);

  const openDeleteModal = (type, id, label) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteLabel(label);
    setShowModal(true);
  };

  const closeModal = () => {
    if (deleting) return; // prevent closing mid-request
    setShowModal(false);
    setDeleteId(null);
    setDeleteType('');
    setDeleteLabel('');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteType === 'user') {
        await axios.delete(`${API}/users/${deleteId}`, { headers });
        setUsers(prev => prev.filter(u => u.id !== deleteId));
        setToastMsg(`${deleteLabel} deleted`);
      }

      if (deleteType === 'post') {
        await axios.delete(`${API}/posts/${deleteId}`, { headers });
        setPosts(prev => prev.filter(p => p.id !== deleteId));
        setToastMsg(`"${deleteLabel}" deleted`);
      }

      if (deleteType === 'comment') {
        await axios.delete(`${API}/comments/${deleteId}`, { headers });
        setComments(prev => prev.filter(c => c.id !== deleteId));
        setToastMsg('Comment deleted');
      }

      setShowModal(false);
      setDeleteId(null);
      setDeleteType('');
      setDeleteLabel('');
    } catch (error) {
      console.error('Delete failed:', error);
      setToastMsg('Delete failed — please try again');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading...</p>;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return (
    <div className="admin">
      <h2 className="admin__heading">Admin Panel</h2>

      <div className="admin__tabs">
        <button
          className={tab === 'users' ? 'admin__tab admin__tab--active' : 'admin__tab'}
          onClick={() => setTab('users')}
        >
          Users
        </button>

        <button
          className={tab === 'posts' ? 'admin__tab admin__tab--active' : 'admin__tab'}
          onClick={() => setTab('posts')}
        >
          Posts
        </button>

        <button
          className={tab === 'comments' ? 'admin__tab admin__tab--active' : 'admin__tab'}
          onClick={() => setTab('comments')}
        >
          Comments
        </button>
      </div>

      {loading && <p className="admin__loading">Loading...</p>}

      {!loading && tab === 'users' && (
        <table className="admin__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>

                <td>
                  <span
                    className={
                      u.role === 'admin'
                        ? 'admin__badge admin__badge--admin'
                        : 'admin__badge'
                    }
                  >
                    {u.role}
                  </span>
                </td>

                <td>{new Date(u.created_at).toLocaleDateString()}</td>

                <td>
                  {u.role !== 'admin' && (
                    <button
                      className="admin__delete-btn"
                      onClick={() => openDeleteModal('user', u.id, u.name)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && tab === 'posts' && (
        <table className="admin__table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {posts.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.author_name}</td>

                <td>
                  <span
                    className={
                      p.status === 'draft'
                        ? 'admin__badge admin__badge--draft'
                        : 'admin__badge admin__badge--published'
                    }
                  >
                    {p.status}
                  </span>
                </td>

                <td>{new Date(p.created_at).toLocaleDateString()}</td>

                <td>
                  <button
                    className="admin__delete-btn"
                    onClick={() => openDeleteModal('post', p.id, p.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && tab === 'comments' && (
        <table className="admin__table">
          <thead>
            <tr>
              <th>Comment</th>
              <th>Author</th>
              <th>Post</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {comments.map(c => (
              <tr key={c.id}>
                <td className="admin__comment-text">{c.content}</td>
                <td>{c.author_name}</td>
                <td>{c.post_title}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>

                <td>
                  <button
                    className="admin__delete-btn"
                    onClick={() => openDeleteModal('comment', c.id, c.content)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Modal */}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <h3>Delete Confirmation</h3>

            <p>
              {deleteType === 'user' &&
                `Delete "${deleteLabel}"? This will also remove all of their posts and comments.`}

              {deleteType === 'post' &&
                `Delete "${deleteLabel}"? This cannot be undone.`}

              {deleteType === 'comment' &&
                'Delete this comment? This cannot be undone.'}
            </p>

            <div className="admin-modal__actions">

              <button
                className="admin-modal__cancel"
                onClick={closeModal}
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

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

    </div>
  );
}