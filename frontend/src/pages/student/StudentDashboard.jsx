import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaTasks, FaChartLine, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getStudentStats();
        if (res.success) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
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
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h2>
          <p className="text-secondary mb-0">Here's what's happening with your learning journey.</p>
        </div>
        <Link to="/courses" className="btn btn-primary-gradient d-none d-sm-block">Browse More Courses</Link>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Enrolled Courses</p>
                <h3 className="stat-number mb-0">{stats.stats.enrolled_courses_count}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <FaBookOpen size={24} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Completed Assignments</p>
                <h3 className="stat-number mb-0">{stats.stats.completed_assignments}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <FaCheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Pending Assignments</p>
                <h3 className="stat-number mb-0">{stats.stats.pending_assignments}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                <FaTasks size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3 fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-secondary mb-1">Average Progress</p>
                <h3 className="stat-number mb-0">{stats.stats.average_progress}%</h3>
              </div>
              <div className="bg-accent bg-opacity-10 text-accent p-3 rounded-circle">
                <FaChartLine size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Continue Learning */}
        <div className="col-xl-8 fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Continue Learning</h4>
              <Link to="/student/courses" className="btn btn-sm btn-outline-secondary">View All</Link>
            </div>
            
            {stats.courses_with_progress.length > 0 ? (
              <div className="d-flex flex-column gap-4">
                {stats.courses_with_progress.slice(0, 3).map((course, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-4 p-3 rounded border border-secondary border-opacity-25" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="d-none d-sm-block rounded overflow-hidden" style={{ width: 100, height: 70 }}>
                      <img 
                        src={course.thumbnail || 'https://via.placeholder.com/100x70'} 
                        alt={course.title} 
                        className="w-100 h-100 object-fit-cover" 
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <h6 className="fw-bold mb-0 text-light">{course.title}</h6>
                        <span className="small text-primary">{course.progress_percentage}%</span>
                      </div>
                      <div className="progress-custom mb-2">
                        <div className="progress-fill" style={{ width: `${course.progress_percentage}%` }}></div>
                      </div>
                      <Link to={`/student/courses/${course.course_id}/learn`} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 mt-1">
                        <FaPlayCircle /> Resume Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-secondary mb-3">You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-xl-4 fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4">Recent Submissions</h4>
            {stats.recent_activity.length > 0 ? (
              <div className="position-relative">
                {stats.recent_activity.map((activity, idx) => (
                  <div key={idx} className="d-flex gap-3 mb-4 position-relative z-1">
                    <div className="mt-1">
                      <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${
                        activity.status === 'Reviewed' ? 'bg-success text-white' : 
                        activity.status === 'Rejected' ? 'bg-danger text-white' : 
                        'bg-primary text-white'
                      }`} style={{ width: 32, height: 32 }}>
                        {activity.status === 'Reviewed' ? <FaCheckCircle size={14} /> : <FaTasks size={14} />}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-light fw-bold">{activity.assignment}</p>
                      <p className="mb-1 text-secondary small">{activity.course}</p>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge-status badge-${activity.status.toLowerCase()}`}>{activity.status}</span>
                        <small className="text-secondary">{new Date(activity.date).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-secondary">No recent submissions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
