import React, { useState, useEffect } from 'react';
import { apiService, useAuth } from '../App';

const StudentsManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([
    {
      id: '1',
      name: 'Alice Johnson',
      rollNo: 'CS001',
      class: '10-A',
      email: 'cs001@student-demo.com',
      username: 'cs001'
    },
    {
      id: '2',
      name: 'Bob Wilson',
      rollNo: 'CS002',
      class: '10-A',
      email: 'cs002@student-demo.com',
      username: 'cs002'
    },
    {
      id: '3',
      name: 'Carol Davis',
      rollNo: 'CS003',
      class: '10-B',
      email: 'cs003@student-demo.com',
      username: 'cs003'
    },
    {
      id: '4',
      name: 'David Brown',
      rollNo: 'CS004',
      class: '10-B',
      email: 'cs004@student-demo.com',
      username: 'cs004'
    },
    {
      id: '5',
      name: 'Emma Taylor',
      rollNo: 'CS005',
      class: '10-A',
      email: 'cs005@student-demo.com',
      username: 'cs005'
    },
    {
      id: '6',
      name: 'mahesh',
      rollNo: '219',
      class: 'cse-4',
      email: 'mahesh@gmail.com',
      username: 'Mahesh'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    class: '',
    email: '',
    username: ''
  });

  // Generate QR Code Data URL
  const generateQRCode = (studentData) => {
    // Create QR code data - in real implementation, use a proper QR library
    const qrData = JSON.stringify({
      studentId: studentData.id,
      rollNo: studentData.rollNo,
      name: studentData.name
    });
    
    // For demo purposes, return a placeholder QR code
    // In real implementation, use libraries like qrcode.js or react-qr-code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  // Download QR Code
  const downloadQRCode = async (student) => {
    try {
      const qrUrl = generateQRCode(student);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.rollNo}_${student.name}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!newStudent.name || !newStudent.rollNo || !newStudent.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // In real implementation, call API
      const student = {
        id: Date.now().toString(),
        ...newStudent,
        username: newStudent.username || newStudent.rollNo
      };
      
      setStudents(prev => [...prev, student]);
      setNewStudent({ name: '', rollNo: '', class: '', email: '', username: '' });
      setShowAddModal(false);
      setError('');
    } catch (error) {
      console.error('Failed to add student:', error);
      setError('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="glass-card">
        <div className="card-content text-center" style={{ padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Access Denied</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Only teachers can access student management.</p>
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
            Student Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Manage student profiles and QR codes
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '1rem', padding: '0.875rem 1.5rem' }}
        >
          ➕ Add Student
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-3">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn btn-secondary">
          🔽 Filter
        </button>
      </div>

      {/* Students Grid */}
      <div className="students-grid">
        {filteredStudents.map((student, index) => (
          <div key={student.id} className="student-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="student-header">
              <div className="student-info">
                <h3>{student.name}</h3>
                <div className="student-details">
                  <div><strong>Roll No:</strong> {student.rollNo}</div>
                  <div><strong>Class:</strong> {student.class}</div>
                  <div><strong>Email:</strong> {student.email}</div>
                  <div><strong>Username:</strong> {student.username}</div>
                </div>
              </div>
              <div className="qr-actions">
                <button
                  onClick={() => downloadQRCode(student)}
                  className="btn btn-secondary btn-sm"
                  title="Download QR Code"
                  style={{ padding: '0.5rem', minWidth: '40px', fontSize: '1rem' }}
                >
                  📱
                </button>
                <button
                  onClick={() => downloadQRCode(student)}
                  className="btn btn-success btn-sm"
                  title="Download QR Code"
                  style={{ padding: '0.5rem', minWidth: '40px', fontSize: '1rem' }}
                >
                  ⬇️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="glass-card">
          <div className="card-content text-center" style={{ padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {searchTerm ? 'No Students Found' : 'No Students Yet'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {searchTerm 
                ? `No students match "${searchTerm}". Try a different search term.`
                : 'Start by adding your first student to get started.'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                ➕ Add Your First Student
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Add New Student</h4>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleAddStudent} className="form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="form-input"
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="rollNo" className="form-label">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      id="rollNo"
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                      className="form-input"
                      placeholder="e.g., CS001"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="class" className="form-label">
                      Class
                    </label>
                    <input
                      type="text"
                      id="class"
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                      className="form-input"
                      placeholder="e.g., 10-A"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="form-input"
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                    className="form-input"
                    placeholder="Will use roll number if empty"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    If empty, roll number will be used as username
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStudent}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    Adding...
                  </>
                ) : (
                  '➕ Add Student'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManager;