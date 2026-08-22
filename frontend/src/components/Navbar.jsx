import { useState, useRef, useEffect } from 'react';
import skylogo from "../assets/skylogo.png";
import { Link, useNavigate } from 'react-router-dom';
import {
  PenSquare,
  LogIn,
  UserPlus,
  Search,
  LogOut
} from 'lucide-react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthModal from '../components/AuthModal';
import NotificationBell from "../components/NotificationBell";
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ search, setSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState('login');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/blog');
  };

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : '?';

  return (
    <>
      <nav className="navbar">
       <Link to="/blog" className="navbar__logo">
    <img src={skylogo} alt="SkyBlog" />
    
  </Link>

        {/* Search */}
        <div className="navbar__search">
          <Search size={15} className="navbar__search-icon" />

          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="navbar__search-input"
          />
        </div>

        <div className="navbar__links">
          {user ? (
            <>
              {/* Logged In */}
              <Link
                to="/write"
                className="navbar__icon-link"
                title="Write a post"
              >
                <PenSquare size={20} />
              </Link>

              <NotificationBell />

              <div
                className="navbar__avatar-wrapper"
                ref={menuRef}
              >
                <button
                  className="navbar__avatar"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {initial}
                </button>

                {menuOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__avatar navbar__avatar--small">
                        {initial}
                      </div>

                      <div>
                        <div className="navbar__dropdown-name">
                          {user.name}
                        </div>

                        <Link
                          to="/dashboard"
                          className="navbar__dropdown-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="navbar__dropdown-link"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}

                    <div className="navbar__dropdown-divider" />

                    <button
                      className="navbar__dropdown-item"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Write Button -> Opens Login Modal */}
              <button
                className="navbar__icon-link navbar__button"
                title="Write a post"
                onClick={() => {
                  setMode('login');
                  setShowAuth(true);
                }}
              >
                <PenSquare size={20} />
              </button>

              {/* Login */}
              <button
                className="navbar__link navbar__button"
                onClick={() => {
                  setMode('login');
                  setShowAuth(true);
                }}
              >
                <LogIn size={18} />
              
              </button>

              {/* Register */}
              <button
                className="navbar__link navbar__button"
                onClick={() => {
                  setMode('register');
                  setShowAuth(true);
                }}
              >
                <UserPlus size={18} />
              
              </button>
            </>
          )}
        </div>
      </nav>
{showAuth && (
  <AuthModal onClose={() => setShowAuth(false)}>
    {mode === "login" ? (
      <Login
        onSuccess={() => setShowAuth(false)}
        onSwitchMode={setMode}
      />
    ) : (
      <Register
        onSuccess={() => setShowAuth(false)}
        onSwitchMode={setMode}
      />
    )}
  </AuthModal>
)}
    </>
  );
}