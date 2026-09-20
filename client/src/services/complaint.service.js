import api from './api';

export const complaintAPI = {
  analyzeIntake: (formData) => {
    // Requires Content-Type: multipart/form-data
    return api.post('/complaints/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
