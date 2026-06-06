import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaBars } from 'react-icons/fa';
import Sidebar from '../common/Sidebar';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { path: '/student/dashboard', icon: <FaHome />, label: 'Dashboard', exact: true },
    { path: '/student/courses', icon: <FaBook />, label: 'My Courses' },
    { path: '/student/profile', icon: <FaUser />, label: 'My Profile' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar links={links} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <div className="d-md-none mb-4">
          <button className="btn btn-primary" onClick={() => setSidebarOpen(true)}>
            <FaBars /> Menu
          </button>
        </div>
        
        <div className="fade-in">
          <Outlet />
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-md-none" 
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;
