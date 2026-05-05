import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import { getUser } from '../services/authService';
import Navbar from '../components/Navbar';
import './Home.css';


const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickerIdx, setTickerIdx] = useState(0);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    getEvents().then(res => setEvents(res.data.events)).catch(() => { }).finally(() => setLoading(false));
  }, []);



  const trending = events.slice(0, 3);
  const categories = ['Workshop', 'Seminar', 'Cultural', 'Technical'];
  const catCounts = categories.map(c => ({
    name: c,
    count: events.filter(e => e.category === c).length || Math.floor(Math.random() * 20) + 1,
    icon: c === 'Workshop' ? '🛠️' : c === 'Seminar' ? '🗣️' : c === 'Cultural' ? '🎭' : '💻',
  }));

  const formatPrice = (p) => parseFloat(p) > 0 ? `₹${parseFloat(p).toFixed(0)}` : 'FREE';
  const totalEvents = events.length;
  const freeEvents = events.filter(e => parseFloat(e.price) === 0).length;

  if (loading) {
    return (
      <div className="splash-loading">
        <Navbar />
        <div className="splash-center">
          <div className="splash-logo">🎪</div>
          <div className="splash-title">Campus Cultural</div>
          <div className="splash-bar"><div className="splash-fill" /></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="hero-section hero-animated-bg">
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        <div className="hero-inner">
          <div className="hero-text-col">
            <span className="hero-badge">🎓 VTU College Events Platform</span>
            <h1 className="hero-title">
              CRAFTED<br />
              <span className="hero-title-accent">EVENTS</span><br />
              FOR YOUR<br />
              COLLEGE
            </h1>
            <p className="hero-sub">
              Discover, book, and experience the best workshops, hackathons, cultural fests and seminars at your campus.
            </p>
            <div className="hero-ctas">
              <Link to="/events" className="btn btn-dark btn-lg hero-cta-primary" id="hero-browse-btn">
                Browse Events ➔
              </Link>
              {!user && (
                <Link to="/register" className="btn btn-outline hero-cta-secondary" id="hero-signup-btn">
                  Sign Up Free
                </Link>
              )}
            </div>
            <div className="hero-stats-row">
              <div className="hstat">
                <strong>{totalEvents}+</strong>
                <span>Events</span>
              </div>
              <div className="hstat-divider" />
              <div className="hstat">
                <strong>{freeEvents}</strong>
                <span>Free Events</span>
              </div>
              <div className="hstat-divider" />
              <div className="hstat">
                <strong>QR</strong>
                <span>Verified Tickets</span>
              </div>
            </div>
          </div>

          {/* Floating event cards preview */}
          <div className="hero-visual-col">
            <div className="hero-float-grid">
              {trending.slice(0, 2).map((e, i) => (
                <Link
                  to={`/events/${e.event_id}`}
                  key={e.event_id}
                  className={`hero-float-card hfc-${i}`}
                  id={`hero-event-card-${i}`}
                >
                  <div className="hfc-emoji">{i === 0 ? '🎓' : '🎪'}</div>
                  <div className="hfc-info">
                    <div className="hfc-title">{e.title?.substring(0, 22)}</div>
                    <div className="hfc-meta">{e.category} · {formatPrice(e.price)}</div>
                  </div>
                  <div className="hfc-arrow">→</div>
                </Link>
              ))}
              <div className="hero-float-stat-card">
                <div className="hsc-num">{events.filter(e => e.available_tickets > 0).length}</div>
                <div className="hsc-label">Available Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ BENTO GRID ══════════════ */}
      <main className="bento-main">
        <div className="solid-bento-grid">

          {/* ── TOP LEFT: MAIN TITLE TEXT (moved to top) ── */}
          <div
            className="card bg-pink bento-card bento-hover flex-col flex-center justify-between"
            style={{ gridColumn: 'span 4', gridRow: 'span 2', textAlign: 'center', backgroundColor: '#F596C5', padding: '32px' }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#380D0C', margin: 0 }}>EventBook</p>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', textTransform: 'uppercase', lineHeight: 0.9, margin: 0, color: '#380D0C', letterSpacing: '-0.02em', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>CRAFTED<br />EVENTS<br />FOR YOUR<br />COLLEGE</span>
            </h2>
            <Link to="/events" className="btn btn-dark btn-sm" style={{ marginTop: 12 }}>Explore →</Link>
          </div>

          {/* ── TOP MIDDLE: Event showcase cards ── */}
          <div className="card bg-maroon bento-card bento-hover flex-center" style={{ gridColumn: 'span 5', gridRow: 'span 2', backgroundColor: '#380D0C', padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
              {[0, 1, 2].map(i => {
                const e = trending[i];
                const imgSource = i === 0 ? '/images/download.jpeg' : (i === 1 ? '/images/images.png' : '/images/handyman.png');
                if (!e) return (
                  <div key={`empty-${i}`} className="card bg-sand flex-col items-center bento-event-mini" style={{ padding: '12px', opacity: 0.5 }}>
                    <div className="event-mini-img" style={{ background: '#EAE0C9' }}><span style={{ fontSize: '2rem' }}>🕒</span></div>
                    <h3 className="event-mini-title">Coming Soon</h3>
                    <div className="btn bg-yellow" style={{ fontSize: '0.7rem', padding: '6px 12px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>TBA</div>
                  </div>
                );
                return (
                  <Link to={`/events/${e.event_id}`} key={e.event_id} className="card bg-sand flex-col items-center bento-event-mini bento-hover" style={{ padding: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div className="event-mini-img" style={{ overflow: 'hidden' }}>
                      <img src={imgSource} alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 className="event-mini-title">{e.title?.split(' ')[0]}</h3>
                    <p className="event-mini-meta">⭐ {e.engagement_score} · {e.category}</p>
                    <div className="btn bg-yellow" style={{ fontSize: '0.7rem', padding: '6px 12px', width: '100%', textAlign: 'center' }}>Check it out</div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── TOP RIGHT: Hand icon ── */}
          <div className="flex-col gap-3" style={{ gridColumn: 'span 3', gridRow: 'span 2' }}>
            <Link to="/events" className="card bg-yellow flex-center bento-card bento-hover" style={{ flex: 1.2, minHeight: '180px' }}>
              <img src="/images/hand.png" alt="Hand" style={{ width: '110px', objectFit: 'contain' }} />
            </Link>
            <Link to="/events" className="card bg-orange flex-center bento-card bento-hover" style={{ flex: 1, minHeight: '120px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '1.6rem' }}>
                <span>🎉</span><span>🎫</span><span>🎓</span>
                <span>👤</span><span>💬</span><span>📍</span>
              </div>
            </Link>
          </div>

          {/* ── BOTTOM LEFT: Price highlight ── */}
          <div className="card bg-maroon flex-col justify-center bento-card bento-hover" style={{ gridColumn: 'span 4', gridRow: 'span 2', backgroundColor: '#380D0C', padding: '32px' }}>
            <h2 style={{ fontSize: '4.5rem', color: '#FCEFD5', margin: '0 0 16px 0', lineHeight: 0.9 }}>
              {events[0] ? formatPrice(events[0].price) : 'FREE'}
            </h2>
            <div className="btn-outline" style={{ borderColor: '#FCEFD5', color: '#FCEFD5', borderRadius: 100, padding: '8px 24px', marginBottom: 24, fontWeight: 700, fontSize: '1.1rem', display: 'inline-block' }}>
              🎫 {events[0] ? events[0].category : 'Events'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(252,239,213,0.7)', lineHeight: 1.4, maxWidth: '200px' }}>
              Starting price · view event details for full info.
            </p>
          </div>

          {/* ── BOTTOM MIDDLE: Category pills ── */}
          <div className="card bg-lime flex-col justify-center bento-card bento-hover" style={{ gridColumn: 'span 4', gridRow: 'span 2', backgroundColor: '#BBE138', padding: '32px' }}>
            <p style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 12, color: '#1C260D' }}>Browse by Category</p>
            <div className="pill-list">
              {catCounts.map((c, idx) => (
                <Link to={`/events?category=${c.name}`} key={idx} className="pill-item pill-hover" style={{ background: '#1C260D', color: 'white', borderRadius: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, textDecoration: 'none' }}>
                  <div className="flex items-center gap-2">
                    <span>{c.icon}</span> {c.name}
                  </div>
                  <div className="pill-count">{c.count}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── BOTTOM RIGHT: View all CTA ── */}
          <div className="flex-col gap-3" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
            <Link to="/events" className="card bg-blue flex-center bento-card bento-hover" style={{ flex: 1, minHeight: '120px', backgroundColor: '#2A8FF7' }}>
              <div className="btn bg-sand" style={{ color: 'var(--c-maroon)', fontSize: '1.1rem', padding: '12px 28px', pointerEvents: 'none' }}>
                View All Events ➔
              </div>
            </Link>
            <Link to="/events" className="card bg-pink flex-center bento-card bento-hover" style={{ flex: 1.5, minHeight: '200px', backgroundColor: '#F596C5' }}>
              <img src="/images/calendar.png" alt="Calendar" style={{ width: '80%', objectFit: 'contain' }} />
            </Link>
          </div>

        </div>


      </main>
    </>
  );
};

export default Home;
