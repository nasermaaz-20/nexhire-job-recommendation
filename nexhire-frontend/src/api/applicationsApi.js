import axiosInstance from './axiosInstance';

export const applyToJob = async (jobId, coverLetter = '') => {
  try {
    const response = await axiosInstance.post('/applications', {
      job_id: Number(jobId),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyApplications = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/applications/my-applications', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJobApplications = async (jobId) => {
  try {
    const response = await axiosInstance.get(`/applications/job/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await axiosInstance.put(`/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const withdrawApplication = async (jobId) => {
  try {
    const response = await axiosInstance.delete(`/applications/job/${jobId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
