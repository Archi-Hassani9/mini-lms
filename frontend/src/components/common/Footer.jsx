import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-5 pb-4 mt-5" style={{ background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-light fw-bold mb-3">Mini LMS</h5>
            <p className="text-secondary">
              A modern Learning Management System designed to provide quality education and seamless learning experiences.
            </p>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/courses" className="text-secondary text-decoration-none">Courses</Link></li>
              <li className="mb-2"><Link to="/about" className="text-secondary text-decoration-none">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-secondary text-decoration-none">Contact</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="#" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
              <li className="mb-2"><Link to="#" className="text-secondary text-decoration-none">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-12">
            <h6 className="text-light fw-bold mb-3">Subscribe to Newsletter</h6>
            <div className="input-group mb-3">
              <input type="email" className="form-control form-control-custom" placeholder="Email address" />
              <button className="btn btn-primary-gradient" type="button">Subscribe</button>
            </div>
          </div>
        </div>
        <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />
        <div className="text-center text-secondary">
          <small>&copy; {new Date().getFullYear()} Mini LMS. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
