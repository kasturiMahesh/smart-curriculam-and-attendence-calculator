import React, { useState, useEffect } from 'react';
import { apiService, useAuth } from '../App';

const StudentsManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await apiService.getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-secondary">Only teachers can access the student management page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">Students Management</h1>
        <p className="text-secondary">
          Manage your registered students and track their progress
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {students.filter(student => 
              new Date(student.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length}
          </div>
          <div className="stat-label">New This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Active Learning Paths</div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="card-title">Registered Students</h3>
              <p className="card-description">
                {students.length > 0 
                  ? `${students.length} student${students.length !== 1 ? 's' : ''} registered`
                  : 'No students registered yet'
                }
              </p>
            </div>
            <button 
              onClick={loadStudents}
              className="btn btn-secondary btn-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        <div className="card-content">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h4 className="text-lg font-semibold mb-2">No Students Yet</h4>
              <p className="text-secondary mb-6">
                Students need to register on the platform before they appear here.
                Share the registration link with your students to get started.
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-background-secondary rounded-lg">
                  <p className="text-sm font-medium mb-2">Registration URL:</p>
                  <code className="text-sm bg-white px-3 py-2 rounded border">
                    {window.location.origin}/register
                  </code>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register`)}
                  className="btn btn-primary btn-sm"
                >
                  📋 Copy Registration Link
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Registered</th>
                    <th className="text-left py-3 px-4 font-semibold">Learning Paths</th>
                    <th className="text-left py-3 px-4 font-semibold">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-border-light hover:bg-background-secondary">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="user-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-secondary">Student</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-secondary">
                        {student.email}
                      </td>
                      <td className="py-4 px-4 text-secondary">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          0 assigned
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-border-light rounded-full">
                            <div className="w-0 h-full bg-primary rounded-full"></div>
                          </div>
                          <span className="text-sm text-secondary">0%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="View student progress"
                          >
                            📊 Progress
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            title="Assign learning path"
                          >
                            📚 Assign Path
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Instructions for Teachers */}
      {students.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="card-title">Getting Started</h3>
            <p className="card-description">How to work with your students</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="text-2xl">1️⃣</div>
                <div>
                  <h4 className="font-semibold mb-2">Create Learning Paths</h4>
                  <p className="text-sm text-secondary">
                    Design comprehensive learning journeys with curated YouTube content
                    tailored to your curriculum.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">2️⃣</div>
                <div>
                  <h4 className="font-semibold mb-2">Assign to Students</h4>
                  <p className="text-sm text-secondary">
                    When creating learning paths, select which students should
                    have access to the content.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">3️⃣</div>
                <div>
                  <h4 className="font-semibold mb-2">Track Progress</h4>
                  <p className="text-sm text-secondary">
                    Monitor student engagement and completion rates through
                    detailed progress reports.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">4️⃣</div>
                <div>
                  <h4 className="font-semibold mb-2">Provide Support</h4>
                  <p className="text-sm text-secondary">
                    Use progress data to identify students who need additional
                    help or encouragement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManager;