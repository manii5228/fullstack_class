import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { getUser } from '../services/authService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BookingHistory.css';

const categoryColors = { Workshop: '#6C63FF', Seminar: '#00A8A8', Cultural: '#E91E8C', default: '#FF7A59' };

const BookingHistory = () => {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="page-enter">
      <Navbar />
      <main className="history-main">
        <div className="history-header">
          <div>
            <h1 className="section-title">🎫 My Bookings</h1>
            <p className="section-subtitle">All your event bookings in one place</p>
          </div>
          <Link to="/" className="btn btn-primary btn-sm" id="explore-more-btn">🔍 Explore Events</Link>
        </div>

        {/* Stats row */}
        <div className="history-stats">
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(108,99,255,0.1)' }}>🎫</div><div className="stat-value">{bookings.length}</div><div className="stat-label">Total Bookings</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>✅</div><div className="stat-value">{confirmedCount}</div><div className="stat-label">Confirmed</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(0,168,168,0.1)' }}>💰</div><div className="stat-value">₹{totalSpent.toFixed(0)}</div><div className="stat-label">Total Spent</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(255,122,89,0.1)' }}>🏫</div><div className="stat-value">{user?.department?.split(' ')[0] || 'N/A'}</div><div className="stat-label">Department</div></div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : bookings.length === 0 ? (
          <div className="empty-state card" style={{ marginTop: 24 }}>
            <div className="empty-icon">🎪</div>
            <h3>No Bookings Yet</h3>
            <p>Explore and book your first event!</p>
            <Link to="/" className="btn btn-primary mt-2" id="go-explore-btn">Explore Events</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => (
              <div key={b.booking_id} className={`booking-item card ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
                <div className="booking-item-color" style={{ background: categoryColors[b.category] || categoryColors.default }} />
                <div className="booking-item-content">
                  <div className="booking-item-left">
                    <div className="booking-event-name">{b.title}</div>
                    <div className="booking-event-meta">
                      <span>📅 {formatDate(b.event_date)}</span>
                      <span>🕐 {formatTime(b.event_time)}</span>
                      <span>📍 {b.venue}</span>
                      <span>🏫 {b.department}</span>
                    </div>
                  </div>
                  <div className="booking-item-right">
                    <div className="booking-info-row"><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}</span></div>
                    <div className="booking-info-row"><span className="info-label">Booking ID</span><strong>#{b.booking_id}</strong></div>
                    <div className="booking-info-row"><span className="info-label">Tickets</span><strong>{b.ticket_count}</strong></div>
                    <div className="booking-info-row"><span className="info-label">Total Paid</span><strong className="paid-amount">{parseFloat(b.total_price) > 0 ? `₹${b.total_price}` : 'FREE'}</strong></div>
                    <div className="booking-item-actions">
                      <Link to={`/events/${b.event_id}`} className="btn btn-outline btn-sm" id={`view-event-${b.booking_id}`}>View Event</Link>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.booking_id)} disabled={cancelling === b.booking_id} id={`cancel-booking-${b.booking_id}`}>
                          {cancelling === b.booking_id ? '⏳' : '❌ Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="booking-date-badge">{formatDate(b.booking_date)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
