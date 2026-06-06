import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    const res = await register(formData);
    
    if (res.success) {
      toast.success('Registration successful! Welcome to Mini LMS.');
      navigate('/student/dashboard');
    } else {
      // Handle validation errors (could be an object or string)
      if (typeof res.error === 'object') {
        const firstError = Object.values(res.error)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(res.error || 'Registration failed');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ background: 'var(--bg-dark)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 fade-in">
            <div className="glass-card p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-light">Create an Account</h2>
                <p className="text-secondary">Join Mini LMS and start learning today</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-secondary">Full Name</label>
                  <div className="position-relative">
                    <FaUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input 
                      type="text" 
                      className="form-control form-control-custom ps-5" 
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required 
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label text-secondary">Password</label>
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
                  <div className="col-md-6 mb-4">
                    <label className="form-label text-secondary">Confirm Password</label>
                    <div className="position-relative">
                      <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                      <input 
                        type="password" 
                        className="form-control form-control-custom ps-5" 
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-text text-secondary mb-4 opacity-75">
                  Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character.
                </div>
                
                <button type="submit" className="btn btn-primary-gradient w-100 py-3 mb-4" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
              
              <div className="text-center text-secondary">
                Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
