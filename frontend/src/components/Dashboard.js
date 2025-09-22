import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, useAuth } from '../App';

const Dashboard = () => {
  const { user } = useAuth();
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPaths: 0,
    activePaths: 0,
    totalHours: 0,
    completedPaths: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const paths = await apiService.getLearningPaths();
      setLearningPaths(paths);
      
      // Calculate stats
      const totalPaths = paths.length;
      const activePaths = paths.filter(path => path.status === 'active').length;
      const totalHours = paths.reduce((sum, path) => sum + path.total_estimated_hours, 0);
      const completedPaths = paths.filter(path => path.status === 'completed').length;
      
      setStats({
        totalPaths,
        activePaths,
        totalHours,
        completedPaths
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--secondary-color)';
    if (progress >= 50) return 'var(--warning-color)';
    return 'var(--primary-color)';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-secondary">
          {user?.role === 'teacher' 
            ? 'Manage your learning paths and track student progress.'
            : 'Continue your learning journey and track your progress.'
          }
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalPaths}</div>
          <div className="stat-label">Total Learning Paths</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activePaths}</div>
          <div className="stat-label">Active Paths</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(stats.totalHours)}</div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedPaths}</div>
          <div className="stat-label">Completed Paths</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-description">Get started with common tasks</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 gap-4">
            <Link to="/create-path" className="btn btn-primary">
              🎯 Create Learning Path
            </Link>
            {user?.role === 'teacher' && (
              <Link to="/students" className="btn btn-secondary">
                👥 Manage Students
              </Link>
            )}
            <button className="btn btn-secondary" onClick={loadDashboardData}>
              🔄 Refresh Data
            </button>
            <Link to="/create-path" className="btn btn-secondary">
              📊 View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Learning Paths Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {user?.role === 'teacher' ? 'Your Learning Paths' : 'My Learning Journey'}
          </h3>
          <p className="card-description">
            {learningPaths.length > 0
              ? `You have ${learningPaths.length} learning ${learningPaths.length === 1 ? 'path' : 'paths'}`
              : 'No learning paths yet. Create your first one to get started!'
            }
          </p>
        </div>
        <div className="card-content">
          {learningPaths.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-lg font-semibold mb-2">No Learning Paths Yet</h4>
              <p className="text-secondary mb-6">
                Create your first learning path to start your educational journey.
              </p>
              <Link to="/create-path" className="btn btn-primary">
                Create Your First Path
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="learning-path-card">
                  <div className="learning-path-header">
                    <h4 className="learning-path-title">{path.title}</h4>
                    <div className="learning-path-meta">
                      <span>📖 {path.topic}</span>
                      <span>⏱️ {path.duration_days} days</span>
                      <span>🎯 {path.difficulty_level}</span>
                    </div>
                  </div>
                  <div className="learning-path-content">
                    <div className="learning-path-stats">
                      <div className="learning-path-stat">
                        <span>📺</span>
                        <span>{path.daily_schedule?.reduce((sum, day) => sum + day.videos.length, 0) || 0} videos</span>
                      </div>
                      <div className="learning-path-stat">
                        <span>⏰</span>
                        <span>{Math.round(path.total_estimated_hours)} hours</span>
                      </div>
                      <div className="learning-path-stat">
                        <span>👤</span>
                        <span>
                          {user?.role === 'teacher' 
                            ? `By ${path.creator_name}`
                            : `${path.assigned_student_ids?.length || 0} students`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (for students) */}
                    {user?.role === 'student' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>0%</span> {/* TODO: Get actual progress */}
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: '0%',
                              backgroundColor: getProgressColor(0)
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="learning-path-actions">
                      <Link 
                        to={`/learning-path/${path.id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        📖 View Path
                      </Link>
                      {user?.role === 'student' && (
                        <Link 
                          to={`/progress/${path.id}`} 
                          className="btn btn-secondary btn-sm"
                        >
                          📊 Track Progress
                        </Link>
                      )}
                      {path.google_drive_link && (
                        <a 
                          href={path.google_drive_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          📄 Google Docs
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity (if teacher) */}
      {user?.role === 'teacher' && learningPaths.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-description">Latest updates from your learning paths</p>
          </div>
          <div className="card-content">
            <div className="text-center py-8 text-secondary">
              <div className="text-4xl mb-2">🔄</div>
              <p>Activity tracking coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;