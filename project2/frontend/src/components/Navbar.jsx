import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUser } from '../services/authService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [{ to: '/admin', label: '📊 Dashboard' }, { to: '/admin/events', label: '🗂️ Manage Events' }]
    : [
        { to: '/', label: '🏠 Home' },
        { to: '/dashboard', label: '📋 My Dashboard' },
        { to: '/bookings', label: '🎫 My Bookings' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/'} className="navbar-brand">
          <span className="brand-icon">🎪</span>
          <span className="brand-text">EventBook</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
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

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name?.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} id="hamburger-btn">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
