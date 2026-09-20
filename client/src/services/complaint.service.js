import api from './api';

export const complaintAPI = {
  analyzeIntake: (formData) => {
    // Requires Content-Type: multipart/form-data
    return api.post('/complaints/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Stubbed - Pending Step 5B backend integration
  getMyComplaints: async () => {
    try {
      const response = await api.get('/complaints');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Honest empty state when endpoint doesn't exist
        return { data: { success: true, data: [] } };
      }
      throw error;
    }
  },

  // Stubbed - Pending Step 5B backend integration
  getComplaintById: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: { success: true, data: null } };
      }
      throw error;
    }
  }
};
