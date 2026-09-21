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
  }
};

export default complaintAPI;
