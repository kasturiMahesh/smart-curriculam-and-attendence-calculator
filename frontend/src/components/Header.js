import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">LQ</div>
          <span>LearnQuest AI</span>
        </Link>

        <nav className="nav">
          {user && (
            <>
              <ul className="nav-links">
                <li>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/create-path" className={`nav-link ${isActive('/create-path')}`}>
                    Create Path
                  </Link>
                </li>
                {user.role === 'teacher' && (
                  <li>
                    <Link to="/students" className={`nav-link ${isActive('/students')}`}>
                      Students
                    </Link>
                  </li>
                )}
              </ul>

              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.name || user.email}</span>
                  <span className="text-sm">({user.role})</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </>
          )}

          {!user && (
            <div className="nav-links">
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                Login
              </Link>
              <Link to="/register" className={`nav-link ${isActive('/register')}`}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;