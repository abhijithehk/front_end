import apiService from './apiService';

const billingApi = {
  // Create a bill
  create: async (billData) => {
    return await apiService.post('/billing/create', billData);
  },

  // Get all bills
  getAll: async () => {
    return await apiService.get('/billing/all');
  },

  // Get bill by ID
  getById: async (id) => {
    return await apiService.get(`/billing/${id}`);
  },

  // Get bill by invoice number
  getByInvoice: async (invoiceNumber) => {
    return await apiService.get(`/billing/invoice/${invoiceNumber}`);
  },

  // Get bills for patient
  getByPatient: async (mrn) => {
    return await apiService.get(`/billing/patient/${mrn}`);
  },

  // Pay bill
  pay: async (id, paymentMode = 'CASH') => {
    return await apiService.post(`/billing/pay/${id}`, null, { paymentMode });
  }
};

export default billingApi;
