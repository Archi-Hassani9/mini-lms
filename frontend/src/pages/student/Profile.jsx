import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';

const Profile = () => {
  const { user, updateProfileContext } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData = { full_name: formData.full_name, email: formData.email };
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const res = await authApi.updateProfile(updateData);
      if (res.success) {
        toast.success('Profile updated successfully');
        updateProfileContext(res.user);
        setFormData({ ...formData, current_password: '', new_password: '', confirm_password: '' });
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error(err.data?.errors?.non_field_errors?.[0] || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-secondary mb-0">Manage your account settings and preferences.</p>
      </div>

      <div className="glass-card p-4 p-md-5">
        <div className="d-flex flex-column align-items-center mb-5 pb-4 border-bottom border-secondary border-opacity-25">
          <div className="position-relative mb-3">
            <div className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white fw-bold" style={{ width: 120, height: 120, fontSize: '3rem' }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <button className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 shadow d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <FaCamera className="text-primary" />
            </button>
          </div>
          <h4 className="fw-bold text-light mb-1">{user?.full_name}</h4>
          <span className="badge bg-secondary bg-opacity-25 text-light">{user?.role?.name}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <h5 className="fw-bold text-light mb-4">Personal Information</h5>
          
          <div className="row g-4 mb-5">
            <div className="col-md-6">
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
                />
              </div>
            </div>
            
            <div className="col-md-6">
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
                />
              </div>
            </div>
          </div>

          <h5 className="fw-bold text-light mb-4">Change Password</h5>
          <p className="text-secondary small mb-4">Leave fields blank if you don't want to change your password.</p>
          
          <div className="row g-4 mb-5">
            <div className="col-md-12">
              <label className="form-label text-secondary">Current Password</label>
              <div className="position-relative">
                <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="password" 
                  className="form-control form-control-custom ps-5" 
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label text-secondary">New Password</label>
              <div className="position-relative">
                <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="password" 
                  className="form-control form-control-custom ps-5" 
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label text-secondary">Confirm New Password</label>
              <div className="position-relative">
                <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="password" 
                  className="form-control form-control-custom ps-5" 
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary-gradient px-4 py-2" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
