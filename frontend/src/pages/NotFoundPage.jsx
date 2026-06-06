import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--bg-dark)' }}>
      <div className="text-center p-5 glass-card">
        <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
        <h3 className="text-light mb-4">Page Not Found</h3>
        <p className="text-secondary mb-4">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary-gradient">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
