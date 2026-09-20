import api from './api';

export const getDashboard = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getComplaints = async (params = {}) => {
  const res = await api.get('/admin/complaints', { params });
  return res.data;
};

export const getComplaintById = async (complaintId) => {
  const res = await api.get(`/admin/complaints/${complaintId}`);
  return res.data;
};

export const getComplaintAgentActions = async (complaintId) => {
  const res = await api.get(`/admin/complaints/${complaintId}/agent-actions`);
  return res.data;
};

export const getAgentActions = async (params = {}) => {
  const res = await api.get('/admin/agent-actions', { params });
  return res.data;
};

export const getUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const createAuthority = async (data) => {
  const res = await api.post('/admin/authorities', data);
  return res.data;
};

export const updateAuthority = async (userId, data) => {
  const res = await api.patch(`/admin/authorities/${userId}`, data);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get('/admin/departments');
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await api.post('/admin/departments', data);
  return res.data;
};

export const updateDepartment = async (departmentId, data) => {
  const res = await api.patch(`/admin/departments/${departmentId}`, data);
  return res.data;
};

export const adminAPI = {
  getDashboard,
  getComplaints,
  getComplaintById,
  getComplaintAgentActions,
  getAgentActions,
  getUsers,
  createAuthority,
  updateAuthority,
  getDepartments,
  createDepartment,
  updateDepartment
};

export default adminAPI;
