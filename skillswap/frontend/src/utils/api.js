import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const sendOTP = (email) => API.post('/auth/send-otp', { email });
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Users
export const getUsers = (params) => API.get('/users', { params });
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateProfile = (formData) =>
  API.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getLearningHub = () => API.get('/users/learning-hub');

// Messages
export const getMessages = (userId) => API.get(`/messages/${userId}`);
export const sendMessage = (userId, text) => API.post(`/messages/${userId}`, { text });
export const generateMeetLink = (userId) => API.post(`/messages/${userId}/meet`);

// Posts
export const getPosts = () => API.get('/posts');
export const createPost = (formData) =>
  API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const likePost = (id) => API.put(`/posts/${id}/like`);
export const commentPost = (id, text) => API.post(`/posts/${id}/comment`, { text });
export const deletePost = (id) => API.delete(`/posts/${id}`);

// Resources
export const getResources = (params) => API.get('/resources', { params });
export const uploadResource = (formData) =>
  API.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const downloadResource = (id) => API.get(`/resources/${id}/download`);
export const likeResource = (id) => API.put(`/resources/${id}/like`);

export default API;
