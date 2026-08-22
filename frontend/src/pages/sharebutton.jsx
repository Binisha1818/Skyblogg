import { useState } from "react";
import { Send, Check } from "lucide-react";
import {  Link2, X } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaXTwitter, FaTelegram, FaEnvelope } from "react-icons/fa6";
import './share.css';

export default function ShareButton({ postId, postTitle }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/post/${postId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(postTitle || "");

  const openSheet = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const closeSheet = () => setOpen(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleNativeShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: postTitle, url: shareUrl });
        setOpen(false);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed:", err);
      }
    }
  };

  const openExternal = (e, url) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    setOpen(false);
  };

  const shareOptions = [
    {
      label: "Copy link",
      icon: copied ? <Check size={22} /> : <Link2 size={22} />,
      bg: "#f0f0f0",
      color: "#111",
      onClick: handleCopy,
    },
    {
      label: "WhatsApp",
      icon: <FaWhatsapp size={22} />,
      bg: "#25D366",
      color: "#fff",
      onClick: (e) =>
        openExternal(e, `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      label: "Facebook",
      icon: <FaFacebook size={22} />,
      bg: "#1877F2",
      color: "#fff",
      onClick: (e) =>
        openExternal(e, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      label: "X",
      icon: <FaXTwitter size={22} />,
      bg: "#000",
      color: "#fff",
      onClick: (e) =>
        openExternal(e, `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`),
    },
    {
      label: "Telegram",
      icon: <FaTelegram size={22} />,
      bg: "#26A5E4",
      color: "#fff",
      onClick: (e) =>
        openExternal(e, `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      label: "Email",
      icon: <FaEnvelope size={22} />,
      bg: "#6b7280",
      color: "#fff",
      onClick: (e) =>
        openExternal(e, `mailto:?subject=${encodedTitle}&body=${encodedUrl}`),
    },
  ];

  return (
    <>
      <button className="action-btn share" onClick={openSheet}>
     <Send size={18} />
      </button>

      {open && (
        <div className="share-sheet-overlay" onClick={closeSheet}>
          <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="share-sheet-header">
              <span>Share post</span>
              <button className="share-sheet-close" onClick={closeSheet}>
                <X size={20} />
              </button>
            </div>

            <div className="share-sheet-grid">
              {shareOptions.map((opt) => (
                <button key={opt.label} className="share-sheet-option" onClick={opt.onClick}>
                  <span
                    className="share-sheet-icon"
                    style={{ backgroundColor: opt.bg, color: opt.color }}
                  >
                    {opt.icon}
                  </span>
                  <span className="share-sheet-label">{opt.label}</span>
                </button>
              ))}
            </div>

            {navigator.share && (
              <button className="share-sheet-more" onClick={handleNativeShare}>
                More options
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}