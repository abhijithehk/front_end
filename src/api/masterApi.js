import apiService from './apiService';

// Default initial datasets to provide instant responsiveness and graceful offline fallback
const SEED_HOSPITALS = [
  {
    id: 1,
    code: 'HMS-MAIN',
    name: 'Indic Memorial Multi-Speciality Hospital',
    legalName: 'Indic Healthcare Private Limited',
    tagline: 'Excellence in Compassionate Care',
    registrationNumber: 'HOSP-IND-2024-001',
    email: 'contact@indichospital.org',
    phone: '+91 80 2345 6789',
    emergencyNumber: '+91 80 2345 9999',
    address: '45 Healthcare Boulevard, Medical Tech City',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    country: 'India',
    website: 'https://indichospital.org',
    status: 'ACTIVE',
    enabledServices: 'OPD,IPD,EMERGENCY,ICU,PHARMACY,LABORATORY,RADIOLOGY,BLOOD_BANK,AMBULANCE,PHYSIOTHERAPY',
    enabledScreens: 'dashboard,dashboard-reception,dashboard-doctor,dashboard-nurse,dashboard-admin,booking,visit,patients,pre-check,post-check,op-nursing,ip-nursing,opd-general,opd-ortho,opd-pediatric,opd-dental,opd-ent,opd-gastro,ipd,create-bill,op-billing,ip-billing,lab-billing,pharmacy-billing,other-billing,op-pharmacy,ip-pharmacy,manual-dispensing,store,reports,settings'
  }
];

const SEED_DEPARTMENTS = [
  { id: 1, hospitalId: 1, code: 'GEN-MED', name: 'General Medicine', type: 'CLINICAL', headOfDepartment: 'Dr. Rahul Sharma', location: 'Block A, 1st Floor', contactExtension: '101', status: 'ACTIVE', description: 'Internal and Primary Healthcare' },
  { id: 2, hospitalId: 1, code: 'ORTHO', name: 'Orthopaedics', type: 'CLINICAL', headOfDepartment: 'Dr. Priya Menon', location: 'Block B, Ground Floor', contactExtension: '102', status: 'ACTIVE', description: 'Bone, Joint & Trauma Care' },
  { id: 3, hospitalId: 1, code: 'PED', name: 'Paediatrics', type: 'CLINICAL', headOfDepartment: 'Dr. Anita Roy', location: 'Block C, 2nd Floor', contactExtension: '103', status: 'ACTIVE', description: 'Child & Infant Care' },
  { id: 4, hospitalId: 1, code: 'ICU-DEPT', name: 'Intensive Care Unit', type: 'CLINICAL', headOfDepartment: 'Dr. Vikram Rathore', location: 'Block A, 3rd Floor', contactExtension: '104', status: 'ACTIVE', description: 'Critical & Emergency Care' },
  { id: 5, hospitalId: 1, code: 'RAD', name: 'Radiology & Imaging', type: 'DIAGNOSTIC', headOfDepartment: 'Dr. Sunita Rao', location: 'Basement Level 1', contactExtension: '201', status: 'ACTIVE', description: 'X-Ray, MRI, CT & Ultrasound' },
  { id: 6, hospitalId: 1, code: 'PATH', name: 'Pathology & Clinical Lab', type: 'DIAGNOSTIC', headOfDepartment: 'Dr. Arun Verma', location: 'Basement Level 1', contactExtension: '202', status: 'ACTIVE', description: 'Blood, Urine & Biopsy Tests' },
  { id: 7, hospitalId: 1, code: 'PHARM', name: 'Pharmacy & Store', type: 'NON_CLINICAL', headOfDepartment: 'Rajesh K', location: 'Ground Floor Lobby', contactExtension: '301', status: 'ACTIVE', description: 'Medication Dispensing' }
];

const SEED_WARDS = [
  { id: 1, hospitalId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', wardType: 'GENERAL', floor: '1st Floor, Wing A', totalBeds: 6, baseDailyRate: 800, status: 'ACTIVE', description: 'General inpatient ward for adult male patients' },
  { id: 2, hospitalId: 1, wardCode: 'GW-FEM', wardName: 'General Ward (Female)', wardType: 'GENERAL', floor: '1st Floor, Wing B', totalBeds: 3, baseDailyRate: 800, status: 'ACTIVE', description: 'General inpatient ward for adult female patients' },
  { id: 3, hospitalId: 1, wardCode: 'ICU-MAIN', wardName: 'Intensive Care Unit (ICU)', wardType: 'ICU', floor: '3rd Floor', totalBeds: 3, baseDailyRate: 5000, status: 'ACTIVE', description: 'Equipped with ventilators and multi-parameter monitors' },
  { id: 4, hospitalId: 1, wardCode: 'PVT-DELUXE', wardName: 'Private Deluxe Suite', wardType: 'PRIVATE', floor: '4th Floor', totalBeds: 2, baseDailyRate: 3500, status: 'ACTIVE', description: 'Private air-conditioned room with attendant couch' },
  { id: 5, hospitalId: 1, wardCode: 'PED-WARD', wardName: 'Paediatric Care Ward', wardType: 'PEDIATRIC', floor: '2nd Floor', totalBeds: 2, baseDailyRate: 1200, status: 'ACTIVE', description: 'Dedicated child-friendly inpatient ward' }
];

const SEED_BEDS = [
  { id: 1, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-101', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 2, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-102', bedType: 'STANDARD', status: 'OCCUPIED', dailyCharge: 800, currentPatientMrn: 'MRN-2024-001', currentPatientName: 'Ramesh Kumar', notes: '', statusFlag: 'ACTIVE' },
  { id: 3, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-103', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 4, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-104', bedType: 'STANDARD', status: 'MAINTENANCE', dailyCharge: 800, notes: 'Wheel brake replacement', statusFlag: 'ACTIVE' },
  { id: 5, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-105', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 6, wardId: 1, wardCode: 'GW-MALE', wardName: 'General Ward (Male)', bedNumber: 'GM-106', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 7, wardId: 2, wardCode: 'GW-FEM', wardName: 'General Ward (Female)', bedNumber: 'GF-201', bedType: 'STANDARD', status: 'OCCUPIED', dailyCharge: 800, currentPatientMrn: 'MRN-2024-002', currentPatientName: 'Lakshmi Devi', notes: '', statusFlag: 'ACTIVE' },
  { id: 8, wardId: 2, wardCode: 'GW-FEM', wardName: 'General Ward (Female)', bedNumber: 'GF-202', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 9, wardId: 2, wardCode: 'GW-FEM', wardName: 'General Ward (Female)', bedNumber: 'GF-203', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 800, notes: '', statusFlag: 'ACTIVE' },
  { id: 10, wardId: 3, wardCode: 'ICU-MAIN', wardName: 'Intensive Care Unit (ICU)', bedNumber: 'ICU-01', bedType: 'VENTILATOR', status: 'OCCUPIED', dailyCharge: 5000, currentPatientMrn: 'MRN-2024-003', currentPatientName: 'Suresh Nair', notes: 'Continuous ECG monitoring', statusFlag: 'ACTIVE' },
  { id: 11, wardId: 3, wardCode: 'ICU-MAIN', wardName: 'Intensive Care Unit (ICU)', bedNumber: 'ICU-02', bedType: 'VENTILATOR', status: 'VACANT', dailyCharge: 5000, notes: '', statusFlag: 'ACTIVE' },
  { id: 12, wardId: 3, wardCode: 'ICU-MAIN', wardName: 'Intensive Care Unit (ICU)', bedNumber: 'ICU-03', bedType: 'ICU_BED', status: 'VACANT', dailyCharge: 4500, notes: '', statusFlag: 'ACTIVE' },
  { id: 13, wardId: 4, wardCode: 'PVT-DELUXE', wardName: 'Private Deluxe Suite', bedNumber: 'PVT-401', bedType: 'ELECTRIC', status: 'VACANT', dailyCharge: 3500, notes: '', statusFlag: 'ACTIVE' },
  { id: 14, wardId: 4, wardCode: 'PVT-DELUXE', wardName: 'Private Deluxe Suite', bedNumber: 'PVT-402', bedType: 'ELECTRIC', status: 'OCCUPIED', dailyCharge: 3500, currentPatientMrn: 'MRN-2024-004', currentPatientName: 'Meera Krishnan', notes: '', statusFlag: 'ACTIVE' },
  { id: 15, wardId: 5, wardCode: 'PED-WARD', wardName: 'Paediatric Care Ward', bedNumber: 'PED-01', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 1200, notes: '', statusFlag: 'ACTIVE' },
  { id: 16, wardId: 5, wardCode: 'PED-WARD', wardName: 'Paediatric Care Ward', bedNumber: 'PED-02', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 1200, notes: '', statusFlag: 'ACTIVE' }
];

const SEED_USERS = [
  { id: 1, username: 'admin', fullName: 'Dr. Hospital Administrator', email: 'admin@hms.local', phone: '9876500001', role: 'ADMIN', hospitalId: 1, hospitalName: 'Indic Memorial Multi-Speciality Hospital', designation: 'Chief Medical Officer & IT Director', status: 'ACTIVE', screenPermissions: '' },
  { id: 2, username: 'doctor', fullName: 'Dr. Rahul Sharma', email: 'doctor@hms.local', phone: '9876500002', role: 'DOCTOR', hospitalId: 1, hospitalName: 'Indic Memorial Multi-Speciality Hospital', departmentId: 1, departmentName: 'General Medicine', designation: 'Senior Consultant Physician', status: 'ACTIVE', screenPermissions: '' },
  { id: 3, username: 'nurse', fullName: 'Sister Marykutty', email: 'nurse@hms.local', phone: '9876500003', role: 'NURSE', hospitalId: 1, hospitalName: 'Indic Memorial Multi-Speciality Hospital', departmentId: 1, departmentName: 'General Medicine', designation: 'Nursing In-Charge (Wing A)', status: 'ACTIVE', screenPermissions: '' },
  { id: 4, username: 'reception', fullName: 'Anand Swaminathan', email: 'reception@hms.local', phone: '9876500004', role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Indic Memorial Multi-Speciality Hospital', designation: 'Front Desk Lead', status: 'ACTIVE', screenPermissions: '' },
  { id: 5, username: 'pharmacist', fullName: 'Kavitha Menon', email: 'pharmacy@hms.local', phone: '9876500005', role: 'PHARMACIST', hospitalId: 1, hospitalName: 'Indic Memorial Multi-Speciality Hospital', departmentId: 7, departmentName: 'Pharmacy & Store', designation: 'Chief Pharmacist', status: 'ACTIVE', screenPermissions: '' }
];

const SEED_ROLES = [
  { id: 1, roleName: 'ADMIN', roleDescription: 'Full administrative and configuration rights across entire HMS', accessibleScreens: 'dashboard,dashboard-reception,dashboard-doctor,dashboard-nurse,dashboard-admin,booking,visit,edit-visit,patients,pre-check,post-check,op-nursing,ip-nursing,opd-general,opd-ortho,opd-pediatric,opd-dental,opd-ent,opd-gastro,ipd,create-bill,op-billing,ip-billing,lab-billing,pharmacy-billing,other-billing,op-pharmacy,ip-pharmacy,manual-dispensing,store,reports,settings' },
  { id: 2, roleName: 'DOCTOR', roleDescription: 'Clinical EMR, consultations, OPD queues and IPD case management', accessibleScreens: 'dashboard,dashboard-doctor,visit,patients,opd-general,opd-ortho,opd-pediatric,opd-dental,opd-ent,opd-gastro,ipd,reports' },
  { id: 3, roleName: 'NURSE', roleDescription: 'Triage, vitals entry, IP/OP nursing stations, bed rounds', accessibleScreens: 'dashboard,dashboard-nurse,patients,pre-check,post-check,op-nursing,ip-nursing,ipd' },
  { id: 4, roleName: 'RECEPTIONIST', roleDescription: 'Patient registration, OP visit token booking, front desk', accessibleScreens: 'dashboard,dashboard-reception,booking,visit,patients,create-bill,op-billing' },
  { id: 5, roleName: 'PHARMACIST', roleDescription: 'Prescription fulfillment, pharmacy dispensing, medication inventory', accessibleScreens: 'dashboard,op-pharmacy,ip-pharmacy,manual-dispensing,pharmacy-billing,store' },
  { id: 6, roleName: 'BILLING_EXECUTIVE', roleDescription: 'Invoice generation, receipting, discharge clearance', accessibleScreens: 'dashboard,create-bill,op-billing,ip-billing,lab-billing,pharmacy-billing,other-billing,reports' }
];

const SEED_BILLING_CHARGES = [
  { id: 1, hospitalId: 1, chargeCode: 'CONS-GEN', chargeName: 'General Physician Consultation', category: 'CONSULTATION', departmentId: 1, departmentName: 'General Medicine', standardRate: 500, taxPercentage: 0, description: 'Standard outpatient consultation fee', status: 'ACTIVE' },
  { id: 2, hospitalId: 1, chargeCode: 'CONS-SPEC', chargeName: 'Specialist / Super-Specialist Consultation', category: 'CONSULTATION', departmentId: 2, departmentName: 'Orthopaedics', standardRate: 900, taxPercentage: 0, description: 'Super-specialist consultation', status: 'ACTIVE' },
  { id: 3, hospitalId: 1, chargeCode: 'BED-GEN', chargeName: 'General Ward Bed Rent (Per Day)', category: 'BED_CHARGES', standardRate: 800, taxPercentage: 0, description: 'Daily bed rate for general shared ward', status: 'ACTIVE' },
  { id: 4, hospitalId: 1, chargeCode: 'BED-ICU', chargeName: 'ICU Critical Bed (Per Day)', category: 'BED_CHARGES', standardRate: 5000, taxPercentage: 0, description: 'Includes 24hr monitoring and nursing care', status: 'ACTIVE' },
  { id: 5, hospitalId: 1, chargeCode: 'BED-PVT', chargeName: 'Private Deluxe Suite (Per Day)', category: 'BED_CHARGES', standardRate: 3500, taxPercentage: 0, description: 'Private single air-conditioned room', status: 'ACTIVE' },
  { id: 6, hospitalId: 1, chargeCode: 'NURS-DAILY', chargeName: 'Routine Nursing Care Fee', category: 'NURSING_CARE', standardRate: 400, taxPercentage: 0, description: 'Per day inpatient nursing supervision and vitals', status: 'ACTIVE' },
  { id: 7, hospitalId: 1, chargeCode: 'LAB-CBC', chargeName: 'Complete Blood Count (CBC) with ESR', category: 'LABORATORY', departmentId: 6, departmentName: 'Pathology & Clinical Lab', standardRate: 350, taxPercentage: 0, description: 'Automated hematology analyzer report', status: 'ACTIVE' },
  { id: 8, hospitalId: 1, chargeCode: 'LAB-LIPID', chargeName: 'Lipid Profile Fasting', category: 'LABORATORY', departmentId: 6, departmentName: 'Pathology & Clinical Lab', standardRate: 650, taxPercentage: 0, description: 'Cholesterol, HDL, LDL, Triglycerides', status: 'ACTIVE' },
  { id: 9, hospitalId: 1, chargeCode: 'RAD-XRAY', chargeName: 'Digital Chest X-Ray (PA View)', category: 'RADIOLOGY', departmentId: 5, departmentName: 'Radiology & Imaging', standardRate: 450, taxPercentage: 0, description: 'High resolution digital chest radiograph', status: 'ACTIVE' },
  { id: 10, hospitalId: 1, chargeCode: 'PROC-ECG', chargeName: '12-Lead Resting ECG', category: 'PROCEDURE', standardRate: 300, taxPercentage: 0, description: 'Electrocardiogram with rhythm interpretation', status: 'ACTIVE' }
];

// Helper to manage persistent local storage fallback when backend gateway is offline
const getLocal = (key, seed) => {
  try {
    const raw = localStorage.getItem(`hms_master_${key}`);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(`hms_master_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not save master data to local storage: ${key}`, e);
  }
};

const masterApi = {
  // ─── OVERVIEW STATS ──────────────────────────────────────────────────────────
  getStats: async () => {
    try {
      return await apiService.get('/master/stats');
    } catch {
      const hospitals = getLocal('hospitals', SEED_HOSPITALS);
      const depts = getLocal('departments', SEED_DEPARTMENTS);
      const wards = getLocal('wards', SEED_WARDS);
      const beds = getLocal('beds', SEED_BEDS);
      const users = getLocal('users', SEED_USERS);
      const charges = getLocal('charges', SEED_BILLING_CHARGES);
      return {
        totalHospitals: hospitals.length,
        totalDepartments: depts.length,
        totalWards: wards.length,
        totalBeds: beds.length,
        vacantBeds: beds.filter(b => b.status === 'VACANT').length,
        occupiedBeds: beds.filter(b => b.status === 'OCCUPIED').length,
        maintenanceBeds: beds.filter(b => b.status === 'MAINTENANCE').length,
        totalUsers: users.length,
        totalBillingCharges: charges.length
      };
    }
  },

  // ─── HOSPITALS ───────────────────────────────────────────────────────────────
  getHospitals: async () => {
    try {
      const data = await apiService.get('/master/hospitals');
      setLocal('hospitals', data);
      return data;
    } catch {
      return getLocal('hospitals', SEED_HOSPITALS);
    }
  },

  createHospital: async (data) => {
    try {
      const res = await apiService.post('/master/hospitals', data);
      const current = getLocal('hospitals', SEED_HOSPITALS);
      setLocal('hospitals', [...current, res]);
      return res;
    } catch {
      const current = getLocal('hospitals', SEED_HOSPITALS);
      const newItem = { ...data, id: Date.now(), status: data.status || 'ACTIVE' };
      setLocal('hospitals', [...current, newItem]);
      return newItem;
    }
  },

  updateHospital: async (id, data) => {
    try {
      const res = await apiService.put(`/master/hospitals/${id}`, data);
      const current = getLocal('hospitals', SEED_HOSPITALS);
      setLocal('hospitals', current.map(h => h.id === id ? res : h));
      return res;
    } catch {
      const current = getLocal('hospitals', SEED_HOSPITALS);
      const updated = current.map(h => h.id === id ? { ...h, ...data } : h);
      setLocal('hospitals', updated);
      return updated.find(h => h.id === id);
    }
  },

  deleteHospital: async (id) => {
    try {
      await apiService.delete(`/master/hospitals/${id}`);
    } catch (e) {
      console.warn("Backend deleteHospital error:", e);
    }
    const current = getLocal('hospitals', SEED_HOSPITALS);
    setLocal('hospitals', current.filter(h => h.id !== id));
    return true;
  },

  updateHospitalServices: async (id, services) => {
    try {
      return await apiService.patch(`/master/hospitals/${id}/services`, { services });
    } catch {
      const current = getLocal('hospitals', SEED_HOSPITALS);
      const updated = current.map(h => h.id === id ? { ...h, enabledServices: services } : h);
      setLocal('hospitals', updated);
      return updated.find(h => h.id === id);
    }
  },

  updateHospitalScreens: async (id, screens) => {
    try {
      return await apiService.patch(`/master/hospitals/${id}/screens`, { screens });
    } catch {
      const current = getLocal('hospitals', SEED_HOSPITALS);
      const updated = current.map(h => h.id === id ? { ...h, enabledScreens: screens } : h);
      setLocal('hospitals', updated);
      return updated.find(h => h.id === id);
    }
  },

  // ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
  getDepartments: async (hospitalId) => {
    try {
      const data = await apiService.get('/master/departments', hospitalId ? { hospitalId } : {});
      setLocal('departments', data);
      return data;
    } catch {
      return getLocal('departments', SEED_DEPARTMENTS);
    }
  },

  createDepartment: async (data) => {
    try {
      const res = await apiService.post('/master/departments', data);
      const current = getLocal('departments', SEED_DEPARTMENTS);
      setLocal('departments', [...current, res]);
      return res;
    } catch {
      const current = getLocal('departments', SEED_DEPARTMENTS);
      const newItem = { ...data, id: Date.now(), status: data.status || 'ACTIVE' };
      setLocal('departments', [...current, newItem]);
      return newItem;
    }
  },

  updateDepartment: async (id, data) => {
    try {
      const res = await apiService.put(`/master/departments/${id}`, data);
      const current = getLocal('departments', SEED_DEPARTMENTS);
      setLocal('departments', current.map(d => d.id === id ? res : d));
      return res;
    } catch {
      const current = getLocal('departments', SEED_DEPARTMENTS);
      const updated = current.map(d => d.id === id ? { ...d, ...data } : d);
      setLocal('departments', updated);
      return updated.find(d => d.id === id);
    }
  },

  deleteDepartment: async (id) => {
    try {
      await apiService.delete(`/master/departments/${id}`);
    } catch (e) {
      console.warn("Backend deleteDepartment error:", e);
    }
    const current = getLocal('departments', SEED_DEPARTMENTS);
    setLocal('departments', current.filter(d => d.id !== id));
    return true;
  },

  // ─── WARDS ───────────────────────────────────────────────────────────────────
  getWards: async (hospitalId) => {
    try {
      const data = await apiService.get('/master/wards', hospitalId ? { hospitalId } : {});
      setLocal('wards', data);
      return data;
    } catch {
      return getLocal('wards', SEED_WARDS);
    }
  },

  createWard: async (data) => {
    try {
      const res = await apiService.post('/master/wards', data);
      const current = getLocal('wards', SEED_WARDS);
      setLocal('wards', [...current, res]);
      return res;
    } catch {
      const current = getLocal('wards', SEED_WARDS);
      const newItem = { ...data, id: Date.now(), totalBeds: 0, status: data.status || 'ACTIVE' };
      setLocal('wards', [...current, newItem]);
      return newItem;
    }
  },

  updateWard: async (id, data) => {
    try {
      const res = await apiService.put(`/master/wards/${id}`, data);
      const current = getLocal('wards', SEED_WARDS);
      setLocal('wards', current.map(w => w.id === id ? res : w));
      return res;
    } catch {
      const current = getLocal('wards', SEED_WARDS);
      const updated = current.map(w => w.id === id ? { ...w, ...data } : w);
      setLocal('wards', updated);
      return updated.find(w => w.id === id);
    }
  },

  deleteWard: async (id) => {
    try {
      await apiService.delete(`/master/wards/${id}`);
    } catch (e) {
      console.warn("Backend deleteWard error:", e);
    }
    const currentWards = getLocal('wards', SEED_WARDS);
    setLocal('wards', currentWards.filter(w => w.id !== id));
    const currentBeds = getLocal('beds', SEED_BEDS);
    setLocal('beds', currentBeds.filter(b => b.wardId !== id));
    return true;
  },

  // ─── BEDS ────────────────────────────────────────────────────────────────────
  getBeds: async (wardId) => {
    try {
      const data = await apiService.get('/master/beds', wardId ? { wardId } : {});
      setLocal('beds', data);
      return data;
    } catch {
      const all = getLocal('beds', SEED_BEDS);
      return wardId ? all.filter(b => b.wardId === Number(wardId)) : all;
    }
  },

  createBed: async (data) => {
    try {
      const res = await apiService.post('/master/beds', data);
      const current = getLocal('beds', SEED_BEDS);
      setLocal('beds', [...current, res]);
      return res;
    } catch {
      const current = getLocal('beds', SEED_BEDS);
      const newItem = { ...data, id: Date.now(), status: data.status || 'VACANT', statusFlag: 'ACTIVE' };
      setLocal('beds', [...current, newItem]);
      // Update ward bed count
      const wards = getLocal('wards', SEED_WARDS);
      const updatedWards = wards.map(w => w.id === data.wardId ? { ...w, totalBeds: (w.totalBeds || 0) + 1 } : w);
      setLocal('wards', updatedWards);
      return newItem;
    }
  },

  updateBed: async (id, data) => {
    try {
      const res = await apiService.put(`/master/beds/${id}`, data);
      const current = getLocal('beds', SEED_BEDS);
      setLocal('beds', current.map(b => b.id === id ? res : b));
      return res;
    } catch {
      const current = getLocal('beds', SEED_BEDS);
      const updated = current.map(b => b.id === id ? { ...b, ...data } : b);
      setLocal('beds', updated);
      return updated.find(b => b.id === id);
    }
  },

  deleteBed: async (id) => {
    try {
      await apiService.delete(`/master/beds/${id}`);
    } catch (e) {
      console.warn("Backend deleteBed error:", e);
    }
    const current = getLocal('beds', SEED_BEDS);
    const target = current.find(b => b.id === id);
    setLocal('beds', current.filter(b => b.id !== id));
    if (target?.wardId) {
      const wards = getLocal('wards', SEED_WARDS);
      const updatedWards = wards.map(w => w.id === target.wardId ? { ...w, totalBeds: Math.max(0, (w.totalBeds || 1) - 1) } : w);
      setLocal('wards', updatedWards);
    }
    return true;
  },

  // ─── USERS ───────────────────────────────────────────────────────────────────
  getUsers: async (role, departmentId) => {
    try {
      const params = {};
      if (role) params.role = role;
      if (departmentId) params.departmentId = departmentId;
      const data = await apiService.get('/master/users', params);
      setLocal('users', data);
      return data;
    } catch {
      let list = getLocal('users', SEED_USERS);
      if (role) list = list.filter(u => u.role === role.toUpperCase());
      if (departmentId) list = list.filter(u => u.departmentId === Number(departmentId));
      return list;
    }
  },

  createUser: async (data) => {
    try {
      const res = await apiService.post('/master/users', data);
      const current = getLocal('users', SEED_USERS);
      setLocal('users', [...current, res]);
      return res;
    } catch {
      const current = getLocal('users', SEED_USERS);
      const newItem = { ...data, id: Date.now(), status: data.status || 'ACTIVE' };
      setLocal('users', [...current, newItem]);
      return newItem;
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await apiService.put(`/master/users/${id}`, data);
      const current = getLocal('users', SEED_USERS);
      setLocal('users', current.map(u => u.id === id ? res : u));
      return res;
    } catch {
      const current = getLocal('users', SEED_USERS);
      const updated = current.map(u => u.id === id ? { ...u, ...data } : u);
      setLocal('users', updated);
      return updated.find(u => u.id === id);
    }
  },

  deleteUser: async (id) => {
    try {
      await apiService.delete(`/master/users/${id}`);
    } catch (e) {
      console.warn("Backend deleteUser error:", e);
    }
    const current = getLocal('users', SEED_USERS);
    setLocal('users', current.filter(u => u.id !== id));
    return true;
  },

  updateUserScreens: async (id, screens) => {
    try {
      return await apiService.patch(`/master/users/${id}/screens`, { screens });
    } catch {
      const current = getLocal('users', SEED_USERS);
      const updated = current.map(u => u.id === id ? { ...u, screenPermissions: screens } : u);
      setLocal('users', updated);
      return updated.find(u => u.id === id);
    }
  },

  // ─── ROLES & SCREENS ─────────────────────────────────────────────────────────
  getRoles: async () => {
    try {
      const data = await apiService.get('/master/roles');
      setLocal('roles', data);
      return data;
    } catch {
      return getLocal('roles', SEED_ROLES);
    }
  },

  saveRoleConfig: async (data) => {
    try {
      const res = await apiService.post('/master/roles', data);
      const current = getLocal('roles', SEED_ROLES);
      const exists = current.some(r => r.roleName === data.roleName);
      setLocal('roles', exists ? current.map(r => r.roleName === data.roleName ? res : r) : [...current, res]);
      return res;
    } catch {
      const current = getLocal('roles', SEED_ROLES);
      const updated = current.map(r => r.roleName === data.roleName ? { ...r, ...data } : r);
      setLocal('roles', updated);
      return data;
    }
  },

  getScreens: async () => {
    try {
      return await apiService.get('/master/screens');
    } catch {
      return [
        { id: 'dashboard', label: 'Dashboard Overview', icon: '📊', module: 'Core' },
        { id: 'dashboard-reception', label: 'Reception Dashboard', icon: '📋', module: 'Dashboard' },
        { id: 'dashboard-doctor', label: 'Doctor Dashboard', icon: '🩺', module: 'Dashboard' },
        { id: 'dashboard-nurse', label: 'Nurse Dashboard', icon: '💉', module: 'Dashboard' },
        { id: 'dashboard-admin', label: 'Admin Dashboard', icon: '🏢', module: 'Dashboard' },
        { id: 'booking', label: 'Appointment Booking', icon: '📅', module: 'Appointments' },
        { id: 'visit', label: 'Doctor Visit Queue', icon: '🚪', module: 'Appointments' },
        { id: 'edit-visit', label: 'Edit Visit Records', icon: '📝', module: 'Appointments' },
        { id: 'patients', label: 'Patient Registration & Directory', icon: '👥', module: 'Patients' },
        { id: 'pre-check', label: 'Nursing Pre-Check (Vitals)', icon: '🩺', module: 'Nursing' },
        { id: 'post-check', label: 'Nursing Post-Check', icon: '🩺', module: 'Nursing' },
        { id: 'op-nursing', label: 'OP Nursing Station', icon: '🏥', module: 'Nursing' },
        { id: 'ip-nursing', label: 'IP Nursing Station', icon: '🛏️', module: 'Nursing' },
        { id: 'opd-general', label: 'General Medicine OP Clinic', icon: '👨‍⚕️', module: 'OPD Clinics' },
        { id: 'opd-ortho', label: 'Orthopaedics OP Clinic', icon: '🦴', module: 'OPD Clinics' },
        { id: 'opd-pediatric', label: 'Paediatrics OP Clinic', icon: '👶', module: 'OPD Clinics' },
        { id: 'opd-dental', label: 'Dental OP Clinic', icon: '🦷', module: 'OPD Clinics' },
        { id: 'opd-ent', label: 'ENT OP Clinic', icon: '👂', module: 'OPD Clinics' },
        { id: 'opd-gastro', label: 'Gastroenterology OP Clinic', icon: '🔬', module: 'OPD Clinics' },
        { id: 'ipd', label: 'InPatient Department (IPD)', icon: '🛌', module: 'InPatient' },
        { id: 'create-bill', label: 'Create Billing Invoice', icon: '🧾', module: 'Billing' },
        { id: 'op-billing', label: 'OP Billing', icon: '💰', module: 'Billing' },
        { id: 'ip-billing', label: 'IP Billing', icon: '💰', module: 'Billing' },
        { id: 'lab-billing', label: 'Lab Billing', icon: '🧪', module: 'Billing' },
        { id: 'pharmacy-billing', label: 'Pharmacy Billing', icon: '💊', module: 'Billing' },
        { id: 'other-billing', label: 'Other Services Billing', icon: '💳', module: 'Billing' },
        { id: 'op-pharmacy', label: 'OP Pharmacy Dispense', icon: '💊', module: 'Pharmacy' },
        { id: 'ip-pharmacy', label: 'IP Pharmacy Dispense', icon: '💊', module: 'Pharmacy' },
        { id: 'manual-dispensing', label: 'Manual Dispensing', icon: '📦', module: 'Pharmacy' },
        { id: 'store', label: 'Medical Store & Inventory', icon: '📦', module: 'Store' },
        { id: 'reports', label: 'Analytics & MIS Reports', icon: '📈', module: 'Reports' },
        { id: 'settings', label: 'Master Administration Control Center', icon: '⚙️', module: 'Administration' }
      ];
    }
  },

  // ─── BILLING CHARGES ─────────────────────────────────────────────────────────
  getBillingCharges: async (category, departmentId) => {
    try {
      const params = {};
      if (category && category !== 'ALL') params.category = category;
      if (departmentId) params.departmentId = departmentId;
      const data = await apiService.get('/master/billing-charges', params);
      setLocal('charges', data);
      return data;
    } catch {
      let list = getLocal('charges', SEED_BILLING_CHARGES);
      if (category && category !== 'ALL') list = list.filter(c => c.category === category);
      if (departmentId) list = list.filter(c => c.departmentId === Number(departmentId));
      return list;
    }
  },

  createBillingCharge: async (data) => {
    try {
      const res = await apiService.post('/master/billing-charges', data);
      const current = getLocal('charges', SEED_BILLING_CHARGES);
      setLocal('charges', [...current, res]);
      return res;
    } catch {
      const current = getLocal('charges', SEED_BILLING_CHARGES);
      const newItem = { ...data, id: Date.now(), status: data.status || 'ACTIVE' };
      setLocal('charges', [...current, newItem]);
      return newItem;
    }
  },

  updateBillingCharge: async (id, data) => {
    try {
      const res = await apiService.put(`/master/billing-charges/${id}`, data);
      const current = getLocal('charges', SEED_BILLING_CHARGES);
      setLocal('charges', current.map(c => c.id === id ? res : c));
      return res;
    } catch {
      const current = getLocal('charges', SEED_BILLING_CHARGES);
      const updated = current.map(c => c.id === id ? { ...c, ...data } : c);
      setLocal('charges', updated);
      return updated.find(c => c.id === id);
    }
  },

  deleteBillingCharge: async (id) => {
    try {
      await apiService.delete(`/master/billing-charges/${id}`);
    } catch (e) {
      console.warn("Backend deleteBillingCharge error:", e);
    }
    const current = getLocal('charges', SEED_BILLING_CHARGES);
    setLocal('charges', current.filter(c => c.id !== id));
    return true;
  }
};

export default masterApi;
