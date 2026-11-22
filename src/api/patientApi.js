import apiService from './apiService';

const patientApi = {
  // Register a new patient
  register: async (patientData) => {
    return await apiService.post('/patient/register', patientData);
  },

  // Get all patients
  getAll: async () => {
    return await apiService.get('/patient/all');
  },

  // Get patient by MRN
  getByMrn: async (mrn) => {
    return await apiService.get(`/patient/${mrn}`);
  },

  // Search patient by phone number or keyword
  search: async ({ phone, query } = {}) => {
    return await apiService.get('/patient/search', { phone, query });
  },

  // Search by phone convenience method
  searchByPhone: async (phone) => {
    return await apiService.get('/patient/search', { phone });
  }
};

export default patientApi;
