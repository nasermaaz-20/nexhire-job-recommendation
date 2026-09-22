import axiosInstance from './axiosInstance';

export const getAllJobs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await axiosInstance.get(`/jobs/${id}`);
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

export const updateJob = async (id, jobData) => {
  try {
    const response = await axiosInstance.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await axiosInstance.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addJobSkills = async (jobId, skills) => {
  try {
    const response = await axiosInstance.post(`/jobs/${jobId}/skills`, { skills });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyJobs = async () => {
  try {
    const response = await axiosInstance.get('/jobs/my-jobs/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const saveJob = async (jobId) => {
  try {
    const response = await axiosInstance.post('/interactions', {
      job_id: parseInt(jobId), // Convert to number - backend expects integer
      interaction_type: 2, // 2 = SAVE (not string 'save')
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unsaveJob = async (jobId) => {
  try {
    const response = await axiosInstance.delete(`/interactions/job/${jobId}/type/2`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSavedJobs = async () => {
  try {
    const response = await axiosInstance.get('/interactions/my-history', {
      params: { interaction_type: 'save' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
