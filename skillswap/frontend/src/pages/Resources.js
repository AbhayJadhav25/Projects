import React, { useState, useEffect } from 'react';
import { getResources, uploadResource, likeResource } from '../utils/api';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Resources.css';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
};

const getTypeIcon = (type, mime) => {
  if (type === 'video' || mime?.startsWith('video/')) return 'Video';
  if (mime === 'application/pdf') return 'PDF';
  if (mime?.startsWith('image/')) return 'Image';
  if (mime?.includes('word')) return 'Document';
  return 'File';
};

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl; // Cloudinary URL
  return `${BASE_URL}/${fileUrl}`; // old local URL
};

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchResources = async () => {
    try {
      const { data } = await getResources({ search, type: typeFilter });
      setResources(data.resources);
    } catch {
      console.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchResources, 400);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) return setError('Please select a file');
    const maxSize = 100 * 1024 * 1024; // 100MB Cloudinary free limit
    if (form.file.size > maxSize) return setError('File size must be under 100 MB');

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
    formData.append('file', form.file);

    try {
      const { data } = await uploadResource(formData);
      setResources([data.resource, ...resources]);
      setForm({ title: '', description: '', category: '', tags: '', file: null });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await likeResource(id);
      setResources(resources.map((r) =>
        r._id === id
          ? {
            ...r,
            likes: data.liked
              ? [...r.likes, user._id]
              : r.likes.filter((i) => i !== user._id),
          }
          : r
      ));
    } catch {
      console.error('Like failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    setDeleting(id);
    try {
      await API.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Resource Share</h1>
            <p className="page-subtitle">Share and discover learning materials (up to 100 MB)</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : 'Upload Resource'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Upload Learning Resource</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-input" placeholder="Resource title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" placeholder="e.g. Programming, Design..."
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input type="text" className="form-input" placeholder="react, javascript, tutorial"
                    value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" placeholder="Describe this resource..." rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  File * <span style={{ color: 'var(--text-muted)' }}>(Max 100 MB — videos, PDFs, docs, images)</span>
                </label>
                <input type="file" className="form-input"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })} required />
                {form.file && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Selected: {form.file.name} ({formatSize(form.file.size)})
                  </p>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="se-toolbar" style={{ marginBottom: 24 }}>
          <input type="text" className="form-input se-search" placeholder="Search resources..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-input" style={{ width: 160 }} value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Books</div>
            <h3>No resources yet</h3>
            <p>Upload the first learning material!</p>
          </div>
        ) : (
          <div className="resources-grid">
            {resources.map((r) => {
              const isLiked = r.likes?.includes(user?._id);
              const isOwner = r.uploader?._id === user?._id;
              return (
                <div key={r._id} className="resource-card">
                  <div className="resource-icon-wrap">
                    <span className="resource-icon">{getTypeIcon(r.type, r.mimeType)}</span>
                    {r.type === 'video' && <span className="badge badge-accent">Video</span>}
                  </div>
                  <div className="resource-body">
                    <h3>{r.title}</h3>
                    {r.description && <p>{r.description}</p>}
                    <div className="resource-meta">
                      <span>By: {r.uploader?.name}</span>
                      <span>Size: {formatSize(r.fileSize)}</span>
                      <span>Downloads: {r.downloads}</span>
                    </div>
                    {r.tags?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {r.tags.map((t, i) => (
                          <span key={i} className="skill-tag" style={{ fontSize: '0.72rem' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="resource-actions">
                    <button
                      className={`action-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(r._id)}
                    >
                      {isLiked ? 'Liked' : 'Like'} {r.likes?.length || 0}
                    </button>
                    <a
                      href={getFileUrl(r.fileUrl)}
                      download={r.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Download
                    </a>
                    {isOwner && (
                      <button
                        className="btn btn-sm"
                        style={{ background: 'none', border: '1px solid #f87171', color: '#f87171', cursor: 'pointer' }}
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                      >
                        {deleting === r._id ? '...' : '🗑 Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;