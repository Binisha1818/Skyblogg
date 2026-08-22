import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RichTextEditor from '../components/RichTextEditor';
import './WritePost.css'; // Reusing your Notion layout styles


export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published'); // Track status (draft vs published)
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${id}`)
      .then(res => {
        setTitle(res.data.post.title || '');
        setContent(res.data.post.content || '');
        setCurrentImage(res.data.post.image || null);
        setStatus(res.data.post.status || 'published'); // Load existing status
      })
      .catch(() => setError('Post not found'))
      .finally(() => setFetching(false));
  }, [id]);


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

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('status', status); // Send updated status to server
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };


  if (fetching) {
    return (
      <main className="editor-wrapper">
        <p style={{ padding: '40px', color: '#787774' }}>Loading editor...</p>
      </main>
    );
  }

  
  return (
    <main className="editor-wrapper">
      <div className="write-editor">
        {error && <p className="write-error">{error}</p>}

        <form onSubmit={handleSubmit} className="write-form">
          {/* Main Title Input */}
          <input
            type="text"
            placeholder="Untitled Post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="write-title-input"
          />

          {/* Main Content Area */}
          <RichTextEditor
          content={content}
    onChange={setContent}
            className="write-content-input"
          />

          {/* Right Sidebar Toolbar */}
          <div className="write-toolbar">
            {/* Cover Image Upload */}
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? image.name : currentImage ? 'Change cover image' : '+ Add cover image'}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-file-input"
            />

            {/* Image Preview Block */}
            {(preview || currentImage) && (
              <div className="preview-container">
                <img
                  src={preview || `http://localhost:5000${currentImage}`}
                  alt="Cover Preview"
                  className="preview-image"
                />
                {preview && (
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                    }}
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            )}

            {/* Status Segmented Control */}
            <div className="write-status-toggle">
              <label className={status === 'published' ? 'status-option status-option--active' : 'status-option'}>
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Published
              </label>
              <label className={status === 'draft' ? 'status-option status-option--active' : 'status-option'}>
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Draft
              </label>
            </div>

            {/* Dynamic Action Button */}
            <button type="submit" disabled={loading} className="publish-btn">
              {loading
                ? 'Saving...'
                : status === 'draft'
                  ? 'Update Draft'
                  : 'Publish Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}