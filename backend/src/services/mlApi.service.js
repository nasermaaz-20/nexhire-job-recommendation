import axios from "axios";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

class MLApiService {
  async updateUserVector(userId, userData) {
    return await axios.post(`${ML_API_URL}/vectors/user/${userId}`, userData);
  }

  async updateJobVector(jobId, jobData) {
    return await axios.post(`${ML_API_URL}/vectors/job/${jobId}`, jobData);
  }
  /**
   * Get job recommendations for a user
   */
  async getJobRecommendations(userId, options = {}) {
    try {
      const { limit = 20, method = "hybrid" } = options;

      const response = await axios.get(`${ML_API_URL}/recommendations/jobs/${userId}`, {
        params: { limit, method },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error("ML API Error (getJobRecommendations):", error.message);
      throw new Error("Failed to fetch job recommendations from ML service");
    }
  }

  /**
   * Get candidate recommendations for a job
   */
  async getCandidateRecommendations(jobId, options = {}) {
    try {
      const { limit = 20, method = "hybrid" } = options;

      const response = await axios.get(
        `${ML_API_URL}/recommendations/candidates/${jobId}`,
        {
          params: { limit, method },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error("ML API Error (getCandidateRecommendations):", error.message);
      throw new Error("Failed to fetch candidate recommendations from ML service");
    }
  }

  /**
   * Trigger ML pipeline re-training
   */
  async triggerRetraining(pipeline = "all") {
    try {
      const response = await axios.post(
        `${ML_API_URL}/pipeline/run`,
        null,
        {
          params: { pipeline },
          timeout: 600000
        }
      );

      return response.data;
    } catch (error) {
      console.error("ML API Error (triggerRetraining):", error.message);
      throw new Error("Failed to trigger ML pipeline");
    }
  }

  /**
   * Health check for ML API
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
      return { status: "healthy", ...response.data };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  }
}

export default new MLApiService();

