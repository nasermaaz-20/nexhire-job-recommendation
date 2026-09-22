import axiosInstance from './axiosInstance';

export const login = async (email, password, type = 'user') => {
  try {
    const response = await axiosInstance.post('/auth/login', { 
      email, 
      password,
      type 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register/user', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerCompany = async (companyData) => {
  try {
    const response = await axiosInstance.post('/auth/register/company', companyData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
