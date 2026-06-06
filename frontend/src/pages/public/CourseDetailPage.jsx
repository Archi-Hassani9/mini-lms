import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlayCircle, FaCheckCircle, FaUser, FaCalendarAlt, FaTasks, FaLaptopCode, FaCertificate } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { courseApi, enrollmentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getById(id);
        if (res.success !== false) { // Backend usually returns object directly or {success:true, ...}
          setCourse(res.course || res);
        }
      } catch (err) {
        console.error('Failed to fetch course details', err);
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }
    
    if (!isStudent) {
      toast.error('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      const res = await enrollmentApi.enroll(id);
      if (res.success) {
        toast.success(res.message);
        // Refresh course to get updated is_enrolled status
        const updatedCourse = await courseApi.getById(id);
        setCourse(updatedCourse.course || updatedCourse);
      }
    } catch (err) {
      toast.error(err.data?.errors?.course || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!course) return null;

  return (
    <div>
      {/* Header Banner */}
      <div className="bg-dark text-white py-5" style={{ background: 'linear-gradient(to right, var(--bg-sidebar), var(--bg-card))' }}>
        <div className="container py-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8 fade-in">
              <span className="badge bg-primary mb-3 px-3 py-2 fs-6">{course.category}</span>
              <h1 className="display-5 fw-bold mb-3">{course.title}</h1>
              <p className="lead text-light opacity-75 mb-4">{course.description}</p>
              
              <div className="d-flex flex-wrap gap-4 mb-4 text-light opacity-75">
                <div className="d-flex align-items-center gap-2">
                  <FaUser /> Created by {course.created_by_name || 'Instructor'}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaPlayCircle /> {course.lesson_count || 0} Lessons
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCalendarAlt /> Last updated: {new Date(course.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 text-center text-lg-end fade-in">
              <div className="glass-card p-4 d-inline-block text-start w-100" style={{ maxWidth: '350px' }}>
                <img 
                  src={course.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Image'} 
                  alt={course.title} 
                  className="img-fluid rounded mb-4 w-100 object-fit-cover"
                  style={{ height: '180px' }}
                />
                
                {course.is_enrolled ? (
                  <>
                    <div className="alert alert-success d-flex align-items-center mb-3">
                      <FaCheckCircle className="me-2" /> You are enrolled
                    </div>
                    <Link to={`/student/courses/${course.id}/learn`} className="btn btn-primary-gradient w-100 py-2">
                      Go to Course Content
                    </Link>
                  </>
                ) : (
                  <button 
                    onClick={handleEnroll} 
                    disabled={enrolling || (isAuthenticated && !isStudent)}
                    className="btn btn-primary-gradient w-100 py-3 fw-bold fs-5 shadow"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now Free'}
                  </button>
                )}
                
                {!isAuthenticated && (
                  <div className="text-center mt-3 small text-secondary">
                    <Link to="/login" className="text-primary text-decoration-none">Log in</Link> to enroll
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-8">
            <h3 className="fw-bold mb-4">Course Content</h3>
            
            {course.lessons && course.lessons.length > 0 ? (
              <div className="accordion glass-card p-3" id="courseAccordion">
                {course.lessons.map((lesson, idx) => (
                  <div className="accordion-item bg-transparent border-secondary" key={lesson.id}>
                    <h2 className="accordion-header">
                      <button className={`accordion-button ${idx !== 0 ? 'collapsed' : ''} bg-transparent text-light`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`}>
                        <div className="d-flex align-items-center">
                          <span className="me-3 text-secondary">Lesson {lesson.order_no}</span>
                          <span className="fw-bold">{lesson.title}</span>
                        </div>
                      </button>
                    </h2>
                    <div id={`collapse${idx}`} className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} data-bs-parent="#courseAccordion">
                      <div className="accordion-body text-secondary">
                        {course.is_enrolled ? (
                          <>
                            {lesson.content && <p>{lesson.content.substring(0, 150)}...</p>}
                            <Link to={`/student/courses/${course.id}/learn`} className="text-primary text-decoration-none">
                              Start learning <FaPlayCircle className="ms-1" />
                            </Link>
                          </>
                        ) : (
                          <div className="text-center py-3">
                            <FaPlayCircle size={30} className="text-secondary mb-2" />
                            <p>Enroll to view this lesson</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary">Course content is being prepared.</p>
            )}

            {course.is_enrolled && (
              <div className="mt-5 glass-card p-4">
                <h4 className="fw-bold d-flex align-items-center mb-3"><FaTasks className="me-2 text-primary" /> Assignments</h4>
                <p className="text-secondary mb-3">This course includes assignments to test your knowledge.</p>
                <Link to={`/student/courses/${course.id}/learn`} className="btn btn-outline-primary">View Assignments</Link>
              </div>
            )}
          </div>
          
          <div className="col-lg-4">
            <h4 className="fw-bold mb-4">What you'll get</h4>
            <ul className="list-group list-group-flush bg-transparent">
              <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                <FaPlayCircle className="me-2 text-primary" /> Full lifetime access
              </li>
              <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                <FaLaptopCode className="me-2 text-primary" /> Access on mobile and desktop
              </li>
              <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                <FaTasks className="me-2 text-primary" /> Practical assignments
              </li>
              <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                <FaCertificate className="me-2 text-primary" /> Certificate of completion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
