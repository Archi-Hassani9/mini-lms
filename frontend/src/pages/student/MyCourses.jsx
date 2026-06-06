import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaCertificate } from 'react-icons/fa';
import { enrollmentApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import CertificateModal from '../../components/common/CertificateModal';
import { useAuth } from '../../context/AuthContext';

const MyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await enrollmentApi.getMyEnrollments();
        if (res.success) {
          setEnrollments(res.enrollments);
        }
      } catch (err) {
        console.error("Failed to load enrollments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handleShowCertificate = (course) => {
    setSelectedCourse(course);
    setShowCertificate(true);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-5 fade-in">
        <h2 className="fw-bold mb-1">My Learning Journey</h2>
        <p className="text-secondary mb-0">Track your progress and access your courses.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center p-5 glass-card fade-in">
          <FaPlayCircle size={48} className="text-secondary mb-3 opacity-50" />
          <h3 className="text-light mb-3">You haven't enrolled in any courses</h3>
          <p className="text-secondary mb-4">Start your learning journey by exploring our available courses.</p>
          <Link to="/courses" className="btn btn-primary-gradient">Browse Courses</Link>
        </div>
      ) : (
        <div className="row g-4 fade-in">
          {enrollments.map((enrollment) => (
            <div className="col-md-6 col-lg-4" key={enrollment.id}>
              <div className="glass-card h-100 d-flex flex-column overflow-hidden">
                <img 
                  src={enrollment.course_detail.thumbnail || 'https://via.placeholder.com/400x200'} 
                  alt={enrollment.course_detail.title} 
                  className="w-100 object-fit-cover"
                  style={{ height: '160px' }}
                />
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <span className="badge bg-primary bg-opacity-10 text-primary align-self-start mb-2 px-2 py-1">
                    {enrollment.course_detail.category}
                  </span>
                  <h5 className="fw-bold text-light mb-3">{enrollment.course_detail.title}</h5>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small text-secondary">Progress</span>
                      <span className="small fw-bold text-primary">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="progress-custom mb-4">
                      <div className="progress-fill bg-primary" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <Link to={`/student/courses/${enrollment.course}/learn`} className="btn btn-outline-light flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                        <FaPlayCircle /> {enrollment.progress_percentage === 0 ? 'Start Course' : 'Continue'}
                      </Link>
                      
                      {enrollment.progress_percentage >= 100 && (
                        <button 
                          className="btn btn-outline-success" 
                          title="View Certificate"
                          onClick={() => handleShowCertificate(enrollment.course_detail)}
                        >
                          <FaCertificate />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal 
        show={showCertificate} 
        onClose={() => setShowCertificate(false)} 
        course={selectedCourse} 
        student={user} 
      />
    </div>
  );
};

export default MyCourses;
