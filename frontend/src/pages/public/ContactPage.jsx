import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="container py-5 mt-4">
      <div className="text-center mb-5 fade-in">
        <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
        <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="row g-5">
        <div className="col-lg-4 fade-in">
          <div className="glass-card p-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                <FaMapMarkerAlt size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Our Office</h5>
                <p className="text-secondary mb-0">123 Education Lane, Tech City, TC 10001</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Email Us</h5>
                <p className="text-secondary mb-0">support@minilms.com</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle me-3">
                <FaPhoneAlt size={24} />
              </div>
              <div>
                <h5 className="mb-1 fw-bold">Call Us</h5>
                <p className="text-secondary mb-0">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8 fade-in">
          <div className="glass-card p-5 h-100">
            <h3 className="fw-bold mb-4">Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Your Name</label>
                    <input type="text" className="form-control form-control-custom" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Email Address</label>
                    <input type="email" className="form-control form-control-custom" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Subject</label>
                    <input type="text" className="form-control form-control-custom" name="subject" value={formData.subject} onChange={handleChange} required />
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-4">
                    <label className="form-label text-secondary">Message</label>
                    <textarea className="form-control form-control-custom" rows="5" name="message" value={formData.message} onChange={handleChange} required></textarea>
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary-gradient w-100 py-3" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
