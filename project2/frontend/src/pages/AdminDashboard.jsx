import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/dashboard')
      .then(res => setData(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><Navbar /><div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div></div>;

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  const barData = {
    labels: charts.bookingsPerEvent?.map(e => e.title?.substring(0,20) + '...') || [],
    datasets: [{
      label: 'Bookings',
      data: charts.bookingsPerEvent?.map(e => e.bookings) || [],
      backgroundColor: ['#6C63FF','#FF7A59','#00A8A8','#FFB347','#E91E8C','#10B981','#6C63FF','#FF7A59'],
      borderRadius: 8,
    }]
  };

  const doughnutData = {
    labels: charts.categoryDist?.map(c => c.category) || [],
    datasets: [{
      data: charts.categoryDist?.map(c => c.bookings) || [],
      backgroundColor: ['#6C63FF','#FF7A59','#00A8A8','#FFB347','#E91E8C'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  };

  const lineData = {
    labels: charts.revenueOverTime?.map(r => r.date) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: charts.revenueOverTime?.map(r => r.revenue) || [],
      fill: true,
      borderColor: '#6C63FF',
      backgroundColor: 'rgba(108,99,255,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#6C63FF',
    }]
  };

  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } } };
  const dOptions = { responsive: true, plugins: { legend: { position: 'right' } } };

  return (
    <div className="page-enter">
      <Navbar />
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="section-title">📊 Admin Dashboard</h1>
            <p className="section-subtitle">Event management &amp; analytics overview</p>
          </div>
          <div className="admin-actions">
            <Link to="/admin/events" className="btn btn-primary" id="manage-events-btn">🗂️ Manage Events</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.12)' }}>🎪</div>
            <div className="stat-value" style={{ color: '#6C63FF' }}>{stats.total_events || 0}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(255,122,89,0.12)' }}>🎫</div>
            <div className="stat-value" style={{ color: '#FF7A59' }}>{stats.total_bookings || 0}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(0,168,168,0.12)' }}>💰</div>
            <div className="stat-value" style={{ color: '#00A8A8' }}>₹{parseFloat(stats.total_revenue || 0).toFixed(0)}</div>
            <div className="stat-label">Revenue Generated</div>
          </div>
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>🎟️</div>
            <div className="stat-value" style={{ color: '#10B981' }}>{stats.total_tickets_remaining || 0}</div>
            <div className="stat-label">Tickets Remaining</div>
          </div>
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>📈</div>
            <div className="stat-value" style={{ color: '#F59E0B' }}>₹{stats.avg_ticket_price || 0}</div>
            <div className="stat-label">Avg Ticket Price</div>
          </div>
          <div className="stat-card col-2">
            <div className="stat-icon" style={{ background: 'rgba(233,30,140,0.12)' }}>👥</div>
            <div className="stat-value" style={{ color: '#E91E8C' }}>{stats.total_users || 0}</div>
            <div className="stat-label">Registered Users</div>
          </div>
        </div>

        {/* Top event */}
        {data?.top_event && (
          <div className="card top-event-card">
            <div className="top-event-label">🏆 Top Performing Event</div>
            <div className="top-event-name">{data.top_event.title}</div>
            <div className="top-event-stats">
              <span>🎫 {data.top_event.booking_count} bookings</span>
              <span>💰 ₹{parseFloat(data.top_event.revenue).toFixed(0)} revenue</span>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="admin-charts-grid">
          {/* Bookings per event - Bar */}
          <div className="card chart-card col-8">
            <h3 className="chart-title">📊 Bookings Per Event</h3>
            <div className="chart-wrap">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {/* Category Distribution - Doughnut */}
          <div className="card chart-card col-4">
            <h3 className="chart-title">🍩 Category Distribution</h3>
            <div className="chart-wrap" style={{ maxHeight: 280 }}>
              <Doughnut data={doughnutData} options={dOptions} />
            </div>
          </div>

          {/* Revenue over time - Line */}
          <div className="card chart-card col-8">
            <h3 className="chart-title">📈 Revenue (Last 7 Days)</h3>
            <div className="chart-wrap">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          {/* Most Viewed Events */}
          <div className="card col-4">
            <h3 className="chart-title">👁️ Most Viewed Events</h3>
            <div className="most-viewed-list">
              {(data?.most_viewed || []).map((mv, i) => (
                <div key={i} className="most-viewed-row">
                  <span className="mv-rank">#{i+1}</span>
                  <div className="mv-info">
                    <div className="mv-name">{mv.title?.substring(0,28)}</div>
                    <div className="mv-score">⚡ {parseFloat(mv.engagement_score || 0).toFixed(1)} score</div>
                  </div>
                  <span className="mv-views">{mv.views} 👁️</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Bookings */}
          <div className="card col-12">
            <h3 className="chart-title">🏫 Department-wise Bookings</h3>
            <div className="dept-bars">
              {(charts.deptBookings || []).map((d, i) => {
                const max = Math.max(...(charts.deptBookings?.map(x => x.bookings) || [1]));
                const pct = (d.bookings / max) * 100;
                const colors = ['#6C63FF','#FF7A59','#00A8A8','#FFB347','#E91E8C','#10B981'];
                return (
                  <div key={i} className="dept-bar-row">
                    <span className="dept-bar-label">{d.department || 'Unknown'}</span>
                    <div className="dept-bar-track">
                      <div className="dept-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="dept-bar-count">{d.bookings}</span>
                  </div>
                );
              })}
              {(!charts.deptBookings || charts.deptBookings.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No booking data yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
