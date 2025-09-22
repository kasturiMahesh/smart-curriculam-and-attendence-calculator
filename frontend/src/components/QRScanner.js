import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';

const QRScanner = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [subjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science']);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate a QR code scan for demo purposes
    const mockStudents = [
      { id: '1', name: 'Alice Johnson', rollNo: 'CS001' },
      { id: '2', name: 'Bob Wilson', rollNo: 'CS002' },
      { id: '3', name: 'Carol Davis', rollNo: 'CS003' },
      { id: '4', name: 'Emma Taylor', rollNo: 'CS005' }
    ];
    
    const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const scanTime = new Date().toLocaleTimeString();
    
    const newScan = {
      id: Date.now(),
      student: randomStudent,
      subject: selectedSubject,
      date: selectedDate,
      time: scanTime,
      status: 'present'
    };
    
    setRecentScans(prev => [newScan, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (user?.role !== 'teacher') {
    return (
      <div className="glass-card">
        <div className="card-content text-center" style={{ padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Only teachers can access the QR scanner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            QR Code Scanner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Scan student QR codes for instant attendance marking
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Today's Date
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500' }}>
            {getCurrentDate()}
          </div>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="qr-scanner-container">
        {/* Scanner Panel */}
        <div className="scanner-panel">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            QR Code Scanner
          </h3>
          
          {/* Controls */}
          <div className="scanner-controls">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-select"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Camera Container */}
          <div className="camera-container">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div className="qr-overlay"></div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                <p>Camera not active</p>
                <p style={{ fontSize: '0.875rem' }}>Click "Start Scanner" to begin</p>
              </div>
            )}
          </div>

          {/* Scanner Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {!isScanning ? (
              <button
                onClick={startCamera}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                📹 Start Scanner
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  ⏹️ Stop Scanner
                </button>
                <button
                  onClick={simulateQRScan}
                  className="btn btn-success"
                  style={{ flex: 1 }}
                >
                  🎯 Simulate Scan
                </button>
              </>
            )}
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Recent Scans Panel */}
        <div className="recent-scans">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Recent Scans
          </h3>
          
          {recentScans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No scans yet today</p>
              <p style={{ fontSize: '0.875rem' }}>Start scanning QR codes to see attendance records</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: scan.status === 'present' ? 'var(--green-accent)' : 'var(--red-accent)',
                      flexShrink: 0
                    }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '0.25rem' }}>
                      {scan.student.name}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {scan.subject} • Roll: {scan.student.rollNo}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <div>{scan.time}</div>
                    <div>{scan.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card mt-4">
        <div className="card-header">
          <h3 className="card-title">How to Use QR Scanner</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>1️⃣</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Select Subject & Date</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Choose the subject and date for which you want to mark attendance.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>2️⃣</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Start Camera</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Click "Start Scanner" to activate your camera and begin scanning.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>3️⃣</div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Scan QR Codes</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Students scan their QR codes, and attendance is marked automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;