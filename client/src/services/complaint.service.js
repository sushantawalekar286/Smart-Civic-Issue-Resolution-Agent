import api from './api';

export const complaintAPI = {
  analyzeIntake: (formData) => {
    // Let Axios and the browser automatically set multipart/form-data with the correct boundary
    return api.post('/complaints/analyze', formData);
  },
  
  getMyComplaints: () => {
    return api.get('/complaints');
  },

  getComplaintById: (id) => {
    return api.get(`/complaints/${id}`);
  },

  verifyResolution: (complaintId, payload) => {
    return api.post(`/complaints/${complaintId}/verify-resolution`, payload);
  }
};

export default complaintAPI;
