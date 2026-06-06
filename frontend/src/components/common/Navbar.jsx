import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" style={{ fontSize: '1.5rem' }} to="/">
          <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mini LMS
          </span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <FaBars />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/courses">Courses</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-light p-0" onClick={toggleTheme}>
              {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} className="text-dark" />}
            </button>
            
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-outline-light">Login</Link>
                <Link to="/register" className="btn btn-primary-gradient">Register</Link>
              </>
            ) : (
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                  My Account
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                  <li>
                    {isAdmin ? (
                      <Link className="dropdown-item" to="/admin/dashboard">Dashboard</Link>
                    ) : (
                      <Link className="dropdown-item" to="/student/dashboard">Dashboard</Link>
                    )}
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
