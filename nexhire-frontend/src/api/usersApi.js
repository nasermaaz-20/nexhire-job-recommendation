import axiosInstance from './axiosInstance';

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/public/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addUserSkills = async (skills) => {
  try {
    const response = await axiosInstance.post('/users/skills', { skills });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUserSkill = async (skillId) => {
  try {
    const response = await axiosInstance.delete(`/users/skills/${skillId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserPreferences = async (data) => {
  try {
    const response = await axiosInstance.post('/users/preferences', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addUserPreferredLocations = async (locations) => {
  try {
    const response = await axiosInstance.post('/users/preferred-locations', {
      locations,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllSkills = async () => {
  try {
    const response = await axiosInstance.get('/skills');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllLocations = async () => {
  try {
    const response = await axiosInstance.get('/locations');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllFields = async () => {
  try {
    const response = await axiosInstance.get('/fields');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEnums = async () => {
  try {
    const response = await axiosInstance.get('/enums');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
