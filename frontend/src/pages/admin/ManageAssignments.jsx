import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { assignmentApi, courseApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';

const ManageAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', max_marks: 100 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAll();
        setCourses(res.results || []);
        if (res.results && res.results.length > 0) {
          setSelectedCourse(res.results[0].id);
        }
      } catch (err) {
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getByCourse(selectedCourse);
      setAssignments(res.assignments || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModal = (assignment = null) => {
    if (assignment) {
      // Format date for datetime-local input
      const dateStr = new Date(assignment.deadline).toISOString().slice(0, 16);
      setFormData({ 
        title: assignment.title, 
        description: assignment.description, 
        deadline: dateStr, 
        max_marks: assignment.max_marks 
      });
      setEditingId(assignment.id);
    } else {
      setFormData({ title: '', description: '', deadline: '', max_marks: 100 });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await assignmentApi.update(editingId, formData);
        toast.success('Assignment updated successfully');
      } else {
        await assignmentApi.create(selectedCourse, formData);
        toast.success('Assignment created successfully');
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to save assignment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentApi.delete(id);
        toast.success('Assignment deleted successfully');
        fetchAssignments();
      } catch (err) {
        toast.error('Failed to delete assignment');
      }
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <span className="fw-bold">{row.title}</span> },
    { key: 'max_marks', label: 'Max Marks', render: (row) => <span className="badge bg-primary">{row.max_marks}</span> },
    { key: 'deadline', label: 'Deadline', render: (row) => (
      <span className={new Date(row.deadline) < new Date() ? 'text-danger' : 'text-success'}>
        {new Date(row.deadline).toLocaleString()}
      </span>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="d-flex gap-2">
        <button onClick={() => handleOpenModal(row)} className="btn btn-sm btn-outline-primary" title="Edit"><FaEdit /></button>
        <button onClick={() => handleDelete(row.id)} className="btn btn-sm btn-outline-danger" title="Delete"><FaTrash /></button>
      </div>
    )}
  ];

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Manage Assignments</h2>
          <p className="text-secondary mb-0">Create and update assignments for courses.</p>
        </div>
        
        <div className="d-flex gap-3 align-items-center">
          <select 
            className="form-select form-control-custom" 
            style={{ width: 'auto', minWidth: '200px' }}
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button 
            className="btn btn-primary-gradient d-flex align-items-center gap-2" 
            onClick={() => handleOpenModal()}
            disabled={!selectedCourse}
          >
            <FaPlus /> New
          </button>
        </div>
      </div>

      <div className="glass-card">
        {selectedCourse ? (
          <DataTable columns={columns} data={assignments} loading={loading} emptyMessage="No assignments found for this course." />
        ) : (
          <div className="text-center p-5 text-secondary">Please create a course first to manage assignments.</div>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', overflowY: 'auto' }} tabIndex="-1">
          <div className="modal-dialog" style={{ marginTop: '2rem' }}>
            <div className="modal-content glass-card border-0">
              <div className="modal-header border-bottom border-secondary border-opacity-25">
                <h5 className="modal-title text-light fw-bold">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Assignment Title</label>
                    <input type="text" className="form-control form-control-custom" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary">Max Marks</label>
                      <input type="number" className="form-control form-control-custom" name="max_marks" value={formData.max_marks} onChange={handleChange} min="1" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary">Deadline</label>
                      <input type="datetime-local" className="form-control form-control-custom" name="deadline" value={formData.deadline} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Description/Instructions</label>
                    <textarea className="form-control form-control-custom" rows="4" name="description" value={formData.description} onChange={handleChange} required></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top border-secondary border-opacity-25">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-gradient">{editingId ? 'Update Assignment' : 'Create Assignment'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssignments;
