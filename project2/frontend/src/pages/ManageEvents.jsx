import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getEvents, deleteEvent, cloneEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import EventModal from '../components/EventModal';
import CapacityIndicator from '../components/CapacityIndicator';
import './ManageEvents.css';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [cloning, setCloning] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.events);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this event? It will be hidden from users.')) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      toast.success('Event archived');
      fetchEvents();
    } catch { toast.error('Failed to archive'); }
    finally { setDeleting(null); }
  };

  const handleClone = async (id) => {
    setCloning(id);
    try {
      await cloneEvent(id);
      toast.success('Event cloned successfully');
      fetchEvents();
    } catch { toast.error('Failed to clone event'); }
    finally { setCloning(null); }
  };

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusBadge = { active: 'badge-green', inactive: 'badge-yellow', full: 'badge-red', archived: 'badge-red' };

  return (
    <div className="page-enter">
      <Navbar />
      <main className="manage-main">
        <div className="manage-header">
          <div>
            <h1 className="section-title">🗂️ Manage Events</h1>
            <p className="section-subtitle">{events.length} events total</p>
          </div>
          <div className="manage-actions">
            <Link to="/admin" className="btn btn-outline btn-sm" id="back-to-admin-btn">← Dashboard</Link>
            <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setModalOpen(true); }} id="create-event-btn">
              ➕ Create Event
            </button>
          </div>
        </div>

        {/* Search & filter bar */}
        <div className="card manage-search-bar">
          <input
            id="manage-search-input"
            type="text"
            className="form-input"
            placeholder="🔍 Search events by title, department, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <span className="manage-count">{filtered.length} results</span>
        </div>

        {/* Events Table */}
        <div className="card">
          <div className="table-wrap">
            {loading ? <div className="spinner" /> : filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><h3>No events found</h3></div>
            ) : (
              <table id="events-admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.event_id}>
                      <td>
                        <div className="event-table-info">
                          <div className="event-table-name">{e.title}</div>
                          <div className="event-table-meta">
                            <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{e.category}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.department}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{formatDate(e.event_date)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.event_time}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: 140 }}>{e.venue}</td>
                      <td style={{ fontWeight: 700, color: parseFloat(e.price) > 0 ? 'var(--accent-3)' : 'var(--success)' }}>
                        {parseFloat(e.price) > 0 ? `₹${e.price}` : 'FREE'}
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <CapacityIndicator available={e.available_tickets} total={e.total_tickets} />
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[e.status] || 'badge-purple'}`}>{e.status}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditingEvent(e); setModalOpen(true); }} id={`edit-event-${e.event_id}`}>✏️</button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleClone(e.event_id)} disabled={cloning === e.event_id} id={`clone-event-${e.event_id}`} title="Clone event">
                            {cloning === e.event_id ? '⏳' : '📋'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.event_id)} disabled={deleting === e.event_id} id={`delete-event-${e.event_id}`}>
                            {deleting === e.event_id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {modalOpen && (
          <EventModal
            event={editingEvent}
            onClose={() => setModalOpen(false)}
            onSaved={() => { setModalOpen(false); fetchEvents(); }}
          />
        )}
      </main>
    </div>
  );
};

export default ManageEvents;
