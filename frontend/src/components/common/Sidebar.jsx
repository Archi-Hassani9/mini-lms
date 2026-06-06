import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';

const Sidebar = ({ links, isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="d-flex justify-content-between align-items-center px-4 mb-4 d-md-none">
        <h5 className="m-0 fw-bold text-light">Menu</h5>
        <button className="btn btn-link text-light p-0" onClick={toggleSidebar}>
          <FaTimes size={24} />
        </button>
      </div>

      <div className="text-center mb-4 px-4">
        <div className="d-inline-flex justify-content-center align-items-center rounded-circle bg-primary text-white mb-3" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <h6 className="text-light fw-bold m-0">{user?.full_name}</h6>
        <small className="text-secondary">{user?.role?.name}</small>
      </div>

      <div className="d-flex flex-column gap-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 768 && toggleSidebar()}
          >
            <span className="fs-5">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="position-absolute bottom-0 w-100 p-3">
        <button onClick={logout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
