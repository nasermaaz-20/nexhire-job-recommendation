import axiosInstance from './axiosInstance';

export const getMyRecommendations = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/recommendations/jobs/me', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJobRecommendationsForUser = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/recommendations/jobs/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJobCandidates = async (jobId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/recommendations/candidates/${jobId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const recordInteraction = async (jobId, interactionType) => {
  try {
    // Validate jobId
    const parsedJobId = parseInt(jobId);
    if (isNaN(parsedJobId) || parsedJobId <= 0) {
      console.error('Invalid job ID for interaction:', jobId);
      return; // Don't make API call with invalid ID
    }
    
    // Map string interaction types to numeric values expected by backend
    const interactionTypeMap = {
      'view': 1,
      'save': 2,
      'apply': 3
    };
    
    const interactionTypeValue = interactionTypeMap[interactionType] || interactionType;
    
    // Validate interaction type
    if (![1, 2, 3].includes(interactionTypeValue)) {
      console.error('Invalid interaction type:', interactionType);
      return; // Don't make API call with invalid type
    }
    
    const response = await axiosInstance.post('/interactions', {
      job_id: parsedJobId, // Already validated as positive integer
      interaction_type: interactionTypeValue, // Already validated as 1, 2, or 3
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const mlHealthCheck = async () => {
  try {
    const response = await axiosInstance.get('/recommendations/ml/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
