import React from 'react';
import { Link } from 'react-router-dom';
import CapacityIndicator from './CapacityIndicator';
import './EventCard.css';

const categoryColors = {
  Workshop: 'cat-workshop',
  Seminar: 'cat-seminar',
  Cultural: 'cat-cultural',
  Technical: 'cat-workshop',
};

const categoryIcons = {
  Workshop: '🛠️',
  Seminar: '🎤',
  Cultural: '🎭',
  Technical: '💻',
  default: '🎪',
};

const difficultyBadge = {
  Beginner: 'badge-green',
  Intermediate: 'badge-yellow',
  Advanced: 'badge-red',
};

const EventCard = ({ event, compact = false }) => {
  const {
    event_id, title, department, venue, event_date,
    event_time, price, available_tickets, total_tickets,
    category, poster_url, difficulty_level, engagement_score, tags
  } = event;

  const catClass = categoryColors[category] || 'cat-default';
  const catIcon = categoryIcons[category] || categoryIcons.default;
  const isTrending = engagement_score > 80;
  const isFull = available_tickets === 0;
  const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (t) => { const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

  return (
    <div className={`event-card card ${catClass} ${compact ? 'compact' : ''}`}>
      {/* Poster */}
      <div className="event-card-poster">
        {poster_url ? (
          <img src={`http://localhost:5000${poster_url}`} alt={title} />
        ) : (
          <div className="poster-placeholder">
            <span className="poster-icon">{catIcon}</span>
          </div>
        )}
        <div className="poster-overlays">
          {isTrending && <span className="trending-fire">🔥 Trending</span>}
          {isFull && <span className="badge badge-red">FULL</span>}
          <span className={`badge ${difficultyBadge[difficulty_level] || 'badge-purple'}`}>{difficulty_level}</span>
        </div>
      </div>

      {/* Content */}
      <div className="event-card-body">
        <div className="event-card-meta">
          <span className="event-dept">{department}</span>
          <span className="event-cat-badge">{catIcon} {category}</span>
        </div>

        <h3 className="event-title">{title}</h3>

        {!compact && (
          <div className="event-tags">
            {parsedTags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="event-info">
          <div className="event-info-row">
            <span>📅</span>
            <span>{formatDate(event_date)} · {formatTime(event_time)}</span>
          </div>
          <div className="event-info-row">
            <span>📍</span>
            <span>{venue}</span>
          </div>
        </div>

        <CapacityIndicator available={available_tickets} total={total_tickets} />

        <div className="event-card-footer">
          <div className="event-price">
            {price > 0 ? <><span className="price-label">₹</span><span className="price-value">{price}</span></> : <span className="price-free">FREE</span>}
          </div>
          <Link
            to={`/events/${event_id}`}
            className={`btn ${isFull ? 'btn-outline' : 'btn-primary'} btn-sm`}
            id={`event-card-btn-${event_id}`}
          >
            {isFull ? 'Join Waitlist' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
