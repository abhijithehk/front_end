import apiService from './apiService';

const appointmentApi = {
  // Book an OP visit / appointment
  book: async (bookingData) => {
    return await apiService.post('/appointment/book', bookingData);
  },

  // Get today's visits/appointments
  getToday: async () => {
    return await apiService.get('/appointment/today');
  },

  // Get queue for department
  getQueue: async (department, date) => {
    return await apiService.get(`/appointment/queue/${department}`, { date });
  },

  // Get appointments for patient
  getByPatient: async (mrn) => {
    return await apiService.get(`/appointment/patient/${mrn}`);
  },

  // Update appointment status (e.g., 'WAITING', 'CALLING', 'CONSULTED', 'CANCELLED')
  updateStatus: async (id, status) => {
    return await apiService.patch(`/appointment/${id}/status`, null, { status });
  }
};

export default appointmentApi;
