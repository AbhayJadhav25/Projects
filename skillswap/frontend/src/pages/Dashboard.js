import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Dashboard.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Dashboard = () => {
  const { user } = useAuth();
  const [freshUser, setFreshUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const [meRes, hubRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/users/learning-hub')
        ]);
        setFreshUser({
          ...meRes.data.user,
          connections: hubRes.data.contacts
        });
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchMe();
  }, []);
  const displayUser = freshUser || user;

  const stats = [
    { icon: 'Users', label: 'Connected Users', value: displayUser?.connections?.length || 0, color: '#6366f1' },
    { icon: 'Star', label: 'Rating', value: displayUser?.rating?.toFixed(1) || '0.0', color: '#f59e0b' },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-banner">
          <div className="banner-bg" />
          <div className="banner-content">
            <div className="banner-avatar">
              {displayUser?.profilePhoto ? (
                <img src={`${BASE_URL}/${displayUser.profilePhoto}`} alt={displayUser.name} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: '1.8rem' }}>
                  {displayUser?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <h1>Welcome back, <span className="gradient-text">{displayUser?.name || 'Explorer'}</span>!</h1>
              <p>{displayUser?.email}</p>
            </div>
          </div>
          <Link to="/skill-exchange" className="btn btn-primary get-started-btn">
            Get Started
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {[
                { to: '/skill-exchange', icon: 'Exchange', title: 'Find Skills', desc: 'Browse users and exchange skills' },
                { to: '/community', icon: 'Community', title: 'Community', desc: 'Share stories and posts' },
                { to: '/resources', icon: 'Resources', title: 'Resources', desc: 'Upload or browse learning materials' },
                { to: '/learning-hub', icon: 'Target', title: 'Learning Hub', desc: 'Your learning history' },
                { to: '/profile', icon: 'Edit', title: 'Edit Profile', desc: 'Update your skills and bio' },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="quick-action-card">
                  <span className="qa-icon">{a.icon}</span>
                  <div>
                    <div className="qa-title">{a.title}</div>
                    <div className="qa-desc">{a.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Your Skills</h2>
            <div className="skills-preview">
              <div className="skills-group">
                <h4>Can Teach</h4>
                <div className="skill-tags">
                  {displayUser?.skillsToTeach?.length > 0 ? (
                    displayUser.skillsToTeach.map((s, i) => (
                      <span key={i} className="skill-tag">{s.name} · {s.level}</span>
                    ))
                  ) : (
                    <Link to="/profile/setup" className="add-skills-btn">+ Add skills to teach</Link>
                  )}
                </div>
              </div>
              <div className="skills-group">
                <h4>Want to Learn</h4>
                <div className="skill-tags">
                  {displayUser?.skillsToLearn?.length > 0 ? (
                    displayUser.skillsToLearn.map((s, i) => (
                      <span key={i} className="skill-tag learn">{s.name} · {s.priority}</span>
                    ))
                  ) : (
                    <Link to="/profile/setup" className="add-skills-btn">+ Add skills to learn</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div className="how-to-use">
          <h2>How to Use SkillSwap</h2>
          <div className="how-grid">
            {[
              { step: '1', icon: 'Person', title: 'Complete Your Profile', desc: 'Add your photo, bio, skills to teach, and skills to learn.' },
              { step: '2', icon: 'Search', title: 'Browse Skill Exchange', desc: 'Find users with the skills you want and who want to learn what you know.' },
              { step: '3', icon: 'Chat', title: 'Connect & Chat', desc: 'Click on a user card, send them a message, and start a conversation.' },
              { step: '4', icon: 'Calendar', title: 'Schedule a Session', desc: 'Agree on a time in chat and generate a Google Meet link instantly.' },
              { step: '5', icon: 'Community', title: 'Contribute to Community', desc: 'Share articles, success stories, and learning resources.' },
              { step: '6', icon: 'Target', title: 'Track Your Progress', desc: 'Check the Learning Hub to see all your skill exchanges.' },
            ].map((h) => (
              <div key={h.step} className="how-card">
                <div className="how-step">{h.step}</div>
                <span className="how-icon">{h.icon}</span>
                <h4>{h.title}</h4>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Big CTA */}
        <div className="dashboard-cta">
          <h2>Ready to find your skill exchange partner?</h2>
          <p>Browse hundreds of users and connect with people who match your learning goals.</p>
          <Link to="/skill-exchange" className="btn btn-primary btn-lg">
            Go to Skill Exchange
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
