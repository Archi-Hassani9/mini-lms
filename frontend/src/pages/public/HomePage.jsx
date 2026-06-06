import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaUserGraduate, FaLaptopCode, FaTasks, FaChartLine, FaCertificate } from 'react-icons/fa';
import CourseCard from '../../components/common/CourseCard';
import { courseApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAll();
        if (res.results) {
          setCourses(res.results.slice(0, 6)); // Top 6 courses
        }
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const features = [
    { icon: <FaBookOpen size={30} />, title: 'Quality Courses', desc: 'Learn from industry experts with up-to-date curriculum.' },
    { icon: <FaUserGraduate size={30} />, title: 'Expert Instructors', desc: 'Get guidance from professionals who have been there.' },
    { icon: <FaLaptopCode size={30} />, title: 'Learn Anywhere', desc: 'Access your courses on any device, anywhere, anytime.' },
    { icon: <FaTasks size={30} />, title: 'Assignments', desc: 'Apply what you learn with practical assignments.' },
    { icon: <FaChartLine size={30} />, title: 'Progress Tracking', desc: 'Monitor your learning journey with detailed analytics.' },
    { icon: <FaCertificate size={30} />, title: 'Certificates', desc: 'Earn verifiable certificates upon completion.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start fade-in">
              <h1 className="display-4 fw-bold text-white mb-4">
                Learn Without Limits
              </h1>
              <p className="lead text-secondary mb-5">
                Master new skills, advance your career, and achieve your goals with Mini LMS. Access high-quality courses taught by industry experts.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Link to="/courses" className="btn btn-primary-gradient btn-lg">Browse Courses</Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">Get Started Free</Link>
              </div>
            </div>
            <div className="col-lg-6 fade-in d-none d-lg-block">
              <div className="glass-card p-4">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Students learning" 
                  className="img-fluid rounded-3" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5 fade-in">
            <h2 className="fw-bold mb-3">Why Choose Mini LMS?</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              We provide everything you need to succeed in your learning journey.
            </p>
          </div>
          <div className="row g-4">
            {features.map((feat, idx) => (
              <div className="col-md-6 col-lg-4 fade-in" key={idx} style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="stat-card text-center h-100">
                  <div className="text-primary mb-3 d-inline-block p-3 rounded-circle" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    {feat.icon}
                  </div>
                  <h4 className="fw-bold text-light mb-3">{feat.title}</h4>
                  <p className="text-secondary mb-0">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Courses */}
      <section className="py-5" style={{ background: 'var(--bg-card)' }}>
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end mb-5 fade-in">
            <div>
              <h2 className="fw-bold mb-2">Latest Courses</h2>
              <p className="text-secondary mb-0">Discover our most recent additions</p>
            </div>
            <Link to="/courses" className="btn btn-outline-primary d-none d-md-block">View All Courses</Link>
          </div>
          
          {loading ? (
            <Spinner />
          ) : (
            <div className="row g-4">
              {courses.map(course => (
                <div className="col-md-6 col-lg-4" key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-5 d-md-none">
            <Link to="/courses" className="btn btn-outline-primary">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 text-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-4 text-white">
              <h2 className="display-4 fw-bold mb-2">500+</h2>
              <h5 className="mb-0 text-white-50">Active Students</h5>
            </div>
            <div className="col-md-4 text-white">
              <h2 className="display-4 fw-bold mb-2">50+</h2>
              <h5 className="mb-0 text-white-50">Expert Courses</h5>
            </div>
            <div className="col-md-4 text-white">
              <h2 className="display-4 fw-bold mb-2">100%</h2>
              <h5 className="mb-0 text-white-50">Satisfaction Rate</h5>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-5 text-center">
        <div className="container py-5 glass-card mt-4 mb-4 fade-in">
          <h2 className="fw-bold mb-4">Ready to start your learning journey?</h2>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            Join thousands of students who are already learning and achieving their goals with Mini LMS.
          </p>
          <Link to="/register" className="btn btn-primary-gradient btn-lg px-5">Start Learning Today</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
