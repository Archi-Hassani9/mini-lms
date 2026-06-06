import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { assignmentApi, submissionApi } from '../../services/api';
import Spinner from '../../components/common/Spinner';

const SubmitAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await assignmentApi.getById(id);
        if (res.success !== false) {
          setAssignment(res.assignment || res);
        }

        // Check if already submitted
        const submissionsRes = await submissionApi.getMySubmissions();
        if (submissionsRes.success) {
          const sub = submissionsRes.submissions.find(s => s.assignment === parseInt(id));
          if (sub) {
            setExistingSubmission(sub);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Client-side validation (matching backend)
      const allowedExtensions = ['.pdf', '.docx', '.pptx', '.zip'];
      const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        toast.error('Invalid file type. Allowed: PDF, DOCX, PPTX, ZIP');
        return;
      }
      
      if (selectedFile.size > 200 * 1024 * 1024) {
        toast.error('File size exceeds the 200MB limit');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('submission_file', file);

    try {
      const res = await submissionApi.submit(id, formData);
      if (res.success) {
        toast.success(res.message);
        setExistingSubmission(res.submission);
        setFile(null);
      }
    } catch (err) {
      toast.error(err.data?.errors?.submission_file?.[0] || err.data?.errors?.assignment?.[0] || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!assignment) return <div className="text-center p-5 text-light">Assignment not found</div>;

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center mb-4">
        <Link to={`/student/courses/${assignment.course}/learn`} className="btn btn-outline-secondary me-3">Back</Link>
        <h2 className="fw-bold mb-0 text-light">Submit Assignment</h2>
      </div>

      <div className="glass-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h4 className="fw-bold text-primary mb-0">{assignment.title}</h4>
          <span className={`badge ${assignment.is_past_deadline ? 'bg-danger' : 'bg-warning text-dark'}`}>
            Due: {new Date(assignment.deadline).toLocaleString()}
          </span>
        </div>
        
        <div className="bg-dark p-3 rounded mb-4 border border-secondary border-opacity-25">
          <h6 className="text-light fw-bold mb-2">Instructions:</h6>
          <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>{assignment.description}</p>
        </div>

        <div className="d-flex justify-content-between text-secondary mb-2 border-bottom border-secondary border-opacity-25 pb-3">
          <span><strong>Course:</strong> {assignment.course_title}</span>
          <span><strong>Max Marks:</strong> {assignment.max_marks}</span>
        </div>

        {existingSubmission ? (
          <div className="mt-4 text-center p-5 rounded" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <FaCheckCircle size={48} className="text-success mb-3" />
            <h4 className="text-light fw-bold">Assignment Submitted successfully</h4>
            <p className="text-secondary">
              Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
            </p>
            <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-dark border border-secondary">
              Status: <span className={`badge-status badge-${existingSubmission.status.toLowerCase()}`}>{existingSubmission.status}</span>
            </div>
            
            <div className="mt-4">
              <a href={existingSubmission.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                <FaFileAlt className="me-2" /> View Submitted File
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            {assignment.is_past_deadline ? (
              <div className="alert alert-danger d-flex align-items-center">
                <FaExclamationCircle className="me-2" />
                The deadline for this assignment has passed. Submissions are closed.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="form-label text-light fw-bold">Upload Your Work</label>
                  
                  <div className="border border-2 border-dashed border-secondary rounded p-5 text-center position-relative" style={{ borderStyle: 'dashed' }}>
                    <input 
                      type="file" 
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                      style={{ cursor: 'pointer' }}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.pptx,.zip"
                    />
                    
                    {file ? (
                      <div className="text-primary">
                        <FaFileAlt size={40} className="mb-2" />
                        <h6 className="mb-0 text-light">{file.name}</h6>
                        <small className="text-secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
                        <p className="text-primary mt-2 small">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-secondary">
                        <FaCloudUploadAlt size={48} className="mb-3 text-primary opacity-50" />
                        <h6 className="text-light">Drag & drop your file here or click to browse</h6>
                        <p className="small mb-0 mt-2">Allowed types: PDF, DOCX, PPTX, ZIP (Max 200MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary-gradient px-5 py-2 fw-bold"
                    disabled={!file || submitting}
                  >
                    {submitting ? 'Uploading...' : 'Submit Assignment'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitAssignment;
