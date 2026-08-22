import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import CommentSheet from "../components/CommentSheet";
import "./BlogList.css";
import ShareButton from "./sharebutton";

const CONTENT_CHAR_LIMIT = 150;

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "aviation_news", label: "Aviation News" },
  { key: "airlines", label: "Airlines" },
  { key: "aircraft", label: "Aircraft" },
  { key: "airports", label: "Airports" },
  { key: "travel", label: "Travel" },
  { key: "careers", label: "Careers" },
  { key: "opinion", label: "Opinion" },
];

const API_URL = "https://sky-dlae.onrender.com";

function timeAgo(date) {
  const seconds = Math.floor(
    (new Date() - new Date(date)) / 1000
  );

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

export default function BlogList({ search }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

  // ================================
  // LOAD POSTS
  // ================================
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const params = new URLSearchParams();

        if (search) {
          params.append("search", search);
        }

        if (activeCategory !== "all") {
          params.append("category", activeCategory);
        }

        const res = await axios.get(
          `${API_URL}/api/posts?${params.toString()}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        setPosts(res.data.posts);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [search, activeCategory]);

  // ================================
  // BOOKMARK
  // ================================
  const toggleBookmark = async (postId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to bookmark posts");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/bookmarks/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_bookmarked: res.data.bookmarked,
              }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update bookmark");
    }
  };

  // ================================
  // LIKE
  // ================================
  const handleLikeToggle = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to like posts");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/likes/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_liked: res.data.liked,
                like_count: res.data.likeCount,
              }
            : post
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update like");
    }
  };

  // ================================
  // READ MORE
  // ================================
  const toggleExpand = (postId, e) => {
    e.preventDefault();
    e.stopPropagation();

    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // ================================
  // RENDER
  // ================================
  return (
    <div className="blog-list-container">

      {/* ================================
          CATEGORIES
      ================================= */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`category-pill ${
              activeCategory === cat.key
                ? "category-pill--active"
                : ""
            }`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ================================
          POSTS
      ================================= */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {posts.length === 0 ? (
            <div className="empty-state">
              {search ? (
                <>
                  <h2>No posts found</h2>

                  <p>
                    We couldn't find any aviation posts
                    matching{" "}
                    <strong>"{search}"</strong>.
                  </p>
                </>
              ) : (
                <>
                  <h2>No posts yet</h2>

                  <p>
                    Be the first person to share an
                    aviation story.
                  </p>
                </>
              )}
            </div>
          ) : (
            posts.map((post) => {
              const isExpanded =
                !!expandedPosts[post.id];

              const plainText = post.content
                .replace(/<[^>]*>/g, "");

              const isLong =
                plainText.length > CONTENT_CHAR_LIMIT;

              const displayContent =
                isExpanded || !isLong
                  ? plainText
                  : plainText.slice(
                      0,
                      CONTENT_CHAR_LIMIT
                    ) + "...";

              return (
                <Link
                  to={`/blog/${post.id}`}
                  key={post.id}
                  className="post-item-link"
                >
                  <div className="post-item">

                    {/* ================================
                        POST IMAGE
                    ================================= */}
                    {post.image && (
                      <img
                        src={`${API_URL}${post.image}`}
                        alt={post.title}
                        className="post-image"
                      />
                    )}

                    {/* ================================
                        TITLE
                    ================================= */}
                    <h2 className="post-title">
                      {post.title}
                    </h2>

                    {/* ================================
                        CONTENT
                    ================================= */}
                    <p className="post-content">
                      {displayContent}

                      {isLong && (
                        <button
                          className="read-more-btn"
                          onClick={(e) =>
                            toggleExpand(post.id, e)
                          }
                        >
                          {isExpanded
                            ? " Show less"
                            : " Read more"}
                        </button>
                      )}
                    </p>

                    {/* ================================
                        AUTHOR
                    ================================= */}
                    <p className="post-author">
                      By {post.author_name} •{" "}
                      {timeAgo(post.created_at)}
                    </p>

                    {/* ================================
                        ACTIONS
                    ================================= */}
                    <div className="post-actions">

                      <div className="left-actions">

                        {/* LIKE */}
                        <button
                          className="action-btn"
                          onClick={(e) =>
                            handleLikeToggle(
                              post.id,
                              e
                            )
                          }
                        >
                          <Heart
                            size={18}
                            fill={
                              post.user_liked
                                ? "#e33"
                                : "none"
                            }
                            color={
                              post.user_liked
                                ? "#e33"
                                : "#666"
                            }
                          />

                          {post.like_count}
                        </button>

                        {/* COMMENT */}
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            setActiveCommentPostId(
                              post.id
                            );
                          }}
                        >
                          <MessageCircle size={18} />

                          {post.comment_count ?? 0}
                        </button>

                      </div>

                      {/* SHARE */}
                      <ShareButton
                        postId={post.id}
                        postTitle={post.title}
                      />

                      {/* BOOKMARK */}
                      <button
                        className="action-btn bookmark"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          toggleBookmark(post.id);
                        }}
                      >
                        <Bookmark
                          size={18}
                          fill={
                            post.user_bookmarked
                              ? "#111"
                              : "none"
                          }
                          color={
                            post.user_bookmarked
                              ? "#111"
                              : "#666"
                          }
                        />
                      </button>

                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </>
      )}

      {/* ================================
          COMMENT SHEET
      ================================= */}
      {activeCommentPostId && (
        <CommentSheet
          postId={activeCommentPostId}
          onClose={() =>
            setActiveCommentPostId(null)
          }
        />
      )}

    </div>
  );
}
