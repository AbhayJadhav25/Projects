import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../utils/api';
import './SkillExchange.css';
import { BASE_URL } from '../utils/api';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const UserCard = ({ user, onClick }) => {
  const initials = user.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="user-card" onClick={() => onClick(user._id)}>
      <div className="card-header-bg" />
      <div className="card-profile">
        {user.profilePhoto ? (
          <img
            src={`${BASE_URL}/${user.profilePhoto}`}
            alt={user.name}
            className="card-avatar"
          />
        ) : (
          <div className="card-avatar-placeholder">{initials}</div>
        )}
        <div className="card-online-dot" />
      </div>
      <div className="card-info">
        <h3>{user.name}</h3>
        <p className="card-location">{user.location || 'Worldwide'}</p>
        {user.bio && <p className="card-bio">{user.bio.slice(0, 80)}{user.bio.length > 80 ? '...' : ''}</p>}
        <div className="card-rating">
          {'★'.repeat(Math.round(user.rating || 0))}
          <span>{user.rating > 0 ? user.rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
      <div className="card-skills">
        <div className="card-skill-group">
          <div className="card-skill-label">Expert in</div>
          <div className="skill-tags-small">
            {user.skillsToTeach?.slice(0, 3).map((s, i) => (
              <span key={i} className="skill-tag">{s.name}</span>
            ))}
            {user.skillsToTeach?.length > 3 && (
              <span className="skill-tag">+{user.skillsToTeach.length - 3}</span>
            )}
          </div>
        </div>
        <div className="card-skill-group">
          <div className="card-skill-label">Wants to learn</div>
          <div className="skill-tags-small">
            {user.skillsToLearn?.slice(0, 3).map((s, i) => (
              <span key={i} className="skill-tag learn">{s.name}</span>
            ))}
            {user.skillsToLearn?.length > 3 && (
              <span className="skill-tag learn">+{user.skillsToLearn.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      <button className="card-connect-btn">Connect</button>
    </div>
  );
};

const SkillExchange = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers({ search, skill: filter });
      setUsers(data.users);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [search, filter]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Skill Exchange</h1>
          <p className="page-subtitle">Find your perfect skill-exchange partner</p>
        </div>

        {/* Search & Filter */}
        <div className="se-toolbar">
          <input
            type="text"
            className="form-input se-search"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="text"
            className="form-input se-filter"
            placeholder="Filter by skill..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <span className="se-count">{users.length} users found</span>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Finding skill partners...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Search</div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard key={user._id} user={user} onClick={(id) => navigate(`/user/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillExchange;
