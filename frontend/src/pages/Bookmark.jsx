import { Link } from "react-router-dom";
import axios from "axios";
import './Bookmark.css';
import { Bookmark } from "lucide-react";

export default function Bookmarks({ posts, setPosts }) {
const removeBookmark = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/bookmarks/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
};
  return (
    <div className="bookmarks-list">
      {posts?.map((post) => (
        <div className="bookmark-card" key={post.id}>
          <Link to={`/blog/${post.id}`}>
            <img
              src={`http://localhost:5000${post.image}`}
              alt={post.title}
              className="bookmark-image"
            />
          </Link>

          <div className="bookmark-actions">
            <Link to={`/blog/${post.id}`} className="bookmark-read-btn">
              Readmore..
            </Link>
<button
  className="bookmark-toggle-btn"
  onClick={() => removeBookmark(post.id)}
  title="Remove bookmark"
>
  <Bookmark size={18} fill="#111" color="#111" />
  
</button>
          </div>
        </div>
      ))}
    </div>
  );
}
