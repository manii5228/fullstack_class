import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getMyBookings } from '../services/bookingService';
import { getUser } from '../services/authService';
import { Link } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings().then(res => setBookings(res.data.bookings || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const upcoming = confirmed.filter(b => new Date(b.event_date) >= new Date());
  const totalSpent = confirmed.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="page-enter">
      <Navbar />
      <main className="dashboard-main">
        {/* Welcome Hero */}
        <div className="user-welcome-card card card-gradient-1">
          <div className="welcome-content">
            <div className="welcome-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="welcome-title">Hey, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="welcome-sub">{user?.department} · {user?.role}</p>
            </div>
          </div>
          <div className="welcome-actions">
            <Link to="/" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} id="explore-events-dash-btn">
              🔍 Explore Events
            </Link>
            <Link to="/bookings" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--accent-2)' }} id="my-bookings-dash-btn">
              🎫 My Bookings
            </Link>
          </div>
        </div>

        {/* Bento Grid Dashboard */}
        <div className="user-bento-grid">
          {/* Stats */}
          <div className="card ub-stat-card col-3">
            <div className="ub-stat-icon" style={{ background: 'rgba(108,99,255,0.1)' }}>🎫</div>
            <div className="ub-stat-val">{confirmed.length}</div>
            <div className="ub-stat-label">Total Bookings</div>
          </div>
          <div className="card ub-stat-card col-3">
            <div className="ub-stat-icon" style={{ background: 'rgba(0,168,168,0.1)' }}>📅</div>
            <div className="ub-stat-val">{upcoming.length}</div>
            <div className="ub-stat-label">Upcoming Events</div>
          </div>
          <div className="card ub-stat-card col-3">
            <div className="ub-stat-icon" style={{ background: 'rgba(255,122,89,0.1)' }}>💰</div>
            <div className="ub-stat-val">₹{totalSpent.toFixed(0)}</div>
            <div className="ub-stat-label">Total Spent</div>
          </div>
          <div className="card ub-stat-card col-3">
            <div className="ub-stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>🏆</div>
            <div className="ub-stat-val">{bookings.length}</div>
            <div className="ub-stat-label">All Bookings</div>
          </div>

          {/* Upcoming events card */}
          <div className="card col-6 upcoming-card">
            <h3 className="ub-card-title">📅 Upcoming Events</h3>
            {loading ? <div className="spinner" /> : upcoming.length === 0 ? (
              <div className="ub-empty">
                <span>📭</span><p>No upcoming events. <Link to="/">Explore →</Link></p>
              </div>
            ) : (
              <div className="upcoming-list">
                {upcoming.slice(0, 4).map(b => (
                  <Link key={b.booking_id} to={`/events/${b.event_id}`} className="upcoming-row" id={`upcoming-${b.booking_id}`}>
                    <div className="upcoming-color-dot" style={{ background: b.category === 'Workshop' ? '#6C63FF' : b.category === 'Cultural' ? '#E91E8C' : '#00A8A8' }} />
                    <div className="upcoming-info">
                      <div className="upcoming-name">{b.title}</div>
                      <div className="upcoming-meta">{formatDate(b.event_date)} · {b.venue}</div>
                    </div>
                    <div className="upcoming-tickets">{b.ticket_count} 🎫</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings card */}
          <div className="card col-6 recent-card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3 className="ub-card-title" style={{ margin: 0 }}>🕐 Recent Activity</h3>
              <Link to="/bookings" className="btn btn-outline btn-sm" id="view-all-bookings-btn">View All</Link>
            </div>
            {loading ? <div className="spinner" /> : bookings.length === 0 ? (
              <div className="ub-empty"><span>📭</span><p>No bookings yet.</p></div>
            ) : (
              <div className="recent-list">
                {bookings.slice(0, 5).map(b => (
                  <div key={b.booking_id} className="recent-row">
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`} style={{ minWidth: 80 }}>
                      {b.status === 'confirmed' ? '✅' : '❌'} {b.status}
                    </span>
                    <span className="recent-name">{b.title?.substring(0,30)}</span>
                    <span className="recent-date">{formatDate(b.booking_date)}</span>
                    <span className="recent-amount">{parseFloat(b.total_price) > 0 ? `₹${b.total_price}` : 'FREE'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card col-12 quick-links-card">
            <h3 className="ub-card-title">⚡ Quick Actions</h3>
            <div className="quick-links-grid">
              <Link to="/" className="quick-link" id="ql-explore"><span>🔍</span><span>Explore Events</span></Link>
              <Link to="/bookings" className="quick-link" id="ql-bookings"><span>🎫</span><span>My Bookings</span></Link>
              <Link to="/" className="quick-link" id="ql-trending"><span>🔥</span><span>Trending Now</span></Link>
              <Link to="/" className="quick-link" id="ql-free"><span>🎁</span><span>Free Events</span></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
