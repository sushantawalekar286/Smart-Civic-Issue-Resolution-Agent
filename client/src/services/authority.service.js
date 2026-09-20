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
  }
};

export default authorityAPI;
