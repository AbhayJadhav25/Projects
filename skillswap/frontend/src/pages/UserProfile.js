import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, getMessages, sendMessage, generateMeetLink } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import './UserProfile.css';
import { BASE_URL } from '../utils/api';
const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const BASE_URL = SOCKET_URL;
const socket = io(SOCKET_URL);

const UserProfile = () => {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [meetLoading, setMeetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const messagesEndRef = useRef(null);

  const conversationId = me && id
    ? [me._id, id].sort().join('_')
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, msgRes] = await Promise.all([
          getUserById(id),
          getMessages(id),
        ]);
        setProfile(profileRes.data.user);
        setMessages(msgRes.data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket setup
    socket.emit('user_connected', me?._id);
    if (conversationId) socket.join?.(conversationId);
    socket.emit('join_conversation', conversationId);

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('receive_meet_link', ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_meet_link');
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await sendMessage(id, text);
      setMessages((prev) => [...prev, data.message]);
      socket.emit('send_message', { conversationId, message: data.message });
      setText('');
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateMeet = async () => {
    setMeetLoading(true);
    try {
      const { data } = await generateMeetLink(id);
      setMessages((prev) => [...prev, data.message]);
      socket.emit('meet_link_generated', { conversationId, meetLink: data.meetLink, message: data.message });
    } catch {
      alert('Failed to generate meet link');
    } finally {
      setMeetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container loading-center">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="page"><div className="container"><p>User not found.</p></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="user-profile-layout">
          {/* Left: Profile */}
          <div className="up-sidebar">
            <div className="up-banner" />
            <div className="up-avatar-wrap">
              {profile.profilePhoto ? (
                <img src={`${BASE_URL}/${profile.profilePhoto}`} alt={profile.name} className="up-avatar" />
              ) : (
                <div className="avatar-placeholder" style={{ width: 90, height: 90, fontSize: '2rem' }}>
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="up-info">
              <h2>{profile.name}</h2>
              <p className="up-location">Location: {profile.location || 'Worldwide'}</p>
              {profile.bio && <p className="up-bio">{profile.bio}</p>}
            </div>

            <div className="up-skills">
              <div className="up-skill-section">
                <h4>Expert in</h4>
                <div className="skill-tags">
                  {profile.skillsToTeach?.map((s, i) => (
                    <span key={i} className="skill-tag">{s.name} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>· {s.level}</span></span>
                  ))}
                </div>
              </div>
              <div className="up-skill-section">
                <h4>Wants to learn</h4>
                <div className="skill-tags">
                  {profile.skillsToLearn?.map((s, i) => (
                    <span key={i} className="skill-tag learn">{s.name}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => setActiveTab('chat')}
            >
              Send Message
            </button>
          </div>

          {/* Right: Tabs */}
          <div className="up-main">
            <div className="up-tabs">
              {['profile', 'chat'].map((tab) => (
                <button
                  key={tab}
                  className={`up-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'profile' ? 'Profile' : 'Chat'}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="up-profile-tab">
                <div className="card">
                  <h3>About {profile.name}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 10 }}>
                    {profile.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div className="card mt-4">
                  <h3>Skills Overview</h3>
                  <div className="skills-overview">
                    <div>
                      <h5 style={{ color: 'var(--text-muted)', marginBottom: 10 }}>Can Teach ({profile.skillsToTeach?.length || 0})</h5>
                      {profile.skillsToTeach?.map((s, i) => (
                        <div key={i} className="skill-row">
                          <span>{s.name}</span>
                          <span className="badge badge-primary">{s.level}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 style={{ color: 'var(--text-muted)', marginBottom: 10 }}>Wants to Learn ({profile.skillsToLearn?.length || 0})</h5>
                      {profile.skillsToLearn?.map((s, i) => (
                        <div key={i} className="skill-row">
                          <span>{s.name}</span>
                          <span className="badge badge-cyan">{s.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="chat-container">
                <div className="chat-header">
                  <div className="chat-user-info">
                    {profile.profilePhoto ? (
                      <img src={`${BASE_URL}/${profile.profilePhoto}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: '1rem' }}>{profile.name?.[0]}</div>
                    )}
                    <span>{profile.name}</span>
                  </div>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleGenerateMeet}
                    disabled={meetLoading}
                  >
                    {meetLoading ? '...' : 'Generate Meet Link'}
                  </button>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chat-empty">
                      Start a conversation with {profile.name}!
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isMe = msg.sender?._id === me?._id || msg.sender === me?._id;
                    return (
                      <div key={i} className={`message ${isMe ? 'sent' : 'received'}`}>
                        {msg.isMeetInvite ? (
                          <div className="meet-message">
                            <span>Video</span>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: 6 }}>Google Meet Session</div>
                              <a href={msg.meetLink} target="_blank" rel="noopener noreferrer" className="meet-link-btn">
                                Join Meeting →
                              </a>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="message-bubble">{msg.text}</div>
                            <div className="message-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form" onSubmit={handleSend}>
                  <input
                    type="text"
                    className="form-input chat-input"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => socket.emit('typing', { conversationId, userId: me?._id })}
                    onBlur={() => socket.emit('stop_typing', { conversationId, userId: me?._id })}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
