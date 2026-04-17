import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CapacityIndicator from '../components/CapacityIndicator';
import { getEvent } from '../services/eventService';
import { createBooking } from '../services/bookingService';
import { getUser } from '../services/authService';
import { toast } from 'react-toastify';
import './BookingPage.css';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', department: user?.department || '', ticket_count: 1 });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getEvent(id);
        setEvent(res.data.event);
      } catch {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.department) e.department = 'Department is required';
    if (!form.ticket_count || form.ticket_count < 1) e.ticket_count = 'Must book at least 1 ticket';
    if (event && form.ticket_count > event.available_tickets) e.ticket_count = `Only ${event.available_tickets} tickets available`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await createBooking({ event_id: parseInt(id), ticket_count: parseInt(form.ticket_count) });
      setConfirmed(res.data);
      toast.success('🎉 Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div><Navbar /><div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div></div>;
  if (!event) return null;

  const total = parseFloat(event.price) * parseInt(form.ticket_count || 0);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  if (confirmed) {
    return (
      <div className="page-enter">
        <Navbar />
        <div className="booking-confirmed-wrap">
          <div className="booking-confirmed-card card">
            <div className="confirmed-icon">🎉</div>
            <h1 className="confirmed-title">Booking Confirmed!</h1>
            <p className="confirmed-subtitle">A confirmation email has been sent to {user?.email}</p>

            <div className="booking-receipt">
              <div className="receipt-header">
                <span>🎫 Booking Receipt</span>
                <span className="badge badge-green">✅ Confirmed</span>
              </div>
              <div className="receipt-row"><span>Booking ID</span><strong>#{confirmed.booking?.booking_id}</strong></div>
              <div className="receipt-row"><span>Event</span><strong>{event.title}</strong></div>
              <div className="receipt-row"><span>Date & Time</span><strong>{formatDate(event.event_date)} · {formatTime(event.event_time)}</strong></div>
              <div className="receipt-row"><span>Venue</span><strong>{event.venue}</strong></div>
              <div className="receipt-row"><span>Tickets</span><strong>{confirmed.booking?.ticket_count}</strong></div>
              <div className="receipt-row total"><span>Total Paid</span><strong>₹{confirmed.booking?.total_price || 0}</strong></div>
              <div className="receipt-row"><span>Remaining Seats</span><strong>{confirmed.remaining_tickets} left</strong></div>
            </div>

            <div className="confirmed-actions">
              <Link to="/bookings" className="btn btn-primary" id="view-bookings-btn">📋 View My Bookings</Link>
              <Link to="/" className="btn btn-outline" id="back-home-confirmed-btn">🏠 Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <Navbar />
      <main className="booking-main">
        <div className="breadcrumb-sm">
          <Link to="/">Home</Link> › <Link to={`/events/${id}`}>{event.title?.substring(0,30)}</Link> › Book
        </div>

        <div className="booking-grid">
          {/* Form */}
          <div className="booking-form-wrap">
            <div className="card">
              <h2 style={{ fontFamily: 'Poppins', marginBottom: 8 }}>🎫 Complete Your Booking</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Fill in your details to confirm your booking</p>

              <form onSubmit={handleSubmit} id="booking-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input id="booking-name" type="text" className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" />
                  {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input id="booking-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
                  {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input id="booking-dept" type="text" className={`form-input ${errors.department ? 'error' : ''}`} value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Your department" />
                  {errors.department && <div className="form-error">⚠️ {errors.department}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Tickets</label>
                  <div className="ticket-counter">
                    <button type="button" className="btn btn-outline btn-sm ticket-btn" onClick={() => setForm({...form, ticket_count: Math.max(1, (form.ticket_count || 1) - 1)})} id="ticket-minus-btn">−</button>
                    <input id="booking-tickets" type="number" className={`form-input ticket-input ${errors.ticket_count ? 'error' : ''}`} value={form.ticket_count} min={1} max={event.available_tickets} onChange={e => setForm({...form, ticket_count: parseInt(e.target.value) || 1})} />
                    <button type="button" className="btn btn-outline btn-sm ticket-btn" onClick={() => setForm({...form, ticket_count: Math.min(event.available_tickets, (form.ticket_count || 1) + 1)})} id="ticket-plus-btn">+</button>
                  </div>
                  {errors.ticket_count && <div className="form-error">⚠️ {errors.ticket_count}</div>}
                </div>

                {/* Progress indicator */}
                <div className="booking-progress">
                  <div className="progress-step complete"><span>1</span> Event Selected</div>
                  <div className="progress-line"></div>
                  <div className="progress-step active"><span>2</span> Fill Details</div>
                  <div className="progress-line"></div>
                  <div className="progress-step"><span>3</span> Confirm</div>
                </div>

                <button type="submit" className="btn btn-primary w-full btn-lg mt-2" disabled={submitting || event.available_tickets === 0} id="confirm-booking-btn">
                  {submitting ? '⏳ Processing...' : `✅ Confirm Booking — ₹${isNaN(total) ? 0 : total}`}
                </button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="booking-summary-wrap">
            <div className="card booking-summary">
              <h3 style={{ fontFamily: 'Poppins', marginBottom: 16 }}>📝 Order Summary</h3>
              <div className="summary-event-title">{event.title}</div>
              <div className="summary-dept">{event.department} · {event.category}</div>

              <div className="divider" />
              <CapacityIndicator available={event.available_tickets} total={event.total_tickets} />
              <div className="divider" />

              <div className="summary-rows">
                <div className="summary-row"><span>📅 Date</span><span>{formatDate(event.event_date)}</span></div>
                <div className="summary-row"><span>🕐 Time</span><span>{formatTime(event.event_time)}</span></div>
                <div className="summary-row"><span>📍 Venue</span><span>{event.venue}</span></div>
                <div className="summary-row"><span>🎫 Tickets</span><span>{form.ticket_count || 1}</span></div>
                <div className="summary-row"><span>💰 Price/ticket</span><span>{parseFloat(event.price) > 0 ? `₹${event.price}` : 'FREE'}</span></div>
              </div>

              <div className="divider" />
              <div className="summary-total">
                <span>Total Amount</span>
                <span className="total-amount">{parseFloat(event.price) > 0 ? `₹${isNaN(total) ? 0 : total}` : 'FREE'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
