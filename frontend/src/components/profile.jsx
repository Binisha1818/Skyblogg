import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed
import './profile.css';

const Profile = ({ onEditPost, onDeletePost }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('my-posts');
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts created by the user & posts liked by the user
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Replace with your actual API calls
        const postsRes = await fetch(`/api/posts/user/${user?.id}`);
        const postsData = await postsRes.json();
        setUserPosts(postsData);

        const likedRes = await fetch(`/api/posts/liked/${user?.id}`);
        const likedData = await likedRes.json();
        setLikedPosts(likedData);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);

  const displayedPosts = activeTab === 'my-posts' ? userPosts : likedPosts;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.name || 'User Profile'}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-posts')}
        >
          My Posts ({userPosts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'liked-posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked-posts')}
        >
          Liked Posts ({likedPosts.length})
        </button>
      </div>

      {/* Content Feed */}
      <div className="profile-feed">
        {loading ? (
          <p className="profile-empty">Loading posts...</p>
        ) : displayedPosts.length === 0 ? (
          <p className="profile-empty">
            {activeTab === 'my-posts' 
              ? "You haven't published any posts yet." 
              : "You haven't liked any posts yet."}
          </p>
        ) : (
          displayedPosts.map((post) => (
            <article key={post._id || post.id} className="profile-post-card">
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="profile-post-image" 
                />
              )}
              <div className="profile-post-content">
                <h2 className="profile-post-title">{post.title}</h2>
                <p className="profile-post-meta">
                  By {post.authorName || user?.name} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <p className="profile-post-excerpt">{post.content}</p>

                {/* Management controls only show in 'My Posts' */}
                {activeTab === 'my-posts' && (
                  <div className="profile-post-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => onEditPost(post)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => onDeletePost(post._id || post.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;