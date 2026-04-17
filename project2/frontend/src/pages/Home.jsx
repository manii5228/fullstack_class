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

  const trending = events.filter(e => e.engagement_score > 70).slice(0, 3);
  const categories = ['Workshop', 'Seminar', 'Cultural', 'Technical'];
  const catCounts = categories.map(c => ({
    name: c,
    count: events.filter(e => e.category === c).length || Math.floor(Math.random() * 20) + 1
  }));

  const formatPrice = (p) => parseFloat(p) > 0 ? `$${parseFloat(p).toFixed(0)}` : 'FREE';

  return (
    <>
      <Navbar />
      <main style={{ padding: '60px 20px' }}>
        <div className="solid-bento-grid">
          
          {/* Box 1: Yellow Hand Icon (col-3, row-2) */}
          <div className="card bg-yellow flex-center" style={{ gridColumn: 'span 3', gridRow: 'span 2', minHeight: '260px' }}>
            <img src="/images/hand.png" alt="Hand" style={{ width: 140, objectFit: 'contain' }} />
          </div>

          {/* Column 2 (two stacked blocks in col 3) */}
          <div className="flex-col gap-3" style={{ gridColumn: 'span 3', gridRow: 'span 2' }}>
            {/* Blue actions block */}
            <div className="card bg-blue flex-center" style={{ flex: 1 }}>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
                Book events →
              </Link>
            </div>
            {/* Pink Calendar Block */}
            <div className="card bg-pink flex-center" style={{ flex: 1.5 }}>
               <img src="/images/calendar.png" alt="Calendar" style={{ width: '80%', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Box 3: Maroon Top Right - Trending Events (col-6, row-2) */}
          <div className="card bg-maroon" style={{ gridColumn: 'span 6', gridRow: 'span 2' }}>
             <div className="flex gap-3 h-full" style={{ padding: '20px 0' }}>
               {trending.length > 0 ? trending.map((e, i) => (
                 <Link to={`/events/${e.event_id}`} key={e.event_id} className="card bg-sand flex-col justify-between" style={{ flex: 1, padding: 16 }}>
                   <div style={{ background: '#EAE0C9', height: 140, borderRadius: 'top-12px', overflow: 'hidden', margin: '-16px -16px 12px -16px' }}>
                     <img src="/images/handyman.png" alt="trending" className="card-image-cover" />
                   </div>
                   <div>
                     <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{e.title.split(' ')[0]}</h3>
                     <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>⭐ {e.engagement_score} | {e.category}</p>
                   </div>
                   <button className="btn bg-yellow w-full" style={{ color: '#3C0908', marginTop: 12 }}>Check it out</button>
                 </Link>
               )) : (
                 [1, 2, 3].map(i => <div key={i} className="card bg-sand" style={{ flex: 1 }} />)
               )}
             </div>
          </div>

          {/* Box 4: Orange block (col-3, row-1) */}
          <div className="card bg-orange flex-center" style={{ gridColumn: 'span 3', gridRow: 'span 1', minHeight: 160 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '2rem' }}>
              <span>🔍</span><span>❤️</span><span>🎁</span><span>💬</span>
            </div>
          </div>

          {/* Rest of Bottom row */}
          {/* Below Orange is Maroon Price Box (col-3, row-2) */}
          <div className="card bg-maroon flex-col justify-center" style={{ gridColumn: 'span 3', gridRow: 'span 2' }}>
            <h2 style={{ fontSize: '4.5rem', color: '#FCEFD5', margin: 0 }}>
               {events[0] ? formatPrice(events[0].price) : '$199'}
            </h2>
            <div className="btn-outline" style={{ borderColor: 'white', color: 'white', borderRadius: 100, padding: '8px 24px', textAlign: 'center', margin: '16px 0', fontWeight: 700 }}>
               🎫 {events[0] ? events[0].category : 'Hackathon'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
               This is the ticket price, grab yours before it fills up.
            </p>
          </div>

          {/* Lime Green Categories (col-3, row-2) */}
          <div className="card bg-lime" style={{ gridColumn: 'span 3', gridRow: 'span 2' }}>
             <div className="pill-list" style={{ marginTop: 20 }}>
               {catCounts.map((c, i) => (
                 <div key={i} className="pill-item">
                   <div className="flex items-center gap-2">
                     <span>{i===0?'☕':i===1?'🪴':i===2?'🍳':'🛠️'}</span>
                     {c.name}
                   </div>
                   <div className="pill-count">{c.count}</div>
                 </div>
               ))}
             </div>
          </div>

          {/* Big Pink Text Box (col-6, row-2) */}
          <div className="card bg-pink flex-col flex-center text-center justify-center p-4" style={{ gridColumn: 'span 6', gridRow: 'span 2' }}>
             <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-maroon)', marginBottom: 12 }}>Brand Idea</p>
             <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', textTransform: 'uppercase', lineHeight: 0.9, margin: 0, color: 'var(--c-maroon)' }}>
               CRAFTED <br/>
               EVENTS FOR <br/>
               YOUR COLLEGE
             </h1>
             <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-maroon)', marginTop: 24 }}>EventBook</p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Home;
