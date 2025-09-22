import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService, useAuth } from '../App';

const LearningPathViewer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    loadLearningPath();
  }, [id]);

  const loadLearningPath = async () => {
    try {
      setLoading(true);
      const path = await apiService.getLearningPath(id);
      setLearningPath(path);
    } catch (error) {
      console.error('Failed to load learning path:', error);
      setError('Failed to load learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (durationStr) => {
    // Parse ISO 8601 duration (PT15M30S) to readable format
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0 min';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const openYouTubeVideo = (videoUrl) => {
    window.open(videoUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading learning path...</p>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-lg font-semibold mb-2">Learning Path Not Found</h3>
          <p className="text-secondary mb-6">
            {error || 'The learning path you requested could not be found.'}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentDay = learningPath.daily_schedule?.find(day => day.day_number === activeDay);

  return (
    <div>
      {/* Learning Path Header */}
      <div className="card mb-6">
        <div className="learning-path-header">
          <h1 className="learning-path-title">{learningPath.title}</h1>
          <div className="learning-path-meta">
            <span>📖 {learningPath.topic}</span>
            <span>⏱️ {learningPath.duration_days} days</span>
            <span>🎯 {learningPath.difficulty_level}</span>
            <span>⏰ {Math.round(learningPath.total_estimated_hours)} hours total</span>
          </div>
        </div>
        <div className="card-content">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-secondary">
              Created by {learningPath.creator_name} on{' '}
              {new Date(learningPath.created_at).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              {learningPath.google_drive_link && (
                <a
                  href={learningPath.google_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  📄 Google Drive
                </a>
              )}
              {user?.role === 'student' && (
                <Link to={`/progress/${learningPath.id}`} className="btn btn-primary btn-sm">
                  📊 Track Progress
                </Link>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="stat-card">
              <div className="stat-value text-lg">
                {learningPath.daily_schedule?.reduce((sum, day) => sum + day.videos.length, 0) || 0}
              </div>
              <div className="stat-label">Total Videos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-lg">{learningPath.duration_days}</div>
              <div className="stat-label">Days</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-lg">{Math.round(learningPath.total_estimated_hours)}</div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-lg">
                {Math.round(learningPath.total_estimated_hours / learningPath.duration_days * 10) / 10}
              </div>
              <div className="stat-label">Hours/Day</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Day Navigator */}
        <div className="col-span-1">
          <div className="card sticky top-6">
            <div className="card-header">
              <h3 className="card-title">Daily Schedule</h3>
              <p className="card-description">Navigate through your learning journey</p>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                {learningPath.daily_schedule?.map((day) => (
                  <button
                    key={day.day_number}
                    onClick={() => setActiveDay(day.day_number)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      activeDay === day.day_number
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface border-border hover:bg-background-secondary'
                    }`}
                  >
                    <div className="font-semibold">Day {day.day_number}</div>
                    <div className={`text-sm ${
                      activeDay === day.day_number ? 'text-white opacity-90' : 'text-secondary'
                    }`}>
                      {day.topic}
                    </div>
                    <div className={`text-xs mt-1 ${
                      activeDay === day.day_number ? 'text-white opacity-75' : 'text-muted'
                    }`}>
                      {day.videos.length} videos • {day.estimated_duration_minutes} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="col-span-3">
          {currentDay && (
            <div className="day-card">
              <div className="day-header">
                <div>
                  <h2 className="day-title">Day {currentDay.day_number}: {currentDay.topic}</h2>
                  <p className="text-sm text-secondary mt-1">{currentDay.notes}</p>
                </div>
                <div className="day-meta">
                  <div>🎯 Target: {currentDay.target_hours} hours</div>
                  <div>⏱️ Estimated: {currentDay.estimated_duration_minutes} minutes</div>
                  <div>📺 {currentDay.videos.length} videos</div>
                </div>
              </div>
              
              <div className="day-content">
                <div className="video-list">
                  {currentDay.videos.map((video, index) => (
                    <div key={video.id} className="video-card">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="video-thumbnail"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0Mkw3MiA1NC4yNTY0VjI5Ljc0MzZMNDggNDJaIiBmaWxsPSIjOUI5OUIzIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="video-content">
                        <h4 className="video-title">{video.title}</h4>
                        <div className="video-channel">📺 {video.channel}</div>
                        <div className="video-meta">
                          <span>⏱️ {formatDuration(video.duration)}</span>
                          <span>⭐ {video.quality_score.toFixed(1)}/10</span>
                          <span>#{index + 1}</span>
                        </div>
                        <p className="text-sm text-secondary mt-2 line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                      <div className="video-actions">
                        <button
                          onClick={() => openYouTubeVideo(video.url)}
                          className="btn btn-primary btn-sm"
                        >
                          ▶️ Watch
                        </button>
                        {user?.role === 'student' && (
                          <Link
                            to={`/progress/${learningPath.id}?day=${currentDay.day_number}&video=${video.id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            ✅ Mark Complete
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {currentDay.videos.length === 0 && (
                  <div className="text-center py-12 text-secondary">
                    <div className="text-4xl mb-4">📺</div>
                    <p>No videos found for this day.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActiveDay(Math.max(1, activeDay - 1))}
              disabled={activeDay === 1}
              className="btn btn-secondary"
            >
              ← Previous Day
            </button>
            <div className="text-sm text-secondary self-center">
              Day {activeDay} of {learningPath.duration_days}
            </div>
            <button
              onClick={() => setActiveDay(Math.min(learningPath.duration_days, activeDay + 1))}
              disabled={activeDay === learningPath.duration_days}
              className="btn btn-secondary"
            >
              Next Day →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathViewer;