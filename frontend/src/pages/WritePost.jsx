import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WritePost.css';
import RichTextEditor from '../components/RichTextEditor';

const CATEGORIES = [
  { key: "aviation_news", label: "Aviation News" },
  { key: "airlines", label: "Airlines" },
  { key: "aircraft", label: "Aircraft" },
  { key: "airports", label: "Airports" },
  { key: "travel", label: "Travel" },
  { key: "careers", label: "Careers" },
  { key: "opinion", label: "Opinion" },
];

export default function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('published');
  const [category, setCategory] = useState('aviation_news');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);
    formData.append('status', status);
    formData.append('category', category);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="editor-wrapper">
      <div className="write-editor">
           <h2 className="write-heading">Write a New Post</h2>
        <form onSubmit={handleSubmit} className="write-form">
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="write-title-input"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="write-category-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>

        {error && <p className="write-error">{error}</p>}
         <RichTextEditor
            placeholder="Write your post..."
            
            onChange={(e) => setContent(e.target.value)}
  
            className="write-content-input"
          />



          <div className="write-toolbar">
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? image.name : 'Choose image'}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-file-input"
            />

            <div className="write-status-toggle">
              <label className={status === 'published' ? 'status-option status-option--active' : 'status-option'}>
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Publish now
              </label>
              <label className={status === 'draft' ? 'status-option status-option--active' : 'status-option'}>
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Save as draft
              </label>
            </div>

            <button type="submit" disabled={loading} className="publish-btn">
              {loading ? 'Saving...' : status === 'draft' ? 'Save Draft' : 'Publish'}
            </button>
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
              >
                Remove image
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}