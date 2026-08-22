import { useState, useEffect } from "react";
import { Menu, X, Send, FileText, Bookmark as BookmarkIcon } from "lucide-react";
import "./DashboardLayout.css";

export default function DashboardLayout({
  publishedContent,
  draftsContent,
  bookmarksContent,
}) {
  const [activeTab, setActiveTab] = useState("published");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  // Prevent background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case "published":
        return publishedContent;
      case "drafts":
        return draftsContent;
      case "bookmarks":
        return bookmarksContent;
      default:
        return publishedContent;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Header with Hamburger Icon */}
      <div className="dashboard-mobile-header">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle Dashboard Navigation"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="mobile-dashboard-title">Dashboard</span>
      </div>

      {/* Overlay Backdrop to close sidebar on click-outside */}
      <div
        className={`dashboard-sidebar-overlay ${
          isMobileOpen ? "is-visible" : ""
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Responsive Sidebar */}
      <aside className={`dashboard-sidebar ${isMobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-header">
          <h2>Dashboard</h2>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === "published" ? "active" : ""}
            onClick={() => handleTabChange("published")}
          >
            <Send size={18} />
            <span>Published Posts</span>
          </button>

          <button
            className={activeTab === "drafts" ? "active" : ""}
            onClick={() => handleTabChange("drafts")}
          >
            <FileText size={18} />
            <span>Drafts</span>
          </button>

          <button
            className={activeTab === "bookmarks" ? "active" : ""}
            onClick={() => handleTabChange("bookmarks")}
          >
            <BookmarkIcon size={18} />
            <span>Saved Bookmarks</span>
          </button>
        </nav>
      </aside>

      {/* Main Content View */}
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  );
}