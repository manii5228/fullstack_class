import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllBookingsAdmin, verifyQR } from '../services/paymentService';
import { toast } from 'react-toastify';
import './AdminTickets.css';

const STATUS_COLORS = { confirmed: '#2e7d32', cancelled: '#c62828', pending: '#e65100' };

const AdminTickets = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrScanModal, setQrScanModal] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    let result = bookings;
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.user_name?.toLowerCase().includes(q) ||
        b.user_email?.toLowerCase().includes(q) ||
        String(b.booking_id).includes(q)
      );
    }
    setFiltered(result);
  }, [bookings, search, statusFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllBookingsAdmin();
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyQR(qrToken.trim());
      setVerifyResult({ success: true, data: res.data });
      toast.success('✅ Ticket verified!');
      fetchAll(); // Refresh
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setVerifyResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Booking ID', 'Event', 'Student Name', 'Email', 'Department', 'Tickets', 'Total', 'Status', 'Date'];
    const rows = filtered.map(b => [
      b.booking_id, `"${b.title}"`, `"${b.user_name}"`, b.user_email,
      `"${b.user_department || ''}"`, b.ticket_count, b.total_price, b.status,
      new Date(b.booking_date).toLocaleDateString('en-IN')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tickets_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + parseFloat(b.total_price || 0), 0);

  return (
    <div className="page-enter">
      <Navbar />
      <main className="admin-tickets-main">
        {/* Header */}
        <div className="at-header">
          <div>
            <h1 className="at-title">🎫 Ticket History</h1>
            <p className="at-subtitle">{bookings.length} total bookings · ₹{totalRevenue.toFixed(0)} revenue</p>
          </div>
          <div className="at-header-actions">
            <button className="btn btn-dark btn-sm" onClick={() => setQrScanModal(true)} id="open-qr-scanner-btn">
              📷 Verify QR
            </button>
            <button className="btn btn-outline btn-sm" onClick={exportCSV} id="export-csv-btn">
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="at-filters">
          <input
            type="text"
            className="at-search"
            placeholder="🔍 Search by name, email, event, booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="ticket-search-input"
          />
          <div className="at-status-tabs">
            {['all', 'confirmed', 'cancelled', 'pending'].map(s => (
              <button
                key={s}
                className={`at-tab ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
                id={`filter-${s}-btn`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s === 'all' && <span className="at-count">{bookings.length}</span>}
                {s === 'confirmed' && <span className="at-count">{bookings.filter(b => b.status === 'confirmed').length}</span>}
                {s === 'cancelled' && <span className="at-count">{bookings.filter(b => b.status === 'cancelled').length}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <div className="at-empty">No tickets found</div>
        ) : (
          <div className="at-table-wrap">
            <table className="at-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Event</th>
                  <th>Student</th>
                  <th>Dept</th>
                  <th>Tickets</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.booking_id} className={`at-row ${b.status}`}>
                    <td><span className="at-booking-id">#{b.booking_id}</span></td>
                    <td>
                      <div className="at-event-name">{b.title}</div>
                      <div className="at-event-venue">📍 {b.venue}</div>
                    </td>
                    <td>
                      <div className="at-user-name">{b.user_name}</div>
                      <div className="at-user-email">{b.user_email}</div>
                    </td>
                    <td><span className="at-dept">{b.user_department || '—'}</span></td>
                    <td><strong className="at-tickets">{b.ticket_count}</strong></td>
                    <td>
                      <strong className="at-total">
                        {parseFloat(b.total_price) > 0 ? `₹${b.total_price}` : 'FREE'}
                      </strong>
                    </td>
                    <td><span className="at-date">{formatDate(b.booking_date)}</span></td>
                    <td>
                      <span className="at-status-badge" style={{ color: STATUS_COLORS[b.status] }}>
                        {b.status === 'confirmed' ? '✅' : b.status === 'cancelled' ? '❌' : '⏳'} {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* QR Scan Modal */}
      {qrScanModal && (
        <div className="modal-overlay" onClick={() => { setQrScanModal(false); setVerifyResult(null); setQrToken(''); }} id="qr-scan-overlay">
          <div className="at-qr-modal" onClick={e => e.stopPropagation()} id="qr-scan-modal">
            <button className="qr-modal-close" onClick={() => { setQrScanModal(false); setVerifyResult(null); setQrToken(''); }}>✕</button>
            <h2 className="at-qr-title">📷 Verify Ticket QR</h2>
            <p className="at-qr-sub">Paste the QR token string or scan with a QR reader</p>

            <form onSubmit={handleVerifyQR} className="at-qr-form">
              <textarea
                className="at-qr-input"
                placeholder="Paste QR token here..."
                value={qrToken}
                onChange={e => setQrToken(e.target.value)}
                rows={4}
                id="qr-token-input"
              />
              <button type="submit" className="btn btn-dark w-full" disabled={verifying} id="verify-qr-btn">
                {verifying ? '⏳ Verifying...' : '✅ Verify Ticket'}
              </button>
            </form>

            {verifyResult && (
              <div className={`at-verify-result ${verifyResult.success ? 'success' : 'fail'}`}>
                {verifyResult.success ? (
                  <>
                    <div className="avr-icon">✅</div>
                    <div className="avr-title">Ticket Valid!</div>
                    <div className="avr-rows">
                      <div className="avr-row"><span>Student</span><strong>{verifyResult.data.attendee?.name}</strong></div>
                      <div className="avr-row"><span>Email</span><strong>{verifyResult.data.attendee?.email}</strong></div>
                      <div className="avr-row"><span>VTU No.</span><strong>{verifyResult.data.attendee?.vtu_number || '—'}</strong></div>
                      <div className="avr-row"><span>Event</span><strong>{verifyResult.data.attendee?.title}</strong></div>
                      <div className="avr-row"><span>Tickets</span><strong>{verifyResult.data.attendee?.ticket_count}</strong></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="avr-icon">❌</div>
                    <div className="avr-title">{verifyResult.message}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
