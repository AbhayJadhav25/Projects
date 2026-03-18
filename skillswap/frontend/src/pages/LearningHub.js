import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningHub } from '../utils/api';
import './LearningHub.css';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const LearningHub = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getLearningHub();
        setContacts(data.contacts);
      } catch {
        console.error('Failed');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Learning Hub</h1>
          <p className="page-subtitle">Your skill exchange history and connections</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Target</div>
            <h3>No connections yet</h3>
            <p>Start chatting with users on Skill Exchange to build your learning history.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/skill-exchange')}>
              Browse Skill Exchange
            </button>
          </div>
        ) : (
          <>
            <div className="hub-stats">
              <div className="hub-stat-card">
                <span className="hub-stat-icon"></span>
                <div>
                  <div className="hub-stat-val">{contacts.length}</div>
                  <div className="hub-stat-label">Total Connections</div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Your Skill Exchange Partners</h2>
            <div className="contacts-grid">
              {contacts.map(({ user, lastMessage, lastActivity }) => (
                <div key={user._id} className="contact-card" onClick={() => navigate(`/user/${user._id}`)}>
                  <div className="contact-avatar">
                    {user.profilePhoto ? (
                      <img src={profile.profilePhoto?.startsWith('http')
                        ? profile.profilePhoto
                        : `${BASE_URL}/${profile.profilePhoto}`} />
                    ) : (
                      <div className="avatar-placeholder" style={{ width: 60, height: 60, fontSize: '1.4rem' }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <h3>{user.name}</h3>
                    <p className="contact-last">{lastMessage || 'No messages yet'}</p>
                    <p className="contact-time">{new Date(lastActivity).toLocaleDateString()}</p>
                  </div>
                  <div className="contact-skills">
                    {user.skillsToTeach?.slice(0, 2).map((s, i) => (
                      <span key={i} className="skill-tag" style={{ fontSize: '0.72rem' }}>{s.name}</span>
                    ))}
                  </div>
                  <button className="btn btn-outline btn-sm">Open Chat →</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
