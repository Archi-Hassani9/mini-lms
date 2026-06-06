import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaUsers } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  return (
    <div className="course-card d-flex flex-column h-100">
      <div className="position-relative">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="course-card-img" />
        ) : (
          <div className="course-card-img d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
            <FaBookOpen size={40} className="text-secondary" />
          </div>
        )}
        <span className="badge bg-primary position-absolute top-0 end-0 m-2">
          {course.category}
        </span>
      </div>
      
      <div className="p-4 d-flex flex-column flex-grow-1">
        <h5 className="fw-bold text-light mb-2">{course.title}</h5>
        <p className="text-secondary flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>
        
        <div className="d-flex justify-content-between text-secondary mb-3 mt-auto small">
          <span className="d-flex align-items-center gap-1"><FaBookOpen /> {course.lesson_count || 0} Lessons</span>
          <span className="d-flex align-items-center gap-1"><FaUsers /> {course.enrollment_count || 0} Enrolled</span>
        </div>
        
        <Link to={`/courses/${course.id}`} className="btn btn-outline-light w-100">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
