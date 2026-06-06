import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaFileAlt, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { assignmentApi, courseApi, submissionApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';

const ViewSubmissions = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAll();
        setCourses(res.results || []);
      } catch (err) {
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const fetchAssignments = async () => {
        try {
          const res = await assignmentApi.getByCourse(selectedCourse);
          setAssignments(res.assignments || []);
          setSelectedAssignment('');
          setSubmissions([]);
        } catch (err) {
          toast.error('Failed to load assignments');
        }
      };
      fetchAssignments();
    } else {
      setAssignments([]);
      setSelectedAssignment('');
      setSubmissions([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions();
    }
  }, [selectedAssignment]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getSubmissions(selectedAssignment);
      setSubmissions(res.submissions || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await submissionApi.updateStatus(id, status);
      toast.success(`Submission marked as ${status}`);
      fetchSubmissions();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredSubmissions = filter === 'All' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  const columns = [
    { key: 'student_name', label: 'Student', render: (row) => (
      <div>
        <div className="fw-bold text-theme-primary">{row.student_name}</div>
        <div className="small text-secondary">{row.student_email}</div>
      </div>
    )},
    { key: 'submitted_at', label: 'Submitted On', render: (row) => new Date(row.submitted_at).toLocaleString() },
    { key: 'file', label: 'File', render: (row) => (
      <a href={row.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 w-auto d-inline-flex">
        <FaFileAlt /> View File
      </a>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`badge-status badge-${row.status.toLowerCase()}`}>{row.status}</span>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="d-flex gap-2">
        {row.status === 'Submitted' ? (
          <>
            <button onClick={() => handleUpdateStatus(row.id, 'Reviewed')} className="btn btn-sm btn-outline-success" title="Approve">
              <FaCheck />
            </button>
            <button onClick={() => handleUpdateStatus(row.id, 'Rejected')} className="btn btn-sm btn-outline-danger" title="Reject">
              <FaTimes />
            </button>
          </>
        ) : (
          <span className="text-secondary small fst-italic">Reviewed</span>
        )}
      </div>
    )}
  ];

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Review Submissions</h2>
        <p className="text-secondary mb-0">Evaluate and grade student assignments.</p>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label text-secondary small">Select Course</label>
            <select 
              className="form-select form-control-custom" 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label text-secondary small">Select Assignment</label>
            <select 
              className="form-select form-control-custom" 
              value={selectedAssignment} 
              onChange={(e) => setSelectedAssignment(e.target.value)}
              disabled={!selectedCourse || assignments.length === 0}
            >
              <option value="">-- Choose Assignment --</option>
              {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label text-secondary small">Filter by Status</label>
            <select 
              className="form-select form-control-custom" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              disabled={!selectedAssignment}
            >
              <option value="All">All Submissions</option>
              <option value="Submitted">Pending Review (Submitted)</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card">
        {selectedAssignment ? (
          <DataTable 
            columns={columns} 
            data={filteredSubmissions} 
            loading={loading} 
            emptyMessage={`No ${filter !== 'All' ? filter : ''} submissions found for this assignment.`} 
          />
        ) : (
          <div className="text-center p-5 text-secondary d-flex flex-column align-items-center">
            <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-circle mb-3">
              <FaSearch size={32} />
            </div>
            <h5>Select an assignment</h5>
            <p>Choose a course and assignment above to view student submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubmissions;
