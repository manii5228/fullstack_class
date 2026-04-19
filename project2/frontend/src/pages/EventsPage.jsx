import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import Navbar from '../components/Navbar';
import CapacityIndicator from '../components/CapacityIndicator';
import { toast } from 'react-toastify';
import './EventsPage.css';

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Cultural', 'Technical'];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(categoryParam);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then(res => setEvents(res.data.events || []))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const matchCat = activeCategory === 'All' || e.category === activeCategory;
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.venue?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      <Navbar />
      <main className="events-main">
        <div className="events-header">
          <div>
            <h1 className="events-title">Discover Events</h1>
            <p className="events-subtitle">{filtered.length} event{filtered.length !== 1 ? 's' : ''} available</p>
          </div>
          <input
            type="text"
            className="form-input events-search"
            placeholder="🔍 Search by title or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="events-search-input"
          />
        </div>

        {/* Category Filters */}
        <div className="events-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`filter-${cat}`}
              className={`events-filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat === 'All' ? '🌐 All' : cat === 'Workshop' ? '🛠️ Workshop' : cat === 'Seminar' ? '🗣️ Seminar' : cat === 'Cultural' ? '🎭 Cultural' : '💻 Technical'}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="events-empty">
            <div style={{ fontSize: '4rem' }}>📭</div>
            <h2>No events found</h2>
            <p>Try changing the category or search term</p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map(e => (
              <Link to={`/events/${e.event_id}`} key={e.event_id} className="event-card" id={`event-card-${e.event_id}`}>
                <div className="event-card-banner">
                  {e.poster_url ? (
                    <img src={`http://localhost:5000${e.poster_url}`} alt={e.title} className="event-card-img" />
                  ) : (
                    <div className="event-card-placeholder">🎪</div>
                  )}
                  <span className={`event-card-badge badge-cat-${e.category?.toLowerCase()}`}>{e.category}</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{e.title}</h3>
                  <div className="event-card-meta">
                    <span>📅 {formatDate(e.event_date)}</span>
                    <span>🕐 {e.event_time}</span>
                  </div>
                  <div className="event-card-metab">
                    <span>📍 {e.venue}</span>
                    {e.department && <span>🏫 {e.department}</span>}
                  </div>
                  <div className="event-card-footer">
                    <span className="event-card-price" style={{ color: parseFloat(e.price) > 0 ? '#c0392b' : '#108A43' }}>
                      {parseFloat(e.price) > 0 ? `₹${e.price}` : 'FREE'}
                    </span>
                    <CapacityIndicator available={e.available_tickets} total={e.total_tickets} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default EventsPage;
