import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, adminLogin, saveAuth } from '../services/authService';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import './AuthPage.css';

const LoginPage = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = isAdmin ? await adminLogin(form) : await login(form);
      const { token, user, admin } = res.data;
      saveAuth(token, user || { ...admin, role: 'admin' });
      toast.success(`Welcome back, ${(user || admin).name}! 🎉`);
      navigate(isAdmin ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-bento">
          <div className={`auth-left ${isAdmin ? 'bg-orange' : 'bg-blue'}`}>
            <div className="auth-brand">
              <span className="brand-icon-lg">{isAdmin ? '🛠️' : '🎪'}</span>
              <h1>EventBook</h1>
              <p>{isAdmin ? 'Admin Intelligence System' : 'Your college event platform'}</p>
            </div>
            <div className="auth-feature-list">
              {isAdmin 
                ? ['Manage campus events', 'Track live analytics', 'Handle waitlists'].map((f, i) => <div key={i} className="auth-feature"><span>⚡</span><span>{f}</span></div>)
                : ['Discover exciting events', 'Book tickets instantly', 'Join waitlists'].map((f, i) => <div key={i} className="auth-feature"><span>✅</span><span>{f}</span></div>)
              }
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-header">
              <h2>{isAdmin ? 'Admin Login' : 'Welcome Back'}</h2>
              <p>{isAdmin ? 'Access the control panel.' : 'Sign in to your account.'}</p>
            </div>

            <div className="demo-creds">
              <span>🧪 Demo:</span>
              <code>{isAdmin ? 'admin@eventbooking.com / admin123' : 'register a test user'}</code>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input id="login-email" type="email" autoComplete="new-email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="hi@eventbook.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                {errors.email && <div className="form-error">⚠️ {errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="login-password" type="password" autoComplete="new-password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                {errors.password && <div className="form-error">⚠️ {errors.password}</div>}
              </div>

              <button id="login-submit-btn" type="submit" className="btn btn-dark w-full" disabled={loading} style={{ padding: '16px', fontSize: '1.1rem' }}>
                {loading ? '⏳...' : isAdmin ? 'Unlock Dashboard' : 'Dive In →'}
              </button>
            </form>

            <div className="auth-footer-links">
              {!isAdmin ? (
                <><span>New here?</span> <Link to="/register">Create an account</Link></>
              ) : (
                <Link to="/login">Switch to User Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
