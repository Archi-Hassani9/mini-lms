import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaTasks, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';
import { analyticsApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getAdminStats();
        if (res.success) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <div className="text-center p-5 text-secondary">Failed to load dashboard</div>;

  return (
    <div>
      <div className="mb-4 fade-in">
        <h2 className="fw-bold mb-1">Admin Dashboard</h2>
        <p className="text-secondary mb-0">Overview of system performance and activity.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Total Students</p>
                <h3 className="stat-number mb-0">{stats.stats.total_students}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <FaUsers size={24} />
              </div>
            </div>
            <div className="small text-success d-flex align-items-center gap-1">
              <FaChartBar /> +12% from last month
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Total Courses</p>
                <h3 className="stat-number mb-0">{stats.stats.total_courses}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <FaBook size={24} />
              </div>
            </div>
            <div className="small text-success d-flex align-items-center gap-1">
              <FaChartBar /> +3 new courses
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Total Enrollments</p>
                <h3 className="stat-number mb-0">{stats.stats.total_enrollments}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <FaChartBar size={24} />
              </div>
            </div>
            <div className="small text-success d-flex align-items-center gap-1">
              <FaChartBar /> +8% from last month
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Total Submissions</p>
                <h3 className="stat-number mb-0">{stats.stats.total_submissions}</h3>
              </div>
              <div className="bg-accent bg-opacity-10 text-accent p-3 rounded-circle">
                <FaTasks size={24} />
              </div>
            </div>
            <div className="small text-secondary d-flex align-items-center gap-1">
              Awaiting review
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8 fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4">Course Popularity</h4>
            <div className="table-responsive table-custom">
              <table className="table table-borderless m-0">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th className="text-center">Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.popular_courses.map((course, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium">{course.title}</td>
                      <td><span className="badge bg-secondary bg-opacity-25 text-theme-primary">{course.category}</span></td>
                      <td className="text-center fw-bold text-primary">{course.enrollments}</td>
                    </tr>
                  ))}
                  {stats.popular_courses.length === 0 && (
                    <tr><td colSpan="3" className="text-center text-secondary py-4">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-4 fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4">System Overview</h4>
            
            <div className="d-flex flex-column gap-4">
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Storage Used</span>
                  <span className="text-light fw-bold">45%</span>
                </div>
                <div className="progress-custom bg-dark border border-secondary border-opacity-25">
                  <div className="progress-fill bg-primary" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Server Load</span>
                  <span className="text-light fw-bold">28%</span>
                </div>
                <div className="progress-custom bg-dark border border-secondary border-opacity-25">
                  <div className="progress-fill bg-success" style={{ width: '28%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Database Connections</span>
                  <span className="text-light fw-bold">12 / 100</span>
                </div>
                <div className="progress-custom bg-dark border border-secondary border-opacity-25">
                  <div className="progress-fill bg-accent" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
