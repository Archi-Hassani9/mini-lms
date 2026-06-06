import React from 'react';
import { FaGraduationCap, FaChalkboardTeacher, FaGlobeAmericas } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div>
      <div className="bg-dark py-5 text-center text-light" style={{ background: 'linear-gradient(135deg, var(--bg-sidebar), var(--bg-card))' }}>
        <div className="container py-5">
          <h1 className="display-4 fw-bold mb-3">About Mini LMS</h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '700px' }}>
            We're on a mission to democratize education by providing a modern, accessible, and comprehensive learning management system.
          </p>
        </div>
      </div>

      <div className="container py-5 mt-4">
        <div className="row g-5 align-items-center mb-5 pb-5">
          <div className="col-lg-6">
            <h2 className="fw-bold mb-4">Our Mission</h2>
            <p className="text-secondary fs-5 mb-4">
              Mini LMS was built with a simple premise: education should be accessible to everyone, everywhere. 
              We've created a platform that connects passionate instructors with eager learners across the globe.
            </p>
            <p className="text-secondary fs-5">
              Through our intuitive interface, comprehensive course tracking, and rigorous assignment system, 
              we ensure that online learning is just as effective—if not more so—than traditional classroom education.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-sm-6">
                <div className="glass-card p-4 text-center h-100">
                  <FaGraduationCap size={40} className="text-primary mb-3" />
                  <h3 className="fw-bold">10k+</h3>
                  <p className="text-secondary mb-0">Graduates</p>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="glass-card p-4 text-center h-100">
                  <FaChalkboardTeacher size={40} className="text-accent mb-3" />
                  <h3 className="fw-bold">500+</h3>
                  <p className="text-secondary mb-0">Instructors</p>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="glass-card p-4 text-center h-100">
                  <FaGlobeAmericas size={40} className="text-secondary mb-3" />
                  <h3 className="fw-bold">120+</h3>
                  <p className="text-secondary mb-0">Countries</p>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="glass-card p-4 text-center h-100 bg-primary bg-opacity-10">
                  <h3 className="fw-bold text-primary mb-2">Join Us</h3>
                  <p className="text-secondary mb-0 small">Start learning today</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">Our Core Values</h2>
        </div>
        
        <div className="row g-4 mb-5">
          {[
            { title: 'Excellence', desc: 'We strive for the highest quality in everything we do, from our codebase to our course content.' },
            { title: 'Accessibility', desc: 'Learning should have no barriers. Our platform is designed to work everywhere for everyone.' },
            { title: 'Innovation', desc: 'We continuously improve our tools and methods to provide the best educational experience.' }
          ].map((val, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="glass-card p-4 text-center h-100 border-top-0 border-end-0 border-bottom-0 border-start border-primary border-4">
                <h4 className="fw-bold mb-3">{val.title}</h4>
                <p className="text-secondary mb-0">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
