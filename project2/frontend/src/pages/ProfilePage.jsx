import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProfile, updateProfile, uploadProfilePic } from '../services/profileService';
import { saveAuth, getUser } from '../services/authService';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const DEPARTMENTS = [
  'Computer Science', 'Information Science', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Biotechnology', 'Chemical Engineering', 'Aerospace Engineering',
  'Management', 'Arts & Culture', 'Mathematics', 'Physics', 'Chemistry', 'Other'
];

const YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year / PG' },
];

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [picPreview, setPicPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setProfile(res.data.user);
        setForm(res.data.user);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const res = await updateProfile({
        name: form.name,
        department: form.department,
        vtu_number: form.vtu_number,
        college: form.college,
        year_of_study: form.year_of_study,
        phone: form.phone,
        bio: form.bio,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
      });
      setProfile(res.data.user);
      setForm(res.data.user);
      // Sync localStorage user name
      const localUser = getUser();
      if (localUser) saveAuth(localStorage.getItem('token'), { ...localUser, name: res.data.user.name, department: res.data.user.department });
      toast.success('✅ Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await uploadProfilePic(file);
      setProfile(p => ({ ...p, profile_pic: res.data.profile_pic }));
      
      const localUser = getUser();
      if (localUser) saveAuth(localStorage.getItem('token'), { ...localUser, profile_pic: res.data.profile_pic });
      
      toast.success('📸 Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload image');
      setPicPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const getAvatarSrc = () => {
    if (picPreview) return picPreview;
    if (profile?.profile_pic) return `http://localhost:5000${profile.profile_pic}`;
    return null;
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return <div><Navbar /><div style={{ padding: 80, textAlign: 'center' }}><div className="spinner" /></div></div>;

  const avatarSrc = getAvatarSrc();

  return (
    <div className="page-enter">
      <Navbar />
      <main className="profile-main">
        <div className="profile-breadcrumb">
          <Link to="/">Home</Link> › <span>My Profile</span>
        </div>

        <div className="profile-layout">
          {/* Sidebar Card */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-initials">
                    {getInitials(profile?.name)}
                  </div>
                )}
                {uploading && <div className="avatar-upload-overlay"><div className="spinner-sm" /></div>}
              </div>
              <button
                className="avatar-edit-btn"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                title="Change photo"
                id="change-photo-btn"
              >
                📷
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePicChange}
                id="profile-pic-input"
              />
            </div>

            <h2 className="profile-name">{profile?.name}</h2>
            <span className={`profile-role-badge role-${profile?.role}`}>{profile?.role?.toUpperCase()}</span>

            <div className="profile-meta-list">
              {profile?.email && (
                <div className="profile-meta-item">
                  <span className="meta-icon">📧</span>
                  <span className="meta-text">{profile.email}</span>
                </div>
              )}
              {profile?.department && (
                <div className="profile-meta-item">
                  <span className="meta-icon">🏛️</span>
                  <span className="meta-text">{profile.department}</span>
                </div>
              )}
              {profile?.year_of_study && (
                <div className="profile-meta-item">
                  <span className="meta-icon">📚</span>
                  <span className="meta-text">{YEARS.find(y => y.value === Number(profile.year_of_study))?.label || `Year ${profile.year_of_study}`}</span>
                </div>
              )}
              {profile?.vtu_number && (
                <div className="profile-meta-item">
                  <span className="meta-icon">🎓</span>
                  <span className="meta-text">VTU: {profile.vtu_number}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="profile-meta-item">
                  <span className="meta-icon">📞</span>
                  <span className="meta-text">{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="profile-socials">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-btn linkedin" id="linkedin-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
              )}
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="social-btn github" id="github-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub
                </a>
              )}
            </div>

            {profile?.bio && (
              <div className="profile-bio">
                <p>"{profile.bio}"</p>
              </div>
            )}

            <div className="profile-joined">
              Member since {new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </aside>

          {/* Edit Form */}
          <section className="profile-content">
            <div className="profile-card">
              <div className="profile-card-header">
                <h3>📋 Profile Information</h3>
                {!editMode ? (
                  <button className="btn btn-dark btn-sm" onClick={() => setEditMode(true)} id="edit-profile-btn">
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditMode(false); setForm(profile); }} id="cancel-edit-btn">
                    ✕ Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} id="profile-form">
                <div className="profile-form-grid">
                  {/* Full Name */}
                  <div className="pf-group span-2">
                    <label className="pf-label">Full Name *</label>
                    {editMode ? (
                      <input name="name" className="pf-input" value={form.name || ''} onChange={handleChange} placeholder="Your full name" required id="profile-name-input" />
                    ) : (
                      <div className="pf-value">{profile?.name || '—'}</div>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div className="pf-group span-2">
                    <label className="pf-label">Email Address</label>
                    <div className="pf-value pf-readonly">
                      {profile?.email}
                      <span className="pf-readonly-tag">Not editable</span>
                    </div>
                  </div>

                  {/* VTU Number */}
                  <div className="pf-group">
                    <label className="pf-label">VTU Registration Number</label>
                    {editMode ? (
                      <input name="vtu_number" className="pf-input" value={form.vtu_number || ''} onChange={handleChange} placeholder="e.g. 1XX21CS001" id="profile-vtu-input" />
                    ) : (
                      <div className="pf-value">{profile?.vtu_number || <span className="pf-empty">Not set</span>}</div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="pf-group">
                    <label className="pf-label">Phone Number</label>
                    {editMode ? (
                      <input name="phone" className="pf-input" value={form.phone || ''} onChange={handleChange} placeholder="+91 9876543210" id="profile-phone-input" />
                    ) : (
                      <div className="pf-value">{profile?.phone || <span className="pf-empty">Not set</span>}</div>
                    )}
                  </div>

                  {/* College */}
                  <div className="pf-group span-2">
                    <label className="pf-label">College / Institution</label>
                    {editMode ? (
                      <input name="college" className="pf-input" value={form.college || ''} onChange={handleChange} placeholder="Visvesvaraya Technological University" id="profile-college-input" />
                    ) : (
                      <div className="pf-value">{profile?.college || <span className="pf-empty">Not set</span>}</div>
                    )}
                  </div>

                  {/* Department */}
                  <div className="pf-group">
                    <label className="pf-label">Department</label>
                    {editMode ? (
                      <select name="department" className="pf-input pf-select" value={form.department || ''} onChange={handleChange} id="profile-dept-select">
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <div className="pf-value">{profile?.department || <span className="pf-empty">Not set</span>}</div>
                    )}
                  </div>

                  {/* Year of Study */}
                  <div className="pf-group">
                    <label className="pf-label">Year of Study</label>
                    {editMode ? (
                      <select name="year_of_study" className="pf-input pf-select" value={form.year_of_study || ''} onChange={handleChange} id="profile-year-select">
                        <option value="">Select Year</option>
                        {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                      </select>
                    ) : (
                      <div className="pf-value">
                        {profile?.year_of_study
                          ? YEARS.find(y => y.value === Number(profile.year_of_study))?.label || `Year ${profile.year_of_study}`
                          : <span className="pf-empty">Not set</span>}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div className="pf-group">
                    <label className="pf-label">LinkedIn URL</label>
                    {editMode ? (
                      <input name="linkedin_url" className="pf-input" value={form.linkedin_url || ''} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" id="profile-linkedin-input" />
                    ) : (
                      <div className="pf-value">
                        {profile?.linkedin_url
                          ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="pf-link">🔗 LinkedIn Profile</a>
                          : <span className="pf-empty">Not set</span>}
                      </div>
                    )}
                  </div>

                  {/* GitHub */}
                  <div className="pf-group">
                    <label className="pf-label">GitHub URL</label>
                    {editMode ? (
                      <input name="github_url" className="pf-input" value={form.github_url || ''} onChange={handleChange} placeholder="https://github.com/yourname" id="profile-github-input" />
                    ) : (
                      <div className="pf-value">
                        {profile?.github_url
                          ? <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="pf-link">🐙 GitHub Profile</a>
                          : <span className="pf-empty">Not set</span>}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="pf-group span-2">
                    <label className="pf-label">Bio / About You</label>
                    {editMode ? (
                      <textarea
                        name="bio"
                        className="pf-input pf-textarea"
                        value={form.bio || ''}
                        onChange={handleChange}
                        placeholder="Tell something about yourself..."
                        rows={3}
                        id="profile-bio-input"
                      />
                    ) : (
                      <div className="pf-value">{profile?.bio || <span className="pf-empty">Not set</span>}</div>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="profile-save-row">
                    <button type="submit" className="btn btn-dark btn-lg" disabled={saving} id="save-profile-btn">
                      {saving ? '⏳ Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Quick Links */}
            <div className="profile-quicklinks">
              <Link to="/bookings" className="quicklink-card" id="profile-bookings-link">
                <span className="ql-icon">🎫</span>
                <span className="ql-label">My Bookings</span>
              </Link>
              <Link to="/dashboard" className="quicklink-card" id="profile-dashboard-link">
                <span className="ql-icon">📊</span>
                <span className="ql-label">Dashboard</span>
              </Link>
              <Link to="/events" className="quicklink-card" id="profile-events-link">
                <span className="ql-icon">🗓️</span>
                <span className="ql-label">Browse Events</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
