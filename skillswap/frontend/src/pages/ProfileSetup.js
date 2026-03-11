import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ProfileSetup.css';

const ProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePhoto: null,
    skillsToTeach: [],
    skillsToLearn: [],
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

  const removeSkill = (type, index) => {
    if (type === 'teach') {
      setForm({ ...form, skillsToTeach: form.skillsToTeach.filter((_, i) => i !== index) });
    } else {
      setForm({ ...form, skillsToLearn: form.skillsToLearn.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Name is required');
    if (form.skillsToTeach.length === 0) return setError('Add at least one skill you can teach');
    if (form.skillsToLearn.length === 0) return setError('Add at least one skill you want to learn');

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <div className="auth-logo" style={{ justifyContent: 'center', display: 'flex', gap: 8, fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>
            <span>Lightning</span><span className="gradient-text">SkillSwap</span>
          </div>
          <h1>Complete Your Profile</h1>
          <p>Tell us about yourself and your skills</p>
        </div>

        {/* Progress */}
        <div className="setup-progress">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`progress-dot ${step >= s ? 'active' : ''}`} onClick={() => step > s && setStep(s)}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`progress-line ${step > s ? 'active' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="progress-labels">
          <span>Basic Info</span>
          <span>Teach Skills</span>
          <span>Learn Skills</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="setup-step">
            <h2>Basic Information</h2>
            <div className="photo-upload">
              <label htmlFor="photo-input" className="photo-label">
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <span>Camera</span>
                    <span>Upload Photo</span>
                  </div>
                )}
              </label>
              <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              <p className="photo-hint">Click to upload your profile photo</p>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Tell others about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="City, Country"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <button className="btn btn-primary w-full" onClick={() => { if (!form.name.trim()) return setError('Name is required'); setError(''); setStep(2); }}>
              Next: Skills to Teach →
            </button>
          </div>
        )}

        {/* Step 2: Skills to Teach */}
        {step === 2 && (
          <div className="setup-step">
            <h2>Skills You Can Teach</h2>
            <p className="step-desc">What skills are you good at and willing to share?</p>
            <div className="skill-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JavaScript, Guitar, Photography..."
                value={teachSkill.name}
                onChange={(e) => setTeachSkill({ ...teachSkill, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addTeachSkill()}
              />
              <select
                className="form-input skill-level"
                value={teachSkill.level}
                onChange={(e) => setTeachSkill({ ...teachSkill, level: e.target.value })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={addTeachSkill}>+ Add</button>
            </div>
            <div className="skills-list">
              {form.skillsToTeach.map((s, i) => (
                <div key={i} className="skill-item">
                  <span>{s.name}</span>
                  <span className="badge badge-primary">{s.level}</span>
                  <button className="remove-skill" onClick={() => removeSkill('teach', i)}>×</button>
                </div>
              ))}
              {form.skillsToTeach.length === 0 && (
                <p className="empty-skills">No skills added yet. Add your first skill above!</p>
              )}
            </div>
            <div className="step-btns">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => { if (form.skillsToTeach.length === 0) return setError('Add at least one skill'); setError(''); setStep(3); }}>
                Next: Skills to Learn →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skills to Learn */}
        {step === 3 && (
          <div className="setup-step">
            <h2>Skills You Want to Learn</h2>
            <p className="step-desc">What would you like to learn from others?</p>
            <div className="skill-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Python, Cooking, Spanish..."
                value={learnSkill.name}
                onChange={(e) => setLearnSkill({ ...learnSkill, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addLearnSkill()}
              />
              <select
                className="form-input skill-level"
                value={learnSkill.priority}
                onChange={(e) => setLearnSkill({ ...learnSkill, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={addLearnSkill}>+ Add</button>
            </div>
            <div className="skills-list">
              {form.skillsToLearn.map((s, i) => (
                <div key={i} className="skill-item">
                  <span>{s.name}</span>
                  <span className="badge badge-cyan">{s.priority} priority</span>
                  <button className="remove-skill" onClick={() => removeSkill('learn', i)}>×</button>
                </div>
              ))}
              {form.skillsToLearn.length === 0 && (
                <p className="empty-skills">No skills added yet. What do you want to learn?</p>
              )}
            </div>
            <div className="step-btns">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
