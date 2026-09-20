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
  
  getMyComplaints: async () => {
    return await api.get('/complaints');
  },

  getComplaintById: async (id) => {
    return await api.get(`/complaints/${id}`);
  }
};
