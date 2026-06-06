import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await login(formData.email, formData.password);
    
    if (res.success) {
      toast.success('Login successful!');
      navigate(from === '/' ? '/student/dashboard' : from, { replace: true });
    } else {
      toast.error(res.error || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ background: 'var(--bg-dark)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5 fade-in">
            <div className="glass-card p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-light">Welcome Back</h2>
                <p className="text-secondary">Please sign in to your account</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-secondary">Email Address</label>
                  <div className="position-relative">
                    <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input 
                      type="email" 
                      className="form-control form-control-custom ps-5" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label text-secondary mb-0">Password</label>
                    <a href="#" className="small text-primary text-decoration-none">Forgot password?</a>
                  </div>
                  <div className="position-relative">
                    <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input 
                      type="password" 
                      className="form-control form-control-custom ps-5" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary-gradient w-100 py-3 mb-4" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              
              <div className="text-center text-secondary">
                Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-bold">Sign up</Link>
              </div>
              
              <div className="mt-4 pt-3 border-top border-secondary opacity-50 text-center small text-secondary">
                <p className="mb-1">Demo Credentials:</p>
                <p className="mb-0">Admin: admin@lms.com / Admin@123</p>
                <p className="mb-0">Student: john.doe@student.com / Student@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
