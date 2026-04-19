import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(res => setEvents(res.data.events)).catch().finally(() => setLoading(false));
  }, []);

  const trending = events.slice(0, 3); // Show first 3 events regardless of engagement score
  const categories = ['Workshop', 'Seminar', 'Cultural', 'Technical'];
  const catCounts = categories.map(c => ({
    name: c,
    count: events.filter(e => e.category === c).length || Math.floor(Math.random() * 20) + 1
  }));

  const formatPrice = (p) => parseFloat(p) > 0 ? `$${parseFloat(p).toFixed(0)}` : 'FREE';

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '60px 20px' }}>
        <div className="solid-bento-grid">

          {/* ================= TOP SECTION ================= */}
          {/* Top Left Column (Span 3) */}
          <div className="flex-col gap-3" style={{ gridColumn: 'span 3', gridRow: 'span 2' }}>
            {/* Yellow Hand Icon Box */}
            <Link to="/events" className="card bg-yellow flex-center" style={{ flex: 1.2, minHeight: '180px', backgroundColor: 'var(--c-yellow)', textDecoration: 'none' }}>
              <img src="/images/hand.png" alt="Hand" style={{ width: '110px', objectFit: 'contain' }} />
            </Link>
            
            {/* Orange Icon Box */}
            <div className="card bg-orange flex-center" style={{ flex: 1, minHeight: '140px', backgroundColor: '#F25F2E' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: '1.8rem' }}>
                <span>🎉</span><span>🎫</span><span>🎓</span>
                <span>👤</span><span>💬</span><span>📍</span>
              </div>
            </div>
          </div>

          {/* Top Middle Column (Span 4) */}
          <div className="flex-col gap-3" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
            {/* Blue Task Button Box */}
            <Link to="/events" className="card bg-blue flex-center" style={{ flex: 1, minHeight: '120px', backgroundColor: '#2A8FF7', textDecoration: 'none' }}>
              <div className="btn bg-sand" style={{ color: 'var(--c-maroon)', fontSize: '1.2rem', padding: '12px 28px', pointerEvents: 'none' }}>
                View All Events ➔
              </div>
            </Link>
            
            {/* Pink Calendar Box */}
            <Link to="/events" className="card bg-pink flex-center" style={{ flex: 1.5, minHeight: '200px', backgroundColor: '#F596C5', textDecoration: 'none' }}>
               <img src="/images/calendar.png" alt="Calendar" style={{ width: '80%', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Top Right Column - Profiles (Span 5) */}
          <div className="card bg-maroon flex-center" style={{ gridColumn: 'span 5', gridRow: 'span 2', backgroundColor: '#380D0C', padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
              {[0, 1, 2].map(i => {
                const e = trending[i];
                if (!e) {
                   return (
                     <div key={`empty-${i}`} className="card bg-sand flex-col items-center" style={{ padding: '12px', opacity: 0.6, cursor: 'not-allowed' }}>
                        <div style={{ width: '100%', height: '100px', backgroundColor: '#EAE0C9', borderTopLeftRadius: '50px', borderTopRightRadius: '50px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '2rem' }}>🕒</span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', textAlign: 'center' }}>Coming Soon</h3>
                        <p style={{ fontSize: '0.65rem', fontWeight: 600, margin: '0 0 12px 0', textAlign: 'center' }}>---</p>
                        <div className="btn bg-yellow" style={{ fontSize: '0.7rem', padding: '6px 16px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>TBA</div>
                     </div>
                   );
                }

                const imgSource = i === 0 ? '/images/download.jpeg' : (i === 1 ? '/images/images.png' : '/images/handyman.png');
                return (
                  <Link to={`/events/${e.event_id}`} key={e.event_id} className="card bg-sand flex-col items-center" style={{ padding: '12px', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: '100%', height: '100px', backgroundColor: '#EAE0C9', borderTopLeftRadius: '50px', borderTopRightRadius: '50px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginBottom: '12px', overflow: 'hidden' }}>
                       <img src={imgSource} alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', textAlign: 'center' }}>{e.title.split(' ')[0]}</h3>
                    <p style={{ fontSize: '0.65rem', fontWeight: 600, margin: '0 0 12px 0', textAlign: 'center' }}>⭐ {e.engagement_score} | {e.category}</p>
                    <div className="btn bg-yellow" style={{ fontSize: '0.7rem', padding: '6px 16px', width: '100%', textAlign: 'center' }}>Check it out</div>
                  </Link>
                );
              })}
            </div>
          </div>


          {/* ================= BOTTOM SECTION ================= */}
          {/* Bottom Left Column - Price (Span 4) */}
          <div className="card bg-maroon flex-col justify-center items-start" style={{ gridColumn: 'span 4', gridRow: 'span 2', backgroundColor: '#380D0C', padding: '32px' }}>
            <h2 style={{ fontSize: '4.5rem', color: '#FCEFD5', margin: '0 0 16px 0', lineHeight: 0.9 }}>
               {events[0] ? formatPrice(events[0].price) : 'FREE'}
            </h2>
            <div className="btn-outline" style={{ borderColor: '#FCEFD5', color: '#FCEFD5', borderRadius: 100, padding: '8px 24px', textAlign: 'center', margin: '0 0 24px 0', fontWeight: 700, fontSize: '1.2rem' }}>
               🎫 {events[0] ? events[0].category : 'Hackathon'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(252,239,213,0.7)', textAlign: 'left', lineHeight: 1.4, maxWidth: '200px' }}>
               This is a starting price estimate, please continue to view details.
            </p>
          </div>

          {/* Bottom Middle Column - Categories (Span 4) */}
          <div className="card bg-lime flex-col justify-center" style={{ gridColumn: 'span 4', gridRow: 'span 2', backgroundColor: '#BBE138', padding: '32px' }}>
             <div className="pill-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {catCounts.map((c, idx) => (
                 <Link to={`/events?category=${c.name}`} key={idx} className="pill-item" style={{ background: '#1C260D', color: 'white', borderRadius: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, textDecoration: 'none' }}>
                   <div className="flex items-center gap-2">
                     <span>{idx===0?'🛠️':idx===1?'🗣️':idx===2?'🎭':'💻'}</span> {c.name}
                   </div>
                   <div className="pill-count" style={{ background: '#FAC046', color: '#3C0908', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{c.count}</div>
                 </Link>
               ))}
             </div>
          </div>

          {/* Bottom Right Column - Main Text (Span 4) */}
          <div className="card bg-pink flex-col flex-center justify-between" style={{ gridColumn: 'span 4', gridRow: 'span 2', textAlign: 'center', backgroundColor: '#F596C5', padding: '32px' }}>
             <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#380D0C', margin: 0 }}>Brand Idea</p>
             <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', textTransform: 'uppercase', lineHeight: 0.9, margin: 0, color: '#380D0C', letterSpacing: '-0.02em', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span>CRAFTED<br/>EVENTS FOR<br/>YOUR COLLEGE</span>
             </h1>
             <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#380D0C', margin: 0 }}>EventBook</p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Home;
