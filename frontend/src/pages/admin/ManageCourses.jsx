import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { courseApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Link } from 'react-router-dom';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', thumbnail: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getAll();
      setCourses(res.results || []);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModal = (course = null) => {
    if (course) {
      setFormData({ 
        title: course.title, 
        description: course.description, 
        category: course.category, 
        thumbnail: course.thumbnail || '' 
      });
      setEditingId(course.id);
    } else {
      setFormData({ title: '', description: '', category: '', thumbnail: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await courseApi.update(editingId, formData);
        toast.success('Course updated successfully');
      } else {
        await courseApi.create(formData);
        toast.success('Course created successfully');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error('Failed to save course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.delete(id);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (err) {
        toast.error('Failed to delete course');
      }
    }
  };

  const columns = [
    { key: 'title', label: 'Course Title', render: (row) => <span className="fw-bold">{row.title}</span> },
    { key: 'category', label: 'Category', render: (row) => <span className="badge bg-secondary bg-opacity-25 text-theme-primary">{row.category}</span> },
    { key: 'lesson_count', label: 'Lessons', render: (row) => row.lesson_count || 0 },
    { key: 'created_at', label: 'Created', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="d-flex gap-2">
        <Link to={`/courses/${row.id}`} className="btn btn-sm btn-outline-info" title="View"><FaEye /></Link>
        <button onClick={() => handleOpenModal(row)} className="btn btn-sm btn-outline-primary" title="Edit"><FaEdit /></button>
        <button onClick={() => handleDelete(row.id)} className="btn btn-sm btn-outline-danger" title="Delete"><FaTrash /></button>
      </div>
    )}
  ];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Manage Courses</h2>
          <p className="text-secondary mb-0">Create, update, and organize your courses.</p>
        </div>
        <button className="btn btn-primary-gradient d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
          <FaPlus /> New Course
        </button>
      </div>

      <div className="glass-card">
        <DataTable columns={columns} data={courses} loading={loading} />
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', overflowY: 'auto' }} tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ marginTop: '2rem' }}>
            <div className="modal-content glass-card border-0">
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <h5 className="modal-title text-light fw-bold">{editingId ? 'Edit Course' : 'Create New Course'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Course Title</label>
                    <input type="text" className="form-control form-control-custom" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary">Category</label>
                      <select className="form-select form-control-custom" name="category" value={formData.category} onChange={handleChange} required>
                        <option value="">-- Select Category --</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Python Programming">Python Programming</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary">Thumbnail URL</label>
                      <input type="url" className="form-control form-control-custom" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Description</label>
                    <textarea className="form-control form-control-custom" rows="4" name="description" value={formData.description} onChange={handleChange} required></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-25">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">{editingId ? 'Update Course' : 'Create Course'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
