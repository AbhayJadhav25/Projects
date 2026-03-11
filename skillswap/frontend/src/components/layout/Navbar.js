import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import { BASE_URL } from '../../utils/api';
const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/skill-exchange', label: 'Skill Exchange' },
    { to: '/community', label: 'Community' },
    { to: '/resources', label: 'Resources' },
    { to: '/learning-hub', label: 'Learning Hub' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="gradient-text">SkillSwap</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <Link to="/profile" className="user-avatar-btn">
            {user?.profilePhoto ? (
              <img
                src={`${BASE_URL}/${user.profilePhoto}`}
                alt={user.name}
                className="avatar"
                style={{ width: 36, height: 36 }}
              />
            ) : (
              <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span className="user-name">{user?.name || 'Profile'}</span>
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
