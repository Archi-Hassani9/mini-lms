import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlay, FaCheckCircle, FaFileAlt, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { courseApi, lessonApi, assignmentApi, enrollmentApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const LearnCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'assignments'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseRes = await courseApi.getById(id);
        const lessonRes = await lessonApi.getByCourse(id);
        const assignmentRes = await assignmentApi.getByCourse(id);
        
        if (courseRes.success !== false) setCourse(courseRes.course || courseRes);
        if (lessonRes.success) {
          setLessons(lessonRes.lessons);
          if (lessonRes.lessons.length > 0) setActiveLesson(lessonRes.lessons[0]);
        }
        if (assignmentRes.success) setAssignments(assignmentRes.assignments);
      } catch (err) {
        console.error("Failed to load course data", err);
        toast.error("Failed to load course materials");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const handleUpdateProgress = async () => {
    if (!lessons.length) return;
    
    // Calculate naive progress based on active lesson index (for demo)
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
    const newProgress = Math.min(100, Math.round(((currentIndex + 1) / lessons.length) * 100));
    
    try {
      await enrollmentApi.updateProgress(id, newProgress);
      toast.success(`Progress updated to ${newProgress}%`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;
  if (!course) return <div className="text-center p-5 text-light">Course not found</div>;

  return (
    <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Top bar */}
      <div className="glass-card mb-4 p-3 d-flex justify-content-between align-items-center">
        <h4 className="fw-bold mb-0 text-light">{course.title}</h4>
        <Link to="/student/courses" className="btn btn-sm btn-outline-secondary">Back to My Courses</Link>
      </div>

      <div className="row g-4 flex-grow-1">
        {/* Main Content Area */}
        <div className="col-lg-8 d-flex flex-column">
          <div className="glass-card p-0 overflow-hidden d-flex flex-column h-100">
            {activeTab === 'lessons' ? (
              activeLesson ? (
                <>
                  {/* Video player placeholder */}
                  <div className="bg-dark w-100 d-flex align-items-center justify-content-center" style={{ height: '450px' }}>
                    {activeLesson.video_url ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={activeLesson.video_url.includes('youtube.com/watch') 
                          ? activeLesson.video_url.replace('watch?v=', 'embed/') 
                          : activeLesson.video_url} 
                        title="Lesson Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    ) : (
                      <div className="text-center text-secondary">
                        <FaPlay size={48} className="mb-3 opacity-50" />
                        <p>No video available for this lesson</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-grow-1 bg-card">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h3 className="fw-bold text-light mb-1">{activeLesson.title}</h3>
                        <p className="text-primary">Lesson {activeLesson.order_no}</p>
                      </div>
                      <button className="btn btn-outline-success" onClick={handleUpdateProgress}>
                        <FaCheckCircle className="me-2" /> Mark Complete
                      </button>
                    </div>
                    
                    <div className="text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                      {activeLesson.content || 'No text content available for this lesson.'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-5 text-center text-secondary d-flex align-items-center justify-content-center h-100">
                  <p>Select a lesson from the curriculum</p>
                </div>
              )
            ) : (
              <div className="p-4 bg-card h-100 overflow-auto">
                <h3 className="fw-bold text-light mb-4">Course Assignments</h3>
                {assignments.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="border border-secondary border-opacity-25 rounded p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="fw-bold text-light mb-0">{assignment.title}</h5>
                          <span className={`badge ${assignment.is_past_deadline ? 'bg-danger' : 'bg-primary'}`}>
                            Due: {new Date(assignment.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary mb-4">{assignment.description}</p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-primary small fw-bold">Max Marks: {assignment.max_marks}</div>
                          {assignment.is_past_deadline ? (
                            <button className="btn btn-outline-danger" disabled>Deadline Passed</button>
                          ) : (
                            <Link to={`/student/assignments/${assignment.id}/submit`} className="btn btn-primary-gradient">
                              Submit Work
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-5 border border-secondary border-opacity-25 rounded border-dashed">
                    <p className="text-secondary mb-0">No assignments available for this course yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="glass-card h-100 d-flex flex-column">
            <div className="d-flex border-bottom border-secondary border-opacity-25">
              <button 
                className={`flex-grow-1 btn rounded-0 py-3 ${activeTab === 'lessons' ? 'text-primary border-bottom border-primary border-2 fw-bold bg-primary bg-opacity-10' : 'text-secondary'}`}
                onClick={() => setActiveTab('lessons')}
              >
                Curriculum
              </button>
              <button 
                className={`flex-grow-1 btn rounded-0 py-3 ${activeTab === 'assignments' ? 'text-primary border-bottom border-primary border-2 fw-bold bg-primary bg-opacity-10' : 'text-secondary'}`}
                onClick={() => setActiveTab('assignments')}
              >
                Assignments <span className="badge bg-secondary ms-1">{assignments.length}</span>
              </button>
            </div>
            
            <div className="flex-grow-1 overflow-auto p-3">
              {activeTab === 'lessons' && (
                <div className="d-flex flex-column gap-2">
                  {lessons.map(lesson => (
                    <button 
                      key={lesson.id} 
                      className={`text-start btn d-flex align-items-center p-3 rounded ${activeLesson?.id === lesson.id ? 'bg-primary bg-opacity-10 text-primary border border-primary' : 'text-secondary border border-transparent hover-bg-dark'}`}
                      onClick={() => setActiveLesson(lesson)}
                    >
                      <span className="me-3 opacity-75">{lesson.order_no}</span>
                      <span className="fw-medium text-truncate">{lesson.title}</span>
                    </button>
                  ))}
                  {lessons.length === 0 && (
                    <p className="text-center text-secondary p-4">No lessons added yet.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'assignments' && (
                <div className="p-2 text-secondary small">
                  <FaFileAlt className="text-primary me-2 mb-1" />
                  Select assignments tab from the main view to submit your work and get graded by your instructors.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCourse;
