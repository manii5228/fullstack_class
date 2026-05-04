import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { getQRCode } from '../services/paymentService';
import { getUser } from '../services/authService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BookingHistory.css';

const categoryColors = {
  Workshop: '#2A8FF7', Seminar: '#F25F2E', Cultural: '#F596C5',
  Technical: '#BBE138', default: '#FAC046'
};

const BookingHistory = () => {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [qrModal, setQrModal] = useState(null);   // { booking, qrData }
  const [qrLoading, setQrLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const ticketRef = useRef();

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

  const handleShowQR = async (booking) => {
    setQrLoading(true);
    setQrModal({ booking, qrData: null });
    try {
      const res = await getQRCode(booking.booking_id);
      setQrModal({ booking, qrData: res.data });
    } catch (err) {
      const msg = err.response?.data?.message || 'QR not available';
      const minutesLeft = err.response?.data?.minutes_remaining;
      toast.info(minutesLeft
        ? `🕐 QR unlocks in ${minutesLeft} min before event`
        : msg
      );
      setQrModal(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadTicket = async (booking) => {
    setDownloading(booking.booking_id);
    try {
      // Create an off-screen ticket element
      const ticketEl = document.getElementById(`ticket-${booking.booking_id}`);
      if (!ticketEl) { toast.error('Ticket not found'); return; }

      const canvas = await html2canvas(ticketEl, { scale: 2, backgroundColor: '#FCEFD5', useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [148, 100] });
      pdf.addImage(imgData, 'PNG', 5, 5, 138, 90);
      pdf.save(`EventBook_Ticket_${booking.booking_id}.pdf`);
      toast.success('🎫 Ticket downloaded!');
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
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
            <h1 className="history-title">🎫 My Tickets</h1>
            <p className="history-subtitle">All your event bookings · download, view QR, and more</p>
          </div>
          <Link to="/events" className="btn btn-dark btn-sm" id="explore-more-btn">🔍 Explore Events</Link>
        </div>

        {/* Stats */}
        <div className="history-stats">
          <div className="hstat-card"><div className="hstat-icon">🎫</div><div className="hstat-val">{bookings.length}</div><div className="hstat-lbl">Total</div></div>
          <div className="hstat-card"><div className="hstat-icon">✅</div><div className="hstat-val">{confirmedCount}</div><div className="hstat-lbl">Confirmed</div></div>
          <div className="hstat-card"><div className="hstat-icon">💰</div><div className="hstat-val">₹{totalSpent.toFixed(0)}</div><div className="hstat-lbl">Spent</div></div>
          <div className="hstat-card"><div className="hstat-icon">🏫</div><div className="hstat-val">{user?.department?.split(' ')[0] || 'N/A'}</div><div className="hstat-lbl">Dept</div></div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : bookings.length === 0 ? (
          <div className="empty-state-card">
            <div style={{ fontSize: '4rem' }}>🎪</div>
            <h3>No Bookings Yet</h3>
            <p>Explore and book your first event!</p>
            <Link to="/events" className="btn btn-dark mt-2" id="go-explore-btn">Explore Events</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => (
              <div key={b.booking_id}>
                {/* Printable Ticket (hidden, captured for PDF) */}
                <div id={`ticket-${b.booking_id}`} className="printable-ticket" aria-hidden="true">
                  <div className="pt-left" style={{ background: categoryColors[b.category] || categoryColors.default }}>
                    <div className="pt-event-name">{b.title}</div>
                    <div className="pt-meta">📅 {formatDate(b.event_date)} · {formatTime(b.event_time)}</div>
                    <div className="pt-meta">📍 {b.venue}</div>
                    <div className="pt-meta">🏫 {b.department}</div>
                  </div>
                  <div className="pt-right">
                    <div className="pt-logo">🎪 Campus Cultural</div>
                    <div className="pt-id">#{b.booking_id}</div>
                    <div className="pt-tickets">{b.ticket_count} TICKET{b.ticket_count > 1 ? 'S' : ''}</div>
                    <div className="pt-price">{parseFloat(b.total_price) > 0 ? `₹${b.total_price}` : 'FREE'}</div>
                    <div className="pt-holder">{user?.name}</div>
                    <div className={`pt-status ${b.status}`}>{b.status === 'confirmed' ? '✅ CONFIRMED' : '❌ CANCELLED'}</div>
                  </div>
                </div>

                {/* Booking Card */}
                <div className={`booking-card ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
                  <div className="bc-color-bar" style={{ background: categoryColors[b.category] || categoryColors.default }} />
                  <div className="bc-body">
                    <div className="bc-left">
                      <div className="bc-event-name">{b.title}</div>
                      <div className="bc-meta-row">
                        <span>📅 {formatDate(b.event_date)}</span>
                        <span>🕐 {formatTime(b.event_time)}</span>
                        <span>📍 {b.venue}</span>
                        <span>🏫 {b.department}</span>
                      </div>
                    </div>
                    <div className="bc-right">
                      <span className={`bc-badge ${b.status}`}>{b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}</span>
                      <div className="bc-info"><span>Booking ID</span><strong>#{b.booking_id}</strong></div>
                      <div className="bc-info"><span>Tickets</span><strong>{b.ticket_count}</strong></div>
                      <div className="bc-info"><span>Total</span><strong className="bc-price">{parseFloat(b.total_price) > 0 ? `₹${b.total_price}` : 'FREE'}</strong></div>
                    </div>
                  </div>
                  <div className="bc-actions">
                    <Link to={`/events/${b.event_id}`} className="btn btn-outline btn-sm" id={`view-event-${b.booking_id}`}>View Event</Link>
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() => handleShowQR(b)}
                          disabled={qrLoading}
                          id={`show-qr-${b.booking_id}`}
                        >
                          {qrLoading ? '⏳' : '📱 Show QR'}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDownloadTicket(b)}
                          disabled={downloading === b.booking_id}
                          id={`download-ticket-${b.booking_id}`}
                        >
                          {downloading === b.booking_id ? '⏳' : '⬇️ Download'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(b.booking_id)}
                          disabled={cancelling === b.booking_id}
                          id={`cancel-booking-${b.booking_id}`}
                        >
                          {cancelling === b.booking_id ? '⏳' : '❌ Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="bc-date-badge">{formatDate(b.booking_date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══ QR Modal ══ */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)} id="qr-modal-overlay">
          <div className="qr-modal" onClick={e => e.stopPropagation()} id="qr-modal">
            <button className="qr-modal-close" onClick={() => setQrModal(null)}>✕</button>
            <div className="qr-modal-header">
              <h2>📱 Entry QR Code</h2>
              <p>{qrModal.booking.title}</p>
            </div>
            {qrLoading || !qrModal.qrData ? (
              <div style={{ padding: 40 }}><div className="spinner" /></div>
            ) : (
              <>
                <div className="qr-image-wrap">
                  <img src={qrModal.qrData.qr_image} alt="QR Code" className="qr-image" />
                </div>
                <div className="qr-details">
                  <div className="qr-detail-row"><span>📅 Date</span><strong>{formatDate(qrModal.qrData.event_date)}</strong></div>
                  <div className="qr-detail-row"><span>🕐 Time</span><strong>{formatTime(qrModal.qrData.event_time)}</strong></div>
                  <div className="qr-detail-row"><span>📍 Venue</span><strong>{qrModal.qrData.venue}</strong></div>
                  <div className="qr-detail-row"><span>🎫 Tickets</span><strong>{qrModal.qrData.ticket_count}</strong></div>
                </div>
                <p className="qr-warning">⚠️ QR code is valid for entry only. Do not share.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
