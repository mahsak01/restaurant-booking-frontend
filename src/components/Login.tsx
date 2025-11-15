import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/api';
import { setToken, setUserRole, isAuthenticated, isAdmin } from '../utils/auth';
import './Login.css';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      navigate('/');
    }
    
    // Check if there's an error message from redirect
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      setError(errorMsg);
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ phone, password });
      
      // Check if user is admin
      if (response.data.user.role !== 'admin') {
        setError('شما دسترسی به این بخش را ندارید. فقط مدیران می‌توانند وارد شوند.');
        setLoading(false);
        return;
      }
      
      // Save token and user role to localStorage
      setToken(response.data.token);
      setUserRole(response.data.user.role);
      
      // Redirect to home or dashboard
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>ورود به سیستم</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">شماره تلفن</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+989100364536"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

