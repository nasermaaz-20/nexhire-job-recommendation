import axiosInstance from './axiosInstance';

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Users Management
export const getUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Companies Management
export const getCompanies = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/companies', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCompanyStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/admin/companies/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCompanyVerification = async (id, is_verified) => {
  try {
    const response = await axiosInstance.put(`/admin/companies/${id}/verify`, { is_verified });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/companies/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Jobs Management
export const getAdminJobs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/jobs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminJobById = async (id) => {
  try {
    const response = await axiosInstance.get(`/admin/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Skills Management
export const getSkills = async () => {
  try {
    const response = await axiosInstance.get('/admin/skills');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSkill = async (data) => {
  try {
    const response = await axiosInstance.post('/admin/skills', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSkill = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/admin/skills/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSkill = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/skills/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Fields Management
export const getFields = async () => {
  try {
    const response = await axiosInstance.get('/admin/fields');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createField = async (data) => {
  try {
    const response = await axiosInstance.post('/admin/fields', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateField = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/admin/fields/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteField = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/fields/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Locations Management
export const getLocations = async () => {
  try {
    const response = await axiosInstance.get('/admin/locations');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createLocation = async (data) => {
  try {
    const response = await axiosInstance.post('/admin/locations', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateLocation = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/admin/locations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteLocation = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/locations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Analytics
export const getAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
