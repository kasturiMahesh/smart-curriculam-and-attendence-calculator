import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, useAuth } from '../App';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 6,
    subjects: 4,
    todaysAttendance: 0,
    learningPaths: 4,
    weeklyData: [
      { day: 'Mon', present: 20, absent: 2 },
      { day: 'Tue', present: 16, absent: 4 },
      { day: 'Wed', present: 17, absent: 3 },
      { day: 'Thu', present: 18, absent: 2 },
      { day: 'Fri', present: 19, absent: 1 },
      { day: 'Sat', present: 15, absent: 3 },
      { day: 'Sun', present: 0, absent: 0 }
    ],
    recentActivity: [
      { student: 'Emma Taylor', subject: 'Physics', status: 'present', time: '9/22/2025', method: 'Manual' },
      { student: 'Emma Taylor', subject: 'English', status: 'present', time: '9/20/2025', method: 'Manual' },
      { student: 'Emma Taylor', subject: 'Mathematics', status: 'present', time: '9/20/2025', method: 'QR' },
      { student: 'Emma Taylor', subject: 'Computer Science', status: 'absent', time: '9/20/2025', method: 'QR' }
    ]
  });
  
  const [loading, setLoading] = useState(false);

  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Chart component for weekly attendance
  const WeeklyChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.present + d.absent));
    
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '1rem', padding: '1rem 0' }}>
        {data.map((day, index) => {
          const presentHeight = (day.present / maxValue) * 200;
          const absentHeight = (day.absent / maxValue) * 200;
          
          return (
            <div key={day.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '220px', justifyContent: 'end' }}>
                {day.present > 0 && (
                  <div 
                    style={{ 
                      width: '40px', 
                      height: `${presentHeight}px`, 
                      background: '#00b894',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '2px'
                    }}
                    title={`Present: ${day.present}`}
                  ></div>
                )}
                {day.absent > 0 && (
                  <div 
                    style={{ 
                      width: '40px', 
                      height: `${absentHeight}px`, 
                      background: '#e17055',
                      borderRadius: '0 0 4px 4px'
                    }}
                    title={`Absent: ${day.absent}`}
                  ></div>
                )}
                {day.present === 0 && day.absent === 0 && (
                  <div 
                    style={{ 
                      width: '40px', 
                      height: '10px', 
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px'
                    }}
                  ></div>
                )}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {day.day}
              </span>
            </div>
          );
        })}
        
        {/* Legend */}
        <div style={{ 
          position: 'absolute', 
          right: '1rem', 
          top: '1rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.5rem',
          borderRadius: '8px',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#00b894', borderRadius: '2px' }}></div>
            <span>Present: 0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#e17055', borderRadius: '2px' }}></div>
            <span>Absent: 0</span>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Load real data here if needed
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || 'Demo Teacher';

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Welcome back, {userName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Here's what's happening in your classroom today.
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

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card animate-slide-in">
          <div className="stat-icon students">
            👥
          </div>
          <div className="stat-content">
            <h3>{dashboardData.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="stat-card animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon subjects">
            📚
          </div>
          <div className="stat-content">
            <h3>{dashboardData.subjects}</h3>
            <p>Subjects</p>
          </div>
        </div>
        
        <div className="stat-card animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon attendance">
            📋
          </div>
          <div className="stat-content">
            <h3>{dashboardData.todaysAttendance}</h3>
            <p>Today's Attendance</p>
          </div>
        </div>
        
        <div className="stat-card animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon paths">
            🎯
          </div>
          <div className="stat-content">
            <h3>{dashboardData.learningPaths}</h3>
            <p>Learning Paths</p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Weekly Attendance Overview */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Weekly Attendance Overview</h3>
          </div>
          <WeeklyChart data={dashboardData.weeklyData} />
        </div>

        {/* Recent Activity */}
        <div className="glass-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="activity-feed">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-status ${activity.status}`}></div>
                  <div className="activity-details">
                    <h4>{activity.student}</h4>
                    <p>{activity.subject} • {activity.status === 'present' ? 'Present' : 'Absent'}</p>
                  </div>
                  <div className="activity-time">
                    <div>{activity.time}</div>
                    <div style={{ fontSize: '0.7rem', opacity: '0.7' }}>⚪ {activity.method}</div>
                  </div>
                </div>
              ))}
              
              {dashboardData.recentActivity.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>No recent activity</p>
                  <p style={{ fontSize: '0.875rem' }}>Student activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role === 'teacher' && (
        <div className="glass-card mt-4">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-subtitle">Manage your classroom efficiently</p>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link to="/students" className="btn btn-primary">
                👥 Manage Students
              </Link>
              <Link to="/qr-scanner" className="btn btn-secondary">
                📱 QR Scanner
              </Link>
              <Link to="/learning-paths" className="btn btn-secondary">
                🎯 Learning Paths
              </Link>
              <Link to="/attendance" className="btn btn-secondary">
                📋 Mark Attendance
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Student Quick Access */}
      {user?.role === 'student' && (
        <div className="glass-card mt-4">
          <div className="card-header">
            <h3 className="card-title">Your Learning Journey</h3>
            <p className="card-subtitle">Continue your education</p>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link to="/learning-paths" className="btn btn-primary">
                🎯 My Learning Paths
              </Link>
              <Link to="/progress" className="btn btn-secondary">
                📊 View Progress
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;