import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CapacityIndicator from '../components/CapacityIndicator';
import { getEvent } from '../services/eventService';
import { createBooking } from '../services/bookingService';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';
import { getUser } from '../services/authService';
import { toast } from 'react-toastify';
import './BookingPage.css';

const DEPARTMENTS = [
  'Computer Science', 'Information Science', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Biotechnology', 'Chemical Engineering', 'Aerospace Engineering',
  'Management', 'Arts & Culture', 'Mathematics', 'Physics', 'Chemistry', 'Other'
];

const emptyAttendee = (user, index) => ({
  name: index === 0 ? (user?.name || '') : '',
  email: index === 0 ? (user?.email || '') : '',
  department: index === 0 ? (user?.department || '') : '',
  vtu_number: index === 0 ? (user?.vtu_number || '') : '',
  phone: '',
});

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [attendees, setAttendees] = useState([emptyAttendee(user, 0)]);
  const [errors, setErrors] = useState([]);

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

  // Sync attendees array length when ticketCount changes
  useEffect(() => {
    setAttendees(prev => {
      const next = [...prev];
      while (next.length < ticketCount) next.push(emptyAttendee(null, next.length));
      return next.slice(0, ticketCount);
    });
    setErrors([]);
  }, [ticketCount]);

  const handleTicketChange = (delta) => {
    if (!event) return;
    setTicketCount(c => Math.min(event.available_tickets, Math.max(1, c + delta)));
  };

  const handleAttendeeChange = (index, field, value) => {
    setAttendees(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validate = () => {
    const errs = attendees.map((a, i) => {
      const e = {};
      if (!a.name?.trim()) e.name = 'Name is required';
      if (!a.email || !/\S+@\S+\.\S+/.test(a.email)) e.email = 'Valid email required';
      if (!a.department) e.department = 'Department is required';
      return e;
    });
    setErrors(errs);
    return errs.every(e => Object.keys(e).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);

    const unitPrice = parseFloat(event.price);
    const isPaid = unitPrice > 0;

    try {
      if (isPaid) {
        // Razorpay flow
        const orderRes = await createPaymentOrder({ event_id: parseInt(id), ticket_count: ticketCount, attendees });
        const { order_id, amount, currency, key_id, event_title } = orderRes.data;

        // Load Razorpay SDK
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve; script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const rzp = new window.Razorpay({
          key: key_id,
          amount,
          currency,
          name: 'Campus Cultural',
          description: event_title,
          order_id,
          prefill: { name: attendees[0]?.name, email: attendees[0]?.email, contact: attendees[0]?.phone || '' },
          theme: { color: '#3C0908' },
          handler: async (response) => {
            try {
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setConfirmed(verifyRes.data);
              toast.success('🎉 Payment successful! Booking confirmed!');
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
            } finally {
              setSubmitting(false);
            }
          },
          modal: { ondismiss: () => { setSubmitting(false); toast.info('Payment cancelled'); } },
        });
        rzp.open();
      } else {
        // Free event — direct booking
        const res = await createBooking({ event_id: parseInt(id), ticket_count: ticketCount, attendees });
        setConfirmed(res.data);
        toast.success('🎉 Booking confirmed!');
        setSubmitting(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  if (loading) return <div><Navbar /><div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div></div>;
  if (!event) return null;

  const unitPrice = parseFloat(event.price);
  const total = unitPrice * ticketCount;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  if (confirmed) {
    return (
      <div className="page-enter">
        <Navbar />
        <div className="booking-confirmed-wrap">
          <div className="booking-confirmed-card card bg-white">
            <div className="confirmed-icon">🎉</div>
            <h1 className="confirmed-title">Booking Confirmed!</h1>
            <p className="confirmed-subtitle">Confirmation details for {ticketCount} ticket{ticketCount > 1 ? 's' : ''}</p>

            <div className="booking-receipt">
              <div className="receipt-header">
                <span>🎫 Booking Receipt</span>
                <span className="confirmed-badge">✅ Confirmed</span>
              </div>
              <div className="receipt-row"><span>Booking ID</span><strong>#{confirmed.booking?.booking_id}</strong></div>
              <div className="receipt-row"><span>Event</span><strong>{event.title}</strong></div>
              <div className="receipt-row"><span>Date &amp; Time</span><strong>{formatDate(event.event_date)} · {formatTime(event.event_time)}</strong></div>
              <div className="receipt-row"><span>Venue</span><strong>{event.venue}</strong></div>
              <div className="receipt-row"><span>Tickets</span><strong>{confirmed.booking?.ticket_count}</strong></div>
              <div className="receipt-row total"><span>Total Paid</span><strong>₹{confirmed.booking?.total_price || 0}</strong></div>
              <div className="receipt-row"><span>Remaining Seats</span><strong>{confirmed.remaining_tickets} left</strong></div>
            </div>

            <div className="confirmed-actions">
              <Link to="/bookings" className="btn btn-dark" id="view-bookings-btn">📋 View My Bookings</Link>
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
          <Link to="/">Home</Link> › <Link to={`/events/${id}`}>{event.title?.substring(0, 30)}</Link> › Book
        </div>

        <div className="booking-grid">
          {/* Form Side */}
          <div className="booking-form-wrap">
            {/* Ticket Count Selector */}
            <div className="card bg-white ticket-count-card">
              <h2 className="booking-title">🎫 How many tickets?</h2>
              <p className="booking-subtitle">Select the number of tickets and fill in each attendee's details.</p>
              <div className="ticket-counter">
                <button
                  type="button"
                  className="ticket-btn-round"
                  onClick={() => handleTicketChange(-1)}
                  disabled={ticketCount <= 1}
                  id="ticket-minus-btn"
                >−</button>
                <span className="ticket-count-display">{ticketCount}</span>
                <button
                  type="button"
                  className="ticket-btn-round"
                  onClick={() => handleTicketChange(1)}
                  disabled={ticketCount >= event.available_tickets}
                  id="ticket-plus-btn"
                >+</button>
              </div>
              <p className="ticket-avail-note">{event.available_tickets} seats available</p>
            </div>

            {/* Per-Attendee Forms */}
            <form onSubmit={handleSubmit} id="booking-form">
              {attendees.map((attendee, idx) => (
                <div key={idx} className="card bg-white attendee-card">
                  <div className="attendee-card-header">
                    <div className="attendee-number-badge">{idx + 1}</div>
                    <h3 className="attendee-card-title">
                      {idx === 0 ? '👤 Primary Attendee (You)' : `👤 Attendee ${idx + 1}`}
                    </h3>
                  </div>

                  <div className="attendee-form-grid">
                    <div className="af-group">
                      <label className="af-label">Full Name *</label>
                      <input
                        type="text"
                        className={`af-input ${errors[idx]?.name ? 'af-error' : ''}`}
                        value={attendee.name}
                        onChange={e => handleAttendeeChange(idx, 'name', e.target.value)}
                        placeholder="Full name"
                        id={`attendee-${idx}-name`}
                      />
                      {errors[idx]?.name && <div className="af-err-msg">⚠️ {errors[idx].name}</div>}
                    </div>

                    <div className="af-group">
                      <label className="af-label">Email Address *</label>
                      <input
                        type="email"
                        className={`af-input ${errors[idx]?.email ? 'af-error' : ''}`}
                        value={attendee.email}
                        onChange={e => handleAttendeeChange(idx, 'email', e.target.value)}
                        placeholder="email@example.com"
                        id={`attendee-${idx}-email`}
                      />
                      {errors[idx]?.email && <div className="af-err-msg">⚠️ {errors[idx].email}</div>}
                    </div>

                    <div className="af-group">
                      <label className="af-label">Department *</label>
                      <select
                        className={`af-input af-select ${errors[idx]?.department ? 'af-error' : ''}`}
                        value={attendee.department}
                        onChange={e => handleAttendeeChange(idx, 'department', e.target.value)}
                        id={`attendee-${idx}-dept`}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors[idx]?.department && <div className="af-err-msg">⚠️ {errors[idx].department}</div>}
                    </div>

                    <div className="af-group">
                      <label className="af-label">VTU Number</label>
                      <input
                        type="text"
                        className="af-input"
                        value={attendee.vtu_number}
                        onChange={e => handleAttendeeChange(idx, 'vtu_number', e.target.value)}
                        placeholder="e.g. 1XX21CS001"
                        id={`attendee-${idx}-vtu`}
                      />
                    </div>

                    <div className="af-group">
                      <label className="af-label">Phone Number</label>
                      <input
                        type="tel"
                        className="af-input"
                        value={attendee.phone}
                        onChange={e => handleAttendeeChange(idx, 'phone', e.target.value)}
                        placeholder="+91 9876543210"
                        id={`attendee-${idx}-phone`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Progress */}
              <div className="booking-progress">
                <div className="progress-step complete"><span>1</span> Event Selected</div>
                <div className="progress-line" />
                <div className="progress-step active"><span>2</span> Fill Details</div>
                <div className="progress-line" />
                <div className="progress-step"><span>3</span> Confirm</div>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-full btn-lg mt-2"
                disabled={submitting || event.available_tickets === 0}
                id="confirm-booking-btn"
              >
                {submitting
                  ? '⏳ Processing...'
                  : `✅ Confirm ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''} — ${unitPrice > 0 ? `₹${total}` : 'FREE'}`}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="booking-summary-wrap">
            <div className="card bg-white booking-summary">
              <h3 style={{ fontFamily: 'Bricolage Grotesque', marginBottom: 16 }}>📝 Order Summary</h3>
              <div className="summary-event-title">{event.title}</div>
              <div className="summary-dept">{event.department} · {event.category}</div>

              <div className="divider" />
              <CapacityIndicator available={event.available_tickets} total={event.total_tickets} />
              <div className="divider" />

              <div className="summary-rows">
                <div className="summary-row"><span>📅 Date</span><span>{formatDate(event.event_date)}</span></div>
                <div className="summary-row"><span>🕐 Time</span><span>{formatTime(event.event_time)}</span></div>
                <div className="summary-row"><span>📍 Venue</span><span>{event.venue}</span></div>
                <div className="summary-row"><span>🎫 Tickets</span><span>{ticketCount}</span></div>
                <div className="summary-row"><span>💰 Price/ticket</span><span>{unitPrice > 0 ? `₹${event.price}` : 'FREE'}</span></div>
              </div>

              <div className="divider" />
              <div className="summary-total">
                <span>Total Amount</span>
                <span className="total-amount">{unitPrice > 0 ? `₹${total}` : 'FREE'}</span>
              </div>

              {/* Attendees quick summary */}
              {ticketCount > 1 && (
                <div className="attendees-summary-list">
                  <div className="attendees-summary-title">Attendees</div>
                  {attendees.map((a, i) => (
                    <div key={i} className="attendee-summary-row">
                      <span className="att-num">{i + 1}</span>
                      <span className="att-name">{a.name || <em>Not filled</em>}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
