import React, { useRef, useEffect } from 'react';

const CertificateModal = ({ show, onClose, course, student }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (show && canvasRef.current && course && student) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Border
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 10;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner border
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, width - 70, height - 70);

      // Text setup
      ctx.textAlign = 'center';
      
      // Title
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('Certificate of Completion', width / 2, 120);

      // Subtitle
      ctx.font = '20px Arial';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('This is to certify that', width / 2, 180);

      // Student Name
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(student.full_name, width / 2, 230);

      // Course statement
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Arial';
      ctx.fillText('has successfully completed the course', width / 2, 280);

      // Course Name
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 30px Arial';
      const maxTextWidth = width - 100;
      let title = course.title;
      ctx.fillText(title, width / 2, 330, maxTextWidth);

      // Date
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '18px Arial';
      ctx.fillText(`Awarded on: ${dateStr}`, width / 2, 400);

      // Logo/Sign
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Mini LMS', width / 2, 460);
    }
  }, [show, course, student]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `Certificate_${course.title.replace(/\s+/g, '_')}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content glass-card border-0">
          <div className="modal-header border-0">
            <h5 className="modal-title text-light fw-bold">Your Certificate</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body text-center p-0">
            <canvas ref={canvasRef} width="800" height="500" style={{ width: '100%', height: 'auto', borderRadius: '12px' }}></canvas>
          </div>
          <div className="modal-footer border-0 justify-content-center">
            <button type="button" className="btn btn-outline-light" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-primary-gradient" onClick={handleDownload}>
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
