import axiosInstance from './axiosInstance';

export const getCompanyProfile = async () => {
  try {
    const response = await axiosInstance.get('/companies/profile/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyById = async (companyId) => {
  try {
    const response = await axiosInstance.get(`/companies/${companyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCompanyProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/companies/profile', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await axiosInstance.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyJobs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/jobs/my-jobs/list', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateJob = async (jobId, data) => {
  try {
    const response = await axiosInstance.put(`/jobs/${jobId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const response = await axiosInstance.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleJobActive = async (jobId, currentIsActive) => {
  try {
    const response = await axiosInstance.put(`/jobs/${jobId}`, {
      is_active: currentIsActive ? 0 : 1,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJobApplicants = async (jobId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/applications/job/${jobId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateApplicantStatus = async (applicationId, status) => {
  try {
    const response = await axiosInstance.put(`/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const recordCompanyInteraction = async (userId, interactionType) => {
  try {
    const response = await axiosInstance.post('/interactions/company-interactions', {
      user_id: userId,
      interaction_type: interactionType,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyInteractionsHistory = async () => {
  try {
    const response = await axiosInstance.get('/interactions/company-interactions/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
