import api from './api';

const submitFinalComplaint = async (analysisToken) => {
  try {
    const response = await api.post('/complaints', { analysisToken });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit complaint';
  }
};

export const complaintAnalysisService = {
  submitFinalComplaint
};
