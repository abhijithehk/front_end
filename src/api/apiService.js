import apiClient from './client';

const apiService = {
  // GET: Fetch data
  get: async (url, params = {}) => {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Error fetching data";
    }
  },

  // POST: Send/Create data
  post: async (url, data, params = {}) => {
    try {
      const response = await apiClient.post(url, data, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Error posting data";
    }
  },

  // PUT: Update data
  put: async (url, data, params = {}) => {
    try {
      const response = await apiClient.put(url, data, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Error updating data";
    }
  },

  // PATCH: Partial update data
  patch: async (url, data = {}, params = {}) => {
    try {
      const response = await apiClient.patch(url, data, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Error patching data";
    }
  },

  // DELETE: Remove data
  delete: async (url) => {
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Error deleting data";
    }
  }
};

export default apiService;