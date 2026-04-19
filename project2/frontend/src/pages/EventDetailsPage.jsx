import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../services/eventService';
import Navbar from '../components/Navbar';
import CapacityIndicator from '../components/CapacityIndicator';
import { toast } from 'react-toastify';
import './EventDetailsPage.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(id)
      .then(res => setEvent(res.data.event))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div><Navbar /><div className="spinner"></div></div>;
  if (!event) return <div><Navbar /><div className="flex-center" style={{ height: '60vh' }}><h1>Event Not Found</h1></div></div>;

  const isWaitlist = event.status === 'full' || event.available_tickets <= 0;
  const tags = event.tags ? (typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags) : [];

  return (
    <>
      <Navbar />
      <div className="details-container">

        <div className="details-grid">
          {/* Hero Banner */}
          <div className="details-poster">
            {event.poster_url ? (
              <img src={`http://localhost:5000${event.poster_url}`} alt={event.title} />
            ) : (
              <span className="details-poster-placeholder">🎪</span>
            )}
          </div>

          <div className="details-main">
            <div className="details-meta-row">
              <div className="details-meta-item" style={{ background: 'var(--c-yellow)', color: 'var(--c-maroon)' }}>{event.category}</div>
              <div className="details-meta-item">🏫 {event.department}</div>
              <div className="details-meta-item">📅 {new Date(event.event_date).toLocaleDateString()}</div>
              <div className="details-meta-item">🕐 {event.event_time}</div>
              <div className="details-meta-item">📍 {event.venue}</div>
            </div>

            <h1 className="details-title">{event.title}</h1>
            <p className="details-description">{event.description || 'No description provided for this event.'}</p>

            {tags.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <strong style={{ display: 'block', marginBottom: 12 }}>Tags:</strong>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => <span key={t} className="details-meta-item" style={{ background: '#eee' }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="details-sidebar">
            <div className="details-price-card text-center">
              <div className="details-price">{parseFloat(event.price) > 0 ? `₹${event.price}` : 'FREE'}</div>
              <div style={{ fontWeight: 700 }}>Ticket Price</div>
              <Link
                to={`/book/${event.event_id}`}
                id={`book-btn-${event.event_id}`}
                className="btn bg-maroon w-full mt-4"
                style={{ color: 'white', padding: '20px', fontSize: '1.2rem', marginTop: '24px' }}>
                {isWaitlist ? 'Join Waitlist ⏳' : 'Get Tickets 🎫'}
              </Link>
            </div>

            <div className="details-capacity-card">
              <div className="details-capacity-val">{event.available_tickets} <span style={{ fontSize: '1.2rem' }}>/ {event.total_tickets}</span></div>
              <div style={{ fontWeight: 700, margin: '8px 0 16px 0' }}>Tickets Left</div>
              <CapacityIndicator available={event.available_tickets} total={event.total_tickets} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EventDetailsPage;
