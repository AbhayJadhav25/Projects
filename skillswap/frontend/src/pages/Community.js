import React, { useState, useEffect } from 'react';
import { getPosts, createPost, likePost, commentPost, deletePost } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Community.css';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentOpen, setCommentOpen] = useState({});
  const [commentText, setCommentText] = useState({});
  const [form, setForm] = useState({ title: '', content: '', type: 'post', image: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await getPosts();
      setPosts(data.posts);
    } catch {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('content', form.content);
    formData.append('type', form.type);
    if (form.title) formData.append('title', form.title);
    if (form.image) formData.append('image', form.image);
    try {
      const { data } = await createPost(formData);
      setPosts([data.post, ...posts]);
      setForm({ title: '', content: '', type: 'post', image: null });
      setShowForm(false);
    } catch {
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setPosts(posts.map((p) =>
        p._id === postId
          ? {
            ...p,
            likes: data.liked
              ? [...p.likes, user._id]
              : p.likes.filter((id) => id !== user._id),
          }
          : p
      ));
    } catch {
      console.error('Like failed');
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      const { data } = await commentPost(postId, text);
      setPosts(posts.map((p) =>
        p._id === postId ? { ...p, comments: [...p.comments, data.comment] } : p
      ));
      setCommentText({ ...commentText, [postId]: '' });
    } catch {
      console.error('Comment failed');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch {
      alert('Failed to delete post');
    }
  };

  const typeColors = { post: 'badge-primary', article: 'badge-accent', story: 'badge-success' };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Community</h1>
            <p className="page-subtitle">Share stories, articles and inspire others</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Create Post'}
          </button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <div className="card create-post-card">
            <h3>Create a Post</h3>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <div className="post-type-selector">
                  {['post', 'article', 'story'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-btn ${form.type === t ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, type: t })}
                    >
                      {t === 'post' ? 'Chat' : t === 'article' ? 'Document' : 'Star'} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {form.type !== 'post' && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <textarea
                  className="form-input form-textarea"
                  placeholder="Share your thoughts, experiences or insights..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Add Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting...' : 'Publish Post'}
              </button>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Document</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <div className="posts-feed">
            {posts.map((post) => {
              const isLiked = post.likes.includes(user?._id);
              const isOwner = post.author?._id === user?._id;
              return (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      {post.author?.profilePhoto ? (
                        <img src={post.author.profilePhoto?.startsWith('http') ? post.author.profilePhoto : post.author.profilePhoto?.startsWith('http') ? post.author.profilePhoto : `${BASE_URL}/${post.author.profilePhoto}`} alt="" className="author-avatar" />
                      ) : (
                        <div className="avatar-placeholder" style={{ width: 42, height: 42, fontSize: '1rem' }}>
                          {post.author?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="author-name">{post.author?.name || 'Unknown'}</div>
                        <div className="post-date">{new Date(post.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${typeColors[post.type]}`}>{post.type}</span>
                      {isOwner && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(post._id)}>Delete</button>
                      )}
                    </div>
                  </div>

                  {post.title && <h3 className="post-title">{post.title}</h3>}
                  <p className="post-content">{post.content}</p>
                  {post.image && (
                    <img src={`${BASE_URL}/${post.image}`} alt="Post" className="post-image" />
                  )}

                  <div className="post-actions">
                    <button
                      className={`action-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(post._id)}
                    >
                      {isLiked ? 'Liked' : 'Like'} {post.likes.length}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => setCommentOpen({ ...commentOpen, [post._id]: !commentOpen[post._id] })}
                    >
                      Chat {post.comments.length}
                    </button>
                  </div>

                  {commentOpen[post._id] && (
                    <div className="comments-section">
                      {post.comments.map((c, i) => (
                        <div key={i} className="comment">
                          <div className="comment-author">
                            {c.user?.profilePhoto ? (
                              <img src={`/${BASE_URL}/{c.user.profilePhoto}`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                            ) : (
                              <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>{c.user?.name?.[0]}</div>
                            )}
                            <strong>{c.user?.name}</strong>
                          </div>
                          <p>{c.text}</p>
                        </div>
                      ))}
                      <div className="comment-input-row">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Write a comment..."
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => handleComment(post._id)}>
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
