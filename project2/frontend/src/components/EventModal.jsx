import React, { useState, useEffect } from 'react';
import { createEvent, updateEvent } from '../services/eventService';
import { toast } from 'react-toastify';
import './EventModal.css';

const CATEGORIES = ['Workshop', 'Seminar', 'Cultural', 'Technical'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Management', 'Arts & Culture', 'Civil', 'Biotechnology'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['active', 'inactive'];
const TAG_OPTIONS = ['Workshop', 'Seminar', 'Technical', 'Cultural', 'Beginner', 'Advanced', 'Intermediate', 'AI', 'Hackathon', 'Career', 'Art', 'Data Science', 'Fun'];

const defaultForm = {
  title: '', department: '', description: '', venue: '',
  event_date: '', event_time: '', price: 0,
  total_tickets: 100, available_tickets: 100,
  category: 'Workshop', tags: [], status: 'active',
  difficulty_level: 'Beginner', poster: null
};

const EventModal = ({ event, onClose, onSaved }) => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      const parsedTags = event.tags ? (typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags) : [];
      // Fix: slice ISO date string to YYYY-MM-DD format required by <input type="date">
      const formattedDate = event.event_date
        ? new Date(event.event_date).toISOString().split('T')[0]
        : '';
      setForm({ ...defaultForm, ...event, event_date: formattedDate, tags: parsedTags, poster: null });
    } else {
      setForm(defaultForm);
    }
  }, [event]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.event_date) e.event_date = 'Date required';
    if (!form.event_time) e.event_time = 'Time required';
    if (!form.total_tickets || form.total_tickets < 1) e.total_tickets = 'Must have at least 1 ticket';
    if (!form.venue.trim()) e.venue = 'Venue required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'poster') { if (v) fd.append('poster', v); }
        else if (k === 'tags') fd.append('tags', JSON.stringify(v));
        else fd.append(k, v);
      });

      if (event) {
        await updateEvent(event.event_id, fd);
        toast.success('Event updated successfully');
      } else {
        await createEvent(fd);
        toast.success('Event created successfully');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal event-modal">
        <div className="modal-header">
          <h2>{event ? '✏️ Edit Event' : '➕ Create New Event'}</h2>
          <button className="modal-close" onClick={onClose} id="close-event-modal-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit} id="event-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input id="event-title" type="text" className={`form-input ${errors.title ? 'error' : ''}`} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Workshop on Machine Learning" />
              {errors.title && <div className="form-error">⚠️ {errors.title}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select id="event-dept" className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="event-description" className="form-input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Event description..." />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input id="event-venue" type="text" className={`form-input ${errors.venue ? 'error' : ''}`} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="CS Seminar Hall" />
              {errors.venue && <div className="form-error">⚠️ {errors.venue}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select id="event-category" className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input id="event-date" type="date" className={`form-input ${errors.event_date ? 'error' : ''}`} value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
              {errors.event_date && <div className="form-error">⚠️ {errors.event_date}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input id="event-time" type="time" className={`form-input ${errors.event_time ? 'error' : ''}`} value={form.event_time} onChange={e => setForm({...form, event_time: e.target.value})} />
              {errors.event_time && <div className="form-error">⚠️ {errors.event_time}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input id="event-price" type="number" className="form-input" value={form.price} min={0} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Total Tickets *</label>
              <input id="event-total-tickets" type="number" className={`form-input ${errors.total_tickets ? 'error' : ''}`} value={form.total_tickets} min={1} onChange={e => setForm({...form, total_tickets: parseInt(e.target.value) || 0})} />
              {errors.total_tickets && <div className="form-error">⚠️ {errors.total_tickets}</div>}
            </div>
            {event && (
              <div className="form-group">
                <label className="form-label">Available Tickets</label>
                <input id="event-available-tickets" type="number" className="form-input" value={form.available_tickets} min={0} onChange={e => setForm({...form, available_tickets: parseInt(e.target.value) || 0})} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select id="event-difficulty" className="form-input" value={form.difficulty_level} onChange={e => setForm({...form, difficulty_level: e.target.value})}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="event-status" className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Event Tags</label>
            <div className="tag-selector">
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button"
                  className={`filter-pill ${form.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                  id={`tag-${tag}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Poster Upload */}
          <div className="form-group">
            <label className="form-label">Event Poster</label>
            <input id="event-poster" type="file" className="form-input" accept="image/*" onChange={e => setForm({...form, poster: e.target.files[0]})} />
            {event?.poster_url && !form.poster && (
              <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Current: <a href={`http://localhost:5000${event.poster_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-2)' }}>View poster</a>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} id="cancel-event-modal-btn">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-event-btn">
              {saving ? '⏳ Saving...' : event ? '✅ Update Event' : '✅ Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
