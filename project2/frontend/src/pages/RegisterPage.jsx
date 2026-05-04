import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { register, saveAuth } from '../services/authService';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './AuthPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Password > 5 chars required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register(form);
      saveAuth(res.data.token, res.data.user);
      toast.success('Registration successful! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      const { token, user } = res.data;
      saveAuth(token, user);
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-bento">
          <div className="auth-left bg-pink">
            <div className="auth-brand">
              <span className="brand-icon-lg">🎓</span>
              <h1>Campus Cultural</h1>
              <p>Your journey starts here.</p>
            </div>
            <div className="auth-feature-list">
              {['Exclusive college events', 'Tech, Arts, Seminars', 'Connect & Network'].map((f, i) => (
                <div key={i} className="auth-feature"><span>✨</span><span>{f}</span></div>
              ))}
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-header">
              <h2>Join the club</h2>
              <p>Create an account to book tickets.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="reg-name" type="text" autoComplete="off" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                {errors.name && <div className="form-error">⚠️ {errors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email Address</label>
                  <input id="reg-email" type="email" autoComplete="new-email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="hi@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Department</label>
                  <select id="reg-dept" className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="">Any</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="reg-password" type="password" autoComplete="new-password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
              </div>

              <button id="reg-submit-btn" type="submit" className="btn btn-dark w-full" disabled={loading} style={{ padding: '16px', fontSize: '1.1rem' }}>
                {loading ? '⏳ Creating...' : 'Create Account →'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="google-login-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Registration Failed')}
                useOneTap
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <div className="auth-footer-links">
              <span>Already a member?</span> 
              <Link to="/login">Sign In here</Link>
            </div>
            
            <div className="auth-footer-links" style={{ marginTop: 24, fontSize: '0.8rem' }}>
              <Link to="/admin/login" style={{ color: 'var(--c-maroon)', opacity: 0.6 }}>Admin Portal Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
