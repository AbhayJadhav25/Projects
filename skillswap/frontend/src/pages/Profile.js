import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePhoto: null,
    skillsToTeach: user?.skillsToTeach || [],
    skillsToLearn: user?.skillsToLearn || [],
  });
  const [teachSkill, setTeachSkill] = useState({ name: '', level: 'Intermediate' });
  const [learnSkill, setLearnSkill] = useState({ name: '', priority: 'Medium' });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profilePhoto: file });
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('bio', form.bio);
    formData.append('location', form.location);
    formData.append('skillsToTeach', JSON.stringify(form.skillsToTeach));
    formData.append('skillsToLearn', JSON.stringify(form.skillsToLearn));
    if (form.profilePhoto) formData.append('profilePhoto', form.profilePhoto);
    try {
      const { data } = await updateProfile(formData);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const addTeachSkill = () => {
    if (!teachSkill.name.trim()) return;
    setForm({ ...form, skillsToTeach: [...form.skillsToTeach, { ...teachSkill }] });
    setTeachSkill({ name: '', level: 'Intermediate' });
  };

  const addLearnSkill = () => {
    if (!learnSkill.name.trim()) return;
    setForm({ ...form, skillsToLearn: [...form.skillsToLearn, { ...learnSkill }] });
    setLearnSkill({ name: '', priority: 'Medium' });
  };

  const currentPhoto = previewPhoto || (user?.profilePhoto
    ? (user.profilePhoto.startsWith('http')
      ? user.profilePhoto
      : `${BASE_URL}/${user.profilePhoto}`)
    : null);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="page-header">
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Keep your profile up to date</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20 }}>Basic Information</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 80, height: 80, fontSize: '2rem', margin: '0 auto' }}>
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <label htmlFor="photo-edit" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: 'block', cursor: 'pointer' }}>Change Photo</label>
                <input id="photo-edit" type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </div>
              <div style={{ flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="City, Country" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input form-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell the community about yourself..." />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Skills I Can Teach</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Skill name..." value={teachSkill.name} onChange={(e) => setTeachSkill({ ...teachSkill, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeachSkill())} />
              <select className="form-input" style={{ width: 150 }} value={teachSkill.level} onChange={(e) => setTeachSkill({ ...teachSkill, level: e.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Expert</option>
              </select>
              <button type="button" className="btn btn-primary btn-sm" onClick={addTeachSkill}>+ Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.skillsToTeach.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ flex: 1 }}>{s.name}</span>
                  <span className="badge badge-primary">{s.level}</span>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setForm({ ...form, skillsToTeach: form.skillsToTeach.filter((_, j) => j !== i) })}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Skills I Want to Learn</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Skill name..." value={learnSkill.name} onChange={(e) => setLearnSkill({ ...learnSkill, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLearnSkill())} />
              <select className="form-input" style={{ width: 150 }} value={learnSkill.priority} onChange={(e) => setLearnSkill({ ...learnSkill, priority: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <button type="button" className="btn btn-primary btn-sm" onClick={addLearnSkill}>+ Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.skillsToLearn.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ flex: 1 }}>{s.name}</span>
                  <span className="badge badge-cyan">{s.priority}</span>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setForm({ ...form, skillsToLearn: form.skillsToLearn.filter((_, j) => j !== i) })}>×</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
