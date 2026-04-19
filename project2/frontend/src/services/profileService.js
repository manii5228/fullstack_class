import API from './api';

// Get current user's full profile
export const getProfile = () => API.get('/profile');

// Update profile details
export const updateProfile = (data) => API.put('/profile', data);

// Upload profile picture
export const uploadProfilePic = (file) => {
  const formData = new FormData();
  formData.append('profile_pic', file);
  return API.post('/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
