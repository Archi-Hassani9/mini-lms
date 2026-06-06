import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import CourseCard from '../../components/common/CourseCard';
import Spinner from '../../components/common/Spinner';
import { courseApi } from '../../services/api';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'UI/UX Design', 'Python Programming', 'Digital Marketing'];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (category !== 'All') params.append('category', category);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const res = await courseApi.getAll(queryString);
        setCourses(res.results || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [debouncedSearch, category]);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3 text-light">Explore Courses</h1>
        <p className="lead text-secondary">Discover thousands of courses from top instructors</p>
      </div>

      <div className="row g-4 mb-5 align-items-center">
        <div className="col-md-6">
          <div className="position-relative">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            <input 
              type="text" 
              className="form-control form-control-custom ps-5" 
              placeholder="Search for courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`btn ${category === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : courses.length > 0 ? (
        <div className="row g-4 fade-in">
          {courses.map(course => (
            <div className="col-md-6 col-lg-4" key={course.id}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5 glass-card fade-in">
          <h3 className="text-light mb-3">No courses found</h3>
          <p className="text-secondary">Try adjusting your search or category filters.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => { setSearch(''); setCategory('All'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
