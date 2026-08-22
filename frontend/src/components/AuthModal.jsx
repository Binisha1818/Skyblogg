import './AuthModal.css';

export default function AuthModal({
  children,
  onClose
}) {
  return (
    <div
      className="auth-overlay"
      onClick={onClose}
    >
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-close"
          onClick={onClose}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}