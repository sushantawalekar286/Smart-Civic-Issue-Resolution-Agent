import api from './api';

export const authorityAPI = {
  getAuthorityComplaints: (params = {}) => {
    return api.get('/authority/complaints', { params });
  },

  getAuthorityComplaint: (complaintId) => {
    return api.get(`/authority/complaints/${complaintId}`);
  },

  updateComplaintStatus: (complaintId, payload) => {
    return api.patch(`/authority/complaints/${complaintId}/status`, payload);
  },

  submitResolution: (complaintId, formData) => {
    return api.post(`/authority/complaints/${complaintId}/resolution`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default authorityAPI;
