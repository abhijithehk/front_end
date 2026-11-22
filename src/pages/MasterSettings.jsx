import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Modal, Button, Form, Badge, Spinner } from 'react-bootstrap';
import masterApi from '../api/masterApi';
import './MasterSettings.css';

const ALL_SERVICES = [
  { id: 'OPD', label: 'Outpatient (OPD) Clinics', icon: '👨‍⚕️' },
  { id: 'IPD', label: 'Inpatient (IPD) Admissions', icon: '🛌' },
  { id: 'EMERGENCY', label: '24/7 Emergency & Trauma', icon: '🚨' },
  { id: 'ICU', label: 'Intensive Care Unit (ICU)', icon: '💊' },
  { id: 'PHARMACY', label: 'In-House Pharmacy', icon: '💊' },
  { id: 'LABORATORY', label: 'Clinical Pathology Laboratory', icon: '🧪' },
  { id: 'RADIOLOGY', label: 'Radiology & Medical Imaging', icon: '🩻' },
  { id: 'BLOOD_BANK', label: 'Blood Bank & Transfusion', icon: '🩸' },
  { id: 'AMBULANCE', label: '24/7 Ambulance Fleet', icon: '🚑' },
  { id: 'PHYSIOTHERAPY', label: 'Physiotherapy & Rehab', icon: '🧘' }
];

const WARD_TYPES = ['GENERAL', 'SEMI_PRIVATE', 'PRIVATE', 'ICU', 'MATERNITY', 'PEDIATRIC', 'SURGICAL', 'ORTHO'];
const BED_TYPES = ['STANDARD', 'ICU_BED', 'VENTILATOR', 'ELECTRIC', 'RECLINER'];
const BED_STATUSES = ['VACANT', 'OCCUPIED', 'MAINTENANCE'];
const USER_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'BILLING_EXECUTIVE'];
const CHARGE_CATEGORIES = ['ALL', 'CONSULTATION', 'BED_CHARGES', 'NURSING_CARE', 'LABORATORY', 'RADIOLOGY', 'PROCEDURE', 'SURGERY', 'OTHER'];

const MasterSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'wards'); // wards, hospital, depts, users, roles, billing
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Datasets
  const [stats, setStats] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('all');
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [screensCatalog, setScreensCatalog] = useState([]);
  const [billingCharges, setBillingCharges] = useState([]);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [billingCategoryFilter, setBillingCategoryFilter] = useState('ALL');

  // Role Screen Matrix State
  const [selectedRole, setSelectedRole] = useState('DOCTOR');
  const [currentRoleScreens, setCurrentRoleScreens] = useState([]);
  const [selectedUserIdForScreens, setSelectedUserIdForScreens] = useState('');
  const [userCustomScreens, setUserCustomScreens] = useState([]);

  // Modals state
  const [showWardModal, setShowWardModal] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [wardForm, setWardForm] = useState({ wardCode: '', wardName: '', wardType: 'GENERAL', floor: '', baseDailyRate: 1000, description: '' });

  const [showBedModal, setShowBedModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [bedForm, setBedForm] = useState({ bedNumber: '', wardId: '', bedType: 'STANDARD', status: 'VACANT', dailyCharge: 1000, notes: '' });

  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ code: '', name: '', legalName: '', tagline: '', registrationNumber: '', email: '', phone: '', emergencyNumber: '', address: '', city: '', state: '', pincode: '', country: 'India', website: '' });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ code: '', name: '', type: 'CLINICAL', headOfDepartment: '', location: '', contactExtension: '', description: '' });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', fullName: '', email: '', phone: '', role: 'DOCTOR', departmentId: '', designation: '', status: 'ACTIVE' });

  const [showChargeModal, setShowChargeModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [chargeForm, setChargeForm] = useState({ chargeCode: '', chargeName: '', category: 'CONSULTATION', departmentId: '', standardRate: 500, taxPercentage: 0, description: '' });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Initial Load
  useEffect(() => {
    loadAllMasterData();
  }, []);

  const loadAllMasterData = async () => {
    setIsLoading(true);
    try {
      const [sData, hData, dData, wData, bData, uData, rData, scData, cData] = await Promise.all([
        masterApi.getStats(),
        masterApi.getHospitals(),
        masterApi.getDepartments(),
        masterApi.getWards(),
        masterApi.getBeds(),
        masterApi.getUsers(),
        masterApi.getRoles(),
        masterApi.getScreens(),
        masterApi.getBillingCharges()
      ]);

      setStats(sData || {});
      setHospitals(hData || []);
      if (hData && hData.length > 0) {
        setSelectedHospital(hData[0]);
      }
      setDepartments(dData || []);
      setWards(wData || []);
      setBeds(bData || []);
      setUsers(uData || []);
      setRoles(rData || []);
      setScreensCatalog(scData || []);
      setBillingCharges(cData || []);

      // Init selected role screens
      const doctorRole = (rData || []).find(r => r.roleName === 'DOCTOR');
      if (doctorRole) {
        setCurrentRoleScreens(doctorRole.accessibleScreens ? doctorRole.accessibleScreens.split(',') : []);
      }
    } catch (err) {
      console.error("Failed to load master data:", err);
      showToast("Notice: Loaded master database snapshot.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── WARD ACTIONS ──────────────────────────────────────────────────────────
  const openAddWard = () => {
    setEditingWard(null);
    setWardForm({ wardCode: '', wardName: '', wardType: 'GENERAL', floor: '1st Floor', baseDailyRate: 1000, description: '' });
    setShowWardModal(true);
  };

  const openEditWard = (w) => {
    setEditingWard(w);
    setWardForm({ wardCode: w.wardCode, wardName: w.wardName, wardType: w.wardType, floor: w.floor || '', baseDailyRate: w.baseDailyRate || 1000, description: w.description || '' });
    setShowWardModal(true);
  };

  const handleSaveWard = async (e) => {
    e.preventDefault();
    try {
      if (editingWard) {
        await masterApi.updateWard(editingWard.id, { ...editingWard, ...wardForm });
        showToast(`Ward '${wardForm.wardName}' updated successfully!`);
      } else {
        await masterApi.createWard({ ...wardForm, hospitalId: selectedHospital?.id || 1 });
        showToast(`Ward '${wardForm.wardName}' created successfully!`);
      }
      setShowWardModal(false);
      const updatedWards = await masterApi.getWards();
      setWards(updatedWards);
      const updatedStats = await masterApi.getStats();
      setStats(updatedStats);
    } catch (err) {
      showToast("Error saving ward.");
    }
  };

  const handleDeleteWard = async (wardId, name) => {
    if (window.confirm(`Are you sure you want to delete ward '${name}' and all its registered beds?`)) {
      await masterApi.deleteWard(wardId);
      showToast(`Ward '${name}' deleted.`);
      const updatedWards = await masterApi.getWards();
      setWards(updatedWards);
      const updatedBeds = await masterApi.getBeds();
      setBeds(updatedBeds);
      if (selectedWardId === wardId) setSelectedWardId('all');
      const updatedStats = await masterApi.getStats();
      setStats(updatedStats);
    }
  };

  // ─── BED ACTIONS ───────────────────────────────────────────────────────────
  const openAddBed = (presetWardId) => {
    setEditingBed(null);
    const targetWardId = presetWardId || (selectedWardId !== 'all' ? selectedWardId : (wards[0]?.id || ''));
    const targetWard = wards.find(w => w.id === Number(targetWardId));
    setBedForm({
      bedNumber: '',
      wardId: targetWardId,
      bedType: 'STANDARD',
      status: 'VACANT',
      dailyCharge: targetWard ? targetWard.baseDailyRate : 1000,
      notes: ''
    });
    setShowBedModal(true);
  };

  const openEditBed = (b) => {
    setEditingBed(b);
    setBedForm({
      bedNumber: b.bedNumber,
      wardId: b.wardId,
      bedType: b.bedType || 'STANDARD',
      status: b.status || 'VACANT',
      dailyCharge: b.dailyCharge || 1000,
      notes: b.notes || ''
    });
    setShowBedModal(true);
  };

  const handleSaveBed = async (e) => {
    e.preventDefault();
    try {
      if (editingBed) {
        await masterApi.updateBed(editingBed.id, { ...editingBed, ...bedForm, wardId: Number(bedForm.wardId) });
        showToast(`Bed '${bedForm.bedNumber}' updated!`);
      } else {
        await masterApi.createBed({ ...bedForm, wardId: Number(bedForm.wardId) });
        showToast(`Bed '${bedForm.bedNumber}' added!`);
      }
      setShowBedModal(false);
      const updatedBeds = await masterApi.getBeds();
      setBeds(updatedBeds);
      const updatedWards = await masterApi.getWards();
      setWards(updatedWards);
      const updatedStats = await masterApi.getStats();
      setStats(updatedStats);
    } catch (err) {
      showToast("Error saving bed.");
    }
  };

  const handleToggleBedStatus = async (bed, newStatus) => {
    await masterApi.updateBed(bed.id, { ...bed, status: newStatus });
    showToast(`Bed ${bed.bedNumber} marked as ${newStatus}!`);
    const updatedBeds = await masterApi.getBeds();
    setBeds(updatedBeds);
    const updatedStats = await masterApi.getStats();
    setStats(updatedStats);
  };

  const handleDeleteBed = async (bedId, number) => {
    if (window.confirm(`Are you sure you want to remove bed '${number}' from ward?`)) {
      await masterApi.deleteBed(bedId);
      showToast(`Bed '${number}' removed.`);
      const updatedBeds = await masterApi.getBeds();
      setBeds(updatedBeds);
      const updatedWards = await masterApi.getWards();
      setWards(updatedWards);
      const updatedStats = await masterApi.getStats();
      setStats(updatedStats);
    }
  };

  // ─── HOSPITAL ACTIONS ──────────────────────────────────────────────────────
  const openEditHospital = (h) => {
    setEditingHospital(h);
    setHospitalForm({ ...h });
    setShowHospitalModal(true);
  };

  const openAddHospital = () => {
    setEditingHospital(null);
    setHospitalForm({ code: '', name: '', legalName: '', tagline: '', registrationNumber: '', email: '', phone: '', emergencyNumber: '', address: '', city: '', state: '', pincode: '', country: 'India', website: '' });
    setShowHospitalModal(true);
  };

  const handleSaveHospital = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        const res = await masterApi.updateHospital(editingHospital.id, { ...editingHospital, ...hospitalForm });
        showToast(`Hospital '${hospitalForm.name}' profile updated!`);
        setSelectedHospital(res);
      } else {
        const res = await masterApi.createHospital(hospitalForm);
        showToast(`Hospital '${hospitalForm.name}' created!`);
        setSelectedHospital(res);
      }
      setShowHospitalModal(false);
      const updatedHospitals = await masterApi.getHospitals();
      setHospitals(updatedHospitals);
    } catch (err) {
      showToast("Error saving hospital.");
    }
  };

  const handleToggleService = async (serviceId) => {
    if (!selectedHospital) return;
    const currentList = selectedHospital.enabledServices ? selectedHospital.enabledServices.split(',').filter(Boolean) : [];
    let updated;
    if (currentList.includes(serviceId)) {
      updated = currentList.filter(s => s !== serviceId);
    } else {
      updated = [...currentList, serviceId];
    }
    const servicesStr = updated.join(',');
    await masterApi.updateHospitalServices(selectedHospital.id, servicesStr);
    const updatedHosp = { ...selectedHospital, enabledServices: servicesStr };
    setSelectedHospital(updatedHosp);
    setHospitals(hospitals.map(h => h.id === selectedHospital.id ? updatedHosp : h));
    showToast(`Hospital service ${serviceId} toggled.`);
  };

  // ─── DEPARTMENT ACTIONS ────────────────────────────────────────────────────
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ code: '', name: '', type: 'CLINICAL', headOfDepartment: '', location: '', contactExtension: '', description: '' });
    setShowDeptModal(true);
  };

  const openEditDept = (d) => {
    setEditingDept(d);
    setDeptForm({ ...d });
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await masterApi.updateDepartment(editingDept.id, { ...editingDept, ...deptForm });
        showToast(`Department '${deptForm.name}' updated!`);
      } else {
        await masterApi.createDepartment({ ...deptForm, hospitalId: selectedHospital?.id || 1 });
        showToast(`Department '${deptForm.name}' added!`);
      }
      setShowDeptModal(false);
      const updatedDepts = await masterApi.getDepartments();
      setDepartments(updatedDepts);
    } catch (err) {
      showToast("Error saving department.");
    }
  };

  const handleDeleteDept = async (deptId, name) => {
    if (window.confirm(`Delete department '${name}'?`)) {
      await masterApi.deleteDepartment(deptId);
      showToast(`Department '${name}' deleted.`);
      const updatedDepts = await masterApi.getDepartments();
      setDepartments(updatedDepts);
    }
  };

  // ─── USER ACTIONS ──────────────────────────────────────────────────────────
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', fullName: '', email: '', phone: '', role: 'DOCTOR', departmentId: departments[0]?.id || '', designation: '', status: 'ACTIVE' });
    setShowUserModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ ...u });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await masterApi.updateUser(editingUser.id, { ...editingUser, ...userForm, departmentId: Number(userForm.departmentId) || null });
        showToast(`User '${userForm.username}' updated!`);
      } else {
        await masterApi.createUser({ ...userForm, hospitalId: selectedHospital?.id || 1, departmentId: Number(userForm.departmentId) || null });
        showToast(`User '${userForm.username}' created!`);
      }
      setShowUserModal(false);
      const updatedUsers = await masterApi.getUsers();
      setUsers(updatedUsers);
      const updatedStats = await masterApi.getStats();
      setStats(updatedStats);
    } catch (err) {
      showToast("Error saving user.");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Delete user '${username}'?`)) {
      await masterApi.deleteUser(userId);
      showToast(`User '${username}' deleted.`);
      const updatedUsers = await masterApi.getUsers();
      setUsers(updatedUsers);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await masterApi.updateUser(user.id, { ...user, status: newStatus });
    showToast(`User ${user.username} is now ${newStatus}!`);
    const updatedUsers = await masterApi.getUsers();
    setUsers(updatedUsers);
  };

  // ─── ROLE & SCREEN PERMISSIONS ACTIONS ─────────────────────────────────────
  const handleSelectRole = (roleName) => {
    setSelectedRole(roleName);
    const r = roles.find(item => item.roleName === roleName);
    setCurrentRoleScreens(r && r.accessibleScreens ? r.accessibleScreens.split(',').filter(Boolean) : []);
  };

  const handleToggleScreenForRole = (screenId) => {
    if (currentRoleScreens.includes(screenId)) {
      setCurrentRoleScreens(currentRoleScreens.filter(s => s !== screenId));
    } else {
      setCurrentRoleScreens([...currentRoleScreens, screenId]);
    }
  };

  const handleSelectAllScreens = () => {
    setCurrentRoleScreens(screensCatalog.map(s => s.id));
  };

  const handleClearAllScreens = () => {
    setCurrentRoleScreens([]);
  };

  const handleSaveRoleScreens = async () => {
    try {
      const screensStr = currentRoleScreens.join(',');
      await masterApi.saveRoleConfig({
        roleName: selectedRole,
        roleDescription: `${selectedRole} role access profile`,
        accessibleScreens: screensStr
      });
      showToast(`Screens for role '${selectedRole}' saved!`);
      const updatedRoles = await masterApi.getRoles();
      setRoles(updatedRoles);
    } catch {
      showToast("Error saving role screens.");
    }
  };

  const handleSelectUserForScreens = (userId) => {
    setSelectedUserIdForScreens(userId);
    const targetUser = users.find(u => u.id === Number(userId));
    if (targetUser && targetUser.screenPermissions) {
      setUserCustomScreens(targetUser.screenPermissions.split(',').filter(Boolean));
    } else {
      // default from role
      const userRole = roles.find(r => r.roleName === targetUser?.role);
      setUserCustomScreens(userRole?.accessibleScreens ? userRole.accessibleScreens.split(',').filter(Boolean) : []);
    }
  };

  const handleToggleScreenForUser = (screenId) => {
    if (userCustomScreens.includes(screenId)) {
      setUserCustomScreens(userCustomScreens.filter(s => s !== screenId));
    } else {
      setUserCustomScreens([...userCustomScreens, screenId]);
    }
  };

  const handleSaveUserScreens = async () => {
    if (!selectedUserIdForScreens) return;
    try {
      const screensStr = userCustomScreens.join(',');
      await masterApi.updateUserScreens(selectedUserIdForScreens, screensStr);
      showToast("User screen permissions updated!");
      const updatedUsers = await masterApi.getUsers();
      setUsers(updatedUsers);
    } catch {
      showToast("Error updating user screen permissions.");
    }
  };

  // ─── BILLING CHARGES ACTIONS ───────────────────────────────────────────────
  const openAddCharge = () => {
    setEditingCharge(null);
    setChargeForm({ chargeCode: '', chargeName: '', category: 'CONSULTATION', departmentId: departments[0]?.id || '', standardRate: 500, taxPercentage: 0, description: '' });
    setShowChargeModal(true);
  };

  const openEditCharge = (c) => {
    setEditingCharge(c);
    setChargeForm({ ...c });
    setShowChargeModal(true);
  };

  const handleSaveCharge = async (e) => {
    e.preventDefault();
    try {
      if (editingCharge) {
        await masterApi.updateBillingCharge(editingCharge.id, { ...editingCharge, ...chargeForm, departmentId: Number(chargeForm.departmentId) || null, standardRate: Number(chargeForm.standardRate), taxPercentage: Number(chargeForm.taxPercentage) });
        showToast(`Charge '${chargeForm.chargeName}' updated!`);
      } else {
        await masterApi.createBillingCharge({ ...chargeForm, hospitalId: selectedHospital?.id || 1, departmentId: Number(chargeForm.departmentId) || null, standardRate: Number(chargeForm.standardRate), taxPercentage: Number(chargeForm.taxPercentage) });
        showToast(`Charge '${chargeForm.chargeName}' created!`);
      }
      setShowChargeModal(false);
      const updatedCharges = await masterApi.getBillingCharges();
      setBillingCharges(updatedCharges);
    } catch (err) {
      showToast("Error saving billing charge.");
    }
  };

  const handleDeleteCharge = async (chargeId, name) => {
    if (window.confirm(`Delete billing charge '${name}'?`)) {
      await masterApi.deleteBillingCharge(chargeId);
      showToast(`Charge '${name}' deleted.`);
      const updatedCharges = await masterApi.getBillingCharges();
      setBillingCharges(updatedCharges);
    }
  };

  // Filtered views
  const filteredBeds = beds.filter(b => selectedWardId === 'all' || b.wardId === Number(selectedWardId));
  const filteredUsers = users.filter(u => !userRoleFilter || u.role === userRoleFilter);
  const filteredCharges = billingCharges.filter(c => billingCategoryFilter === 'ALL' || c.category === billingCategoryFilter);

  // Group screens by module for matrix
  const screensByModule = screensCatalog.reduce((acc, sc) => {
    const mod = sc.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(sc);
    return acc;
  }, {});

  return (
    <div className="master-container">
      <Container fluid>

        {/* ── Top Header Banner ── */}
        <div className="master-header-banner">
          <div>
            <div className="master-header-title">
              <span>⚙️</span> MasterApp Hospital Administration Hub
            </div>
            <p className="master-header-subtitle">
              Centralized master control for Hospitals, Wards, Beds, Departments, Users, Screens, and Billing Tariffs.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="master-quick-badge">
              🏥 {selectedHospital ? selectedHospital.name : 'Hospital Master'}
            </span>
            <button className="btn-master-outline" style={{ background: '#ffffff', color: '#0f172a' }} onClick={loadAllMasterData} disabled={isLoading}>
              {isLoading ? <Spinner animation="border" size="sm" /> : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        {/* ── Global Stats Strip ── */}
        <div className="master-stats-grid">
          <div className="master-stat-card">
            <div className="master-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>🏥</div>
            <div className="master-stat-info">
              <h3>{hospitals.length}</h3>
              <p>Hospitals / Facilities</p>
            </div>
          </div>
          <div className="master-stat-card">
            <div className="master-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🏢</div>
            <div className="master-stat-info">
              <h3>{departments.length}</h3>
              <p>Active Departments</p>
            </div>
          </div>
          <div className="master-stat-card">
            <div className="master-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🛏️</div>
            <div className="master-stat-info">
              <h3>{wards.length} Wards / {beds.length} Beds</h3>
              <p>{beds.filter(b => b.status === 'VACANT').length} Vacant • {beds.filter(b => b.status === 'OCCUPIED').length} Occupied</p>
            </div>
          </div>
          <div className="master-stat-card">
            <div className="master-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>👥</div>
            <div className="master-stat-info">
              <h3>{users.length}</h3>
              <p>Staff & Users</p>
            </div>
          </div>
          <div className="master-stat-card">
            <div className="master-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>💳</div>
            <div className="master-stat-info">
              <h3>{billingCharges.length}</h3>
              <p>Tariff Services</p>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <div className="master-tabs-wrapper">
          <button className={`master-tab-btn ${activeTab === 'wards' ? 'active' : ''}`} onClick={() => handleTabChange('wards')}>
            <span>🛏️</span> Wards & Beds
          </button>
          <button className={`master-tab-btn ${activeTab === 'hospital' ? 'active' : ''}`} onClick={() => handleTabChange('hospital')}>
            <span>🏥</span> Hospital & Services
          </button>
          <button className={`master-tab-btn ${activeTab === 'depts' ? 'active' : ''}`} onClick={() => handleTabChange('depts')}>
            <span>🏢</span> Departments
          </button>
          <button className={`master-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabChange('users')}>
            <span>👥</span> User Management
          </button>
          <button className={`master-tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => handleTabChange('roles')}>
            <span>🔐</span> Roles & Screen Permissions
          </button>
          <button className={`master-tab-btn ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => handleTabChange('billing')}>
            <span>💰</span> Billing Charges Tariff
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: WARDS & BEDS MANAGEMENT
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'wards' && (
          <div>
            {/* Ward List Header */}
            <div className="master-card">
              <div className="master-section-header">
                <div>
                  <h3><span>🛏️</span> Hospital Inpatient Wards</h3>
                  <p>Configure hospital wards, capacity, bed pricing, and wings.</p>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn-master-primary" onClick={openAddWard}>
                    ➕ Add New Ward
                  </button>
                  <button className="btn-master-outline" onClick={() => openAddBed()}>
                    🛏️ Add Bed to Ward
                  </button>
                </div>
              </div>

              {/* Ward Table */}
              <div className="master-table-wrapper mb-4">
                <table className="master-table">
                  <thead>
                    <tr>
                      <th>Ward Code</th>
                      <th>Ward Name</th>
                      <th>Type</th>
                      <th>Floor / Wing</th>
                      <th>Total Beds</th>
                      <th>Base Rate (₹/day)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wards.map(w => (
                      <tr key={w.id}>
                        <td><strong>{w.wardCode}</strong></td>
                        <td>{w.wardName}</td>
                        <td><Badge bg="primary">{w.wardType}</Badge></td>
                        <td>{w.floor || '—'}</td>
                        <td>
                          <Badge bg="secondary" pill className="px-2 py-1">
                            {w.totalBeds || beds.filter(b => b.wardId === w.id).length} Beds
                          </Badge>
                        </td>
                        <td>₹{w.baseDailyRate?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge-pill ${w.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                            {w.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openEditWard(w)} title="Edit Ward">✏️</button>
                            <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteWard(w.id, w.wardName)} title="Delete Ward">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ward Filter Pills for Beds */}
              <div className="master-section-header mt-4">
                <div>
                  <h3><span>🛌</span> Beds Grid & Occupancy</h3>
                  <p>Manage individual bed statuses (Vacant, Occupied, Maintenance) and rates.</p>
                </div>
                <button className="btn-master-primary" onClick={() => openAddBed(selectedWardId !== 'all' ? selectedWardId : null)}>
                  ➕ Add Bed
                </button>
              </div>

              <div className="ward-selection-strip">
                <div
                  className={`ward-pill ${selectedWardId === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedWardId('all')}
                >
                  <span>🏥</span> All Wards
                  <span className="ward-bed-count-badge">{beds.length}</span>
                </div>
                {wards.map(w => {
                  const count = beds.filter(b => b.wardId === w.id).length;
                  return (
                    <div
                      key={w.id}
                      className={`ward-pill ${selectedWardId === w.id ? 'active' : ''}`}
                      onClick={() => setSelectedWardId(w.id)}
                    >
                      <span>🛏️</span> {w.wardName}
                      <span className="ward-bed-count-badge">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bed Cards Grid */}
              {filteredBeds.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h4>No beds found in this ward.</h4>
                  <p>Click "Add Bed" to register beds for this ward.</p>
                </div>
              ) : (
                <div className="beds-grid">
                  {filteredBeds.map(bed => (
                    <div key={bed.id} className={`bed-card ${bed.status?.toLowerCase()}`}>
                      <div>
                        <div className="bed-header">
                          <span className="bed-number">{bed.bedNumber}</span>
                          <span className={`bed-status-badge ${bed.status?.toLowerCase()}`}>
                            {bed.status}
                          </span>
                        </div>
                        <div className="bed-info-row">
                          <span>Ward:</span>
                          <strong>{bed.wardName || bed.wardCode}</strong>
                        </div>
                        <div className="bed-info-row">
                          <span>Type:</span>
                          <span>{bed.bedType}</span>
                        </div>
                        <div className="bed-info-row">
                          <span>Rate:</span>
                          <strong>₹{bed.dailyCharge}/day</strong>
                        </div>

                        {bed.status === 'OCCUPIED' && (
                          <div className="bed-patient-highlight">
                            <div><strong>Patient:</strong> {bed.currentPatientName || 'Admitted Patient'}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>MRN: {bed.currentPatientMrn || 'N/A'}</div>
                          </div>
                        )}

                        {bed.notes && (
                          <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                            📝 {bed.notes}
                          </div>
                        )}
                      </div>

                      <div className="bed-actions">
                        <Form.Select
                          size="sm"
                          value={bed.status}
                          onChange={(e) => handleToggleBedStatus(bed, e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                        >
                          <option value="VACANT">Vacant</option>
                          <option value="OCCUPIED">Occupied</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </Form.Select>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => openEditBed(bed)} title="Edit Bed">✏️</button>
                        <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteBed(bed.id, bed.bedNumber)} title="Remove Bed">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: HOSPITAL PROFILE & SERVICES CONFIGURATION
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'hospital' && (
          <div>
            <Row>
              <Col lg={5}>
                <div className="master-card">
                  <div className="master-section-header">
                    <div>
                      <h3><span>🏥</span> Hospital Profile</h3>
                      <p>Identity, contact, and legal credentials.</p>
                    </div>
                    {selectedHospital && (
                      <button className="btn-master-outline" onClick={() => openEditHospital(selectedHospital)}>
                        ✏️ Edit Details
                      </button>
                    )}
                  </div>

                  {selectedHospital ? (
                    <div>
                      <div className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{selectedHospital.name}</h4>
                        <div className="text-muted mb-2">{selectedHospital.tagline || 'Multi-Speciality Healthcare Institution'}</div>
                        <Badge bg="success" className="me-2">{selectedHospital.status}</Badge>
                        <Badge bg="secondary">Code: {selectedHospital.code}</Badge>
                      </div>

                      <div className="mb-3">
                        <div className="bed-info-row"><span>Legal Entity:</span><strong>{selectedHospital.legalName || '—'}</strong></div>
                        <div className="bed-info-row"><span>Reg / License #:</span><strong>{selectedHospital.registrationNumber || '—'}</strong></div>
                        <div className="bed-info-row"><span>Email:</span><strong>{selectedHospital.email || '—'}</strong></div>
                        <div className="bed-info-row"><span>Phone:</span><strong>{selectedHospital.phone || '—'}</strong></div>
                        <div className="bed-info-row"><span>Emergency 24x7:</span><strong className="text-danger">{selectedHospital.emergencyNumber || '—'}</strong></div>
                        <div className="bed-info-row"><span>Address:</span><span>{selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state} - {selectedHospital.pincode}</span></div>
                        <div className="bed-info-row"><span>Website:</span><a href={selectedHospital.website} target="_blank" rel="noreferrer">{selectedHospital.website || '—'}</a></div>
                      </div>

                      <div className="d-flex justify-content-between pt-3 border-top">
                        <button className="btn btn-sm btn-outline-primary" onClick={openAddHospital}>
                          ➕ Register Another Facility
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p>No hospital profile configured.</p>
                      <button className="btn-master-primary" onClick={openAddHospital}>Create Hospital</button>
                    </div>
                  )}
                </div>
              </Col>

              <Col lg={7}>
                <div className="master-card">
                  <div className="master-section-header">
                    <div>
                      <h3><span>🩺</span> Hospital Services Configuration</h3>
                      <p>Toggle clinical and hospital departments enabled for this institution.</p>
                    </div>
                  </div>

                  <div className="service-tiles-grid">
                    {ALL_SERVICES.map(srv => {
                      const enabledList = selectedHospital?.enabledServices ? selectedHospital.enabledServices.split(',').filter(Boolean) : [];
                      const isEnabled = enabledList.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          className={`service-tile ${isEnabled ? 'enabled' : ''}`}
                          onClick={() => handleToggleService(srv.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => {}}
                          />
                          <div>
                            <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{srv.icon}</span>
                            <span style={{ fontSize: '0.88rem' }}>{srv.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3" style={{ background: '#f1f5f9', borderRadius: 10, fontSize: '0.86rem', color: '#475569' }}>
                    💡 <strong>Tip:</strong> Enabling or disabling services updates the medical directory and controls patient admission flows, clinic appointment queues, and billing line items.
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: DEPARTMENT MANAGEMENT
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'depts' && (
          <div className="master-card">
            <div className="master-section-header">
              <div>
                <h3><span>🏢</span> Hospital Departments</h3>
                <p>Clinical specialties, diagnostic laboratories, and administrative wings.</p>
              </div>
              <button className="btn-master-primary" onClick={openAddDept}>
                ➕ Add Department
              </button>
            </div>

            <div className="master-table-wrapper">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>Dept Code</th>
                    <th>Department Name</th>
                    <th>Type</th>
                    <th>Head of Department (HOD)</th>
                    <th>Location</th>
                    <th>Ext</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.code}</strong></td>
                      <td>{d.name}</td>
                      <td>
                        <Badge bg={d.type === 'CLINICAL' ? 'primary' : d.type === 'DIAGNOSTIC' ? 'info' : 'secondary'}>
                          {d.type}
                        </Badge>
                      </td>
                      <td>{d.headOfDepartment || '—'}</td>
                      <td>{d.location || '—'}</td>
                      <td>{d.contactExtension || '—'}</td>
                      <td>
                        <span className={`status-badge-pill ${d.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openEditDept(d)}>✏️</button>
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteDept(d.id, d.name)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: FULL USER MANAGEMENT
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="master-card">
            <div className="master-section-header">
              <div>
                <h3><span>👥</span> Staff & User Accounts</h3>
                <p>Manage healthcare personnel, roles, department assignments, and active statuses.</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  size="sm"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="">All Roles</option>
                  {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
                <button className="btn-master-primary" onClick={openAddUser}>
                  ➕ Add New User
                </button>
              </div>
            </div>

            <div className="master-table-wrapper">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                            {u.username?.substring(0, 2).toUpperCase()}
                          </div>
                          <strong>{u.username}</strong>
                        </div>
                      </td>
                      <td>{u.fullName}</td>
                      <td>
                        <Badge bg={
                          u.role === 'ADMIN' ? 'danger' :
                          u.role === 'DOCTOR' ? 'primary' :
                          u.role === 'NURSE' ? 'success' :
                          u.role === 'RECEPTIONIST' ? 'warning' : 'secondary'
                        }>
                          {u.role}
                        </Badge>
                      </td>
                      <td>{u.departmentName || 'General'}</td>
                      <td>{u.designation || 'Staff'}</td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          <div>{u.email}</div>
                          <div className="text-muted">{u.phone}</div>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-success' : 'btn-outline-secondary'} py-0 px-2`}
                          onClick={() => handleToggleUserStatus(u)}
                          title="Click to toggle status"
                        >
                          {u.status}
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openEditUser(u)} title="Edit User">✏️</button>
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteUser(u.id, u.username)} title="Delete User">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: ROLES & SCREEN PERMISSIONS MATRIX
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <div>
            <Row>
              <Col lg={4}>
                <div className="master-card mb-4">
                  <div className="master-section-header">
                    <div>
                      <h3><span>🔐</span> Role Profiles</h3>
                      <p>Select role to view or customize screen rights.</p>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {USER_ROLES.map(roleName => {
                      const isActive = selectedRole === roleName;
                      const roleConfig = roles.find(r => r.roleName === roleName);
                      const screensCount = roleConfig?.accessibleScreens ? roleConfig.accessibleScreens.split(',').filter(Boolean).length : 0;
                      return (
                        <div
                          key={roleName}
                          className="p-3 rounded-3"
                          style={{
                            cursor: 'pointer',
                            border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            background: isActive ? '#eff6ff' : '#ffffff',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleSelectRole(roleName)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <strong style={{ color: isActive ? '#1d4ed8' : '#0f172a' }}>{roleName}</strong>
                            <Badge bg={isActive ? 'primary' : 'light'} text={isActive ? 'white' : 'dark'}>
                              {screensCount} Screens
                            </Badge>
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                            {roleConfig?.roleDescription || 'Role access policy'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Individual User Screen Override */}
                  <div className="pt-3 border-top">
                    <h5 className="fw-bold mb-2">👤 Custom Screens for User</h5>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Override role defaults for a specific user.</p>
                    <Form.Select
                      size="sm"
                      value={selectedUserIdForScreens}
                      onChange={(e) => handleSelectUserForScreens(e.target.value)}
                      className="mb-2"
                    >
                      <option value="">-- Choose User --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.username} - {u.role})
                        </option>
                      ))}
                    </Form.Select>

                    {selectedUserIdForScreens && (
                      <button className="btn btn-sm btn-primary w-100 mt-2" onClick={handleSaveUserScreens}>
                        💾 Save Custom Screens for User
                      </button>
                    )}
                  </div>
                </div>
              </Col>

              <Col lg={8}>
                <div className="master-card">
                  <div className="master-section-header">
                    <div>
                      <h3>
                        <span>🖥️</span> Screen Access Matrix for: <Badge bg="primary" className="ms-2">{selectedUserIdForScreens ? `User (ID: ${selectedUserIdForScreens})` : selectedRole}</Badge>
                      </h3>
                      <p>Check the screens and modules accessible to this role or user.</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn-master-outline" onClick={handleSelectAllScreens}>Select All</button>
                      <button className="btn-master-outline" onClick={handleClearAllScreens}>Clear All</button>
                      {!selectedUserIdForScreens && (
                        <button className="btn-master-primary" onClick={handleSaveRoleScreens}>
                          💾 Save Role Permissions
                        </button>
                      )}
                    </div>
                  </div>

                  {Object.entries(screensByModule).map(([moduleName, moduleScreens]) => (
                    <div key={moduleName} className="screen-permission-module">
                      <div className="screen-module-header">
                        <span>📦 {moduleName}</span>
                        <Badge bg="secondary" pill>{moduleScreens.length}</Badge>
                      </div>

                      <div className="screens-checkbox-list">
                        {moduleScreens.map(sc => {
                          const isChecked = selectedUserIdForScreens
                            ? userCustomScreens.includes(sc.id)
                            : currentRoleScreens.includes(sc.id);

                          return (
                            <Form.Check
                              key={sc.id}
                              type="checkbox"
                              id={`screen-chk-${sc.id}`}
                              label={
                                <span style={{ fontSize: '0.88rem' }}>
                                  <span className="me-1">{sc.icon}</span> {sc.label}
                                </span>
                              }
                              checked={isChecked}
                              onChange={() => {
                                if (selectedUserIdForScreens) {
                                  handleToggleScreenForUser(sc.id);
                                } else {
                                  handleToggleScreenForRole(sc.id);
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: BILLING CHARGES TARIFF
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'billing' && (
          <div className="master-card">
            <div className="master-section-header">
              <div>
                <h3><span>💰</span> Hospital Billing Tariff Master</h3>
                <p>Standard rate cards for consultations, inpatient beds, nursing, procedures, and tests.</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  size="sm"
                  value={billingCategoryFilter}
                  onChange={(e) => setBillingCategoryFilter(e.target.value)}
                  style={{ width: '170px' }}
                >
                  {CHARGE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
                  ))}
                </Form.Select>
                <button className="btn-master-primary" onClick={openAddCharge}>
                  ➕ Add Tariff Item
                </button>
              </div>
            </div>

            <div className="master-table-wrapper">
              <table className="master-table">
                <thead>
                  <tr>
                    <th>Charge Code</th>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Standard Rate</th>
                    <th>GST %</th>
                    <th>Total Tariff</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharges.map(chg => {
                    const taxAmt = (chg.standardRate * (chg.taxPercentage || 0)) / 100;
                    const totalRate = chg.standardRate + taxAmt;
                    return (
                      <tr key={chg.id}>
                        <td><strong>{chg.chargeCode}</strong></td>
                        <td>
                          <div><strong>{chg.chargeName}</strong></div>
                          {chg.description && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{chg.description}</div>}
                        </td>
                        <td><Badge bg="info">{chg.category}</Badge></td>
                        <td>{chg.departmentName || 'Hospital General'}</td>
                        <td>₹{chg.standardRate?.toLocaleString()}</td>
                        <td>{chg.taxPercentage}%</td>
                        <td><strong style={{ color: '#059669' }}>₹{totalRate?.toLocaleString()}</strong></td>
                        <td>
                          <span className={`status-badge-pill ${chg.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                            {chg.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => openEditCharge(chg)}>✏️</button>
                            <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteCharge(chg.id, chg.chargeName)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODALS FOR CREATING / EDITING MASTER ENTITIES
            ══════════════════════════════════════════════════════════════════ */}

        {/* Ward Modal */}
        <Modal show={showWardModal} onHide={() => setShowWardModal(false)} centered>
          <Form onSubmit={handleSaveWard}>
            <Modal.Header closeButton>
              <Modal.Title>{editingWard ? 'Edit Ward' : 'Add New Hospital Ward'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Ward Code *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. GW-01, ICU-NORTH"
                  value={wardForm.wardCode}
                  onChange={e => setWardForm({ ...wardForm, wardCode: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ward Name *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. General Medicine Male Ward"
                  value={wardForm.wardName}
                  onChange={e => setWardForm({ ...wardForm, wardName: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ward Type</Form.Label>
                    <Form.Select
                      value={wardForm.wardType}
                      onChange={e => setWardForm({ ...wardForm, wardType: e.target.value })}
                    >
                      {WARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Floor / Wing</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 2nd Floor, Wing B"
                      value={wardForm.floor}
                      onChange={e => setWardForm({ ...wardForm, floor: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Base Bed Rate (₹/day)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={wardForm.baseDailyRate}
                  onChange={e => setWardForm({ ...wardForm, baseDailyRate: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description / Equipment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={wardForm.description}
                  onChange={e => setWardForm({ ...wardForm, description: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowWardModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Ward</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Bed Modal */}
        <Modal show={showBedModal} onHide={() => setShowBedModal(false)} centered>
          <Form onSubmit={handleSaveBed}>
            <Modal.Header closeButton>
              <Modal.Title>{editingBed ? 'Edit Bed' : 'Add Bed to Ward'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Bed Number / Identifier *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. B-101, ICU-04"
                  value={bedForm.bedNumber}
                  onChange={e => setBedForm({ ...bedForm, bedNumber: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Assigned Ward *</Form.Label>
                <Form.Select
                  required
                  value={bedForm.wardId}
                  onChange={e => setBedForm({ ...bedForm, wardId: e.target.value })}
                >
                  <option value="">-- Choose Ward --</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.wardName} ({w.wardCode})</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bed Type</Form.Label>
                    <Form.Select
                      value={bedForm.bedType}
                      onChange={e => setBedForm({ ...bedForm, bedType: e.target.value })}
                    >
                      {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Initial Status</Form.Label>
                    <Form.Select
                      value={bedForm.status}
                      onChange={e => setBedForm({ ...bedForm, status: e.target.value })}
                    >
                      {BED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Daily Charge (₹)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={bedForm.dailyCharge}
                  onChange={e => setBedForm({ ...bedForm, dailyCharge: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes / Special Features</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Next to window, cardiac monitor attached"
                  value={bedForm.notes}
                  onChange={e => setBedForm({ ...bedForm, notes: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowBedModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Bed</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Hospital Modal */}
        <Modal show={showHospitalModal} onHide={() => setShowHospitalModal(false)} size="lg" centered>
          <Form onSubmit={handleSaveHospital}>
            <Modal.Header closeButton>
              <Modal.Title>{editingHospital ? 'Edit Hospital Profile' : 'Register New Hospital / Facility'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hospital Name *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={hospitalForm.name}
                      onChange={e => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Facility Code *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={hospitalForm.code}
                      onChange={e => setHospitalForm({ ...hospitalForm, code: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Legal Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.legalName}
                      onChange={e => setHospitalForm({ ...hospitalForm, legalName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Registration / License #</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.registrationNumber}
                      onChange={e => setHospitalForm({ ...hospitalForm, registrationNumber: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={hospitalForm.email}
                      onChange={e => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.phone}
                      onChange={e => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Number 24x7</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.emergencyNumber}
                      onChange={e => setHospitalForm({ ...hospitalForm, emergencyNumber: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  type="text"
                  value={hospitalForm.address}
                  onChange={e => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.city}
                      onChange={e => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.state}
                      onChange={e => setHospitalForm({ ...hospitalForm, state: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      value={hospitalForm.pincode}
                      onChange={e => setHospitalForm({ ...hospitalForm, pincode: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowHospitalModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Hospital</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Department Modal */}
        <Modal show={showDeptModal} onHide={() => setShowDeptModal(false)} centered>
          <Form onSubmit={handleSaveDept}>
            <Modal.Header closeButton>
              <Modal.Title>{editingDept ? 'Edit Department' : 'Add New Department'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Department Code *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. CARDIO, ORTHO"
                  value={deptForm.code}
                  onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Department Name *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. Cardiology"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Department Type</Form.Label>
                <Form.Select
                  value={deptForm.type}
                  onChange={e => setDeptForm({ ...deptForm, type: e.target.value })}
                >
                  <option value="CLINICAL">Clinical</option>
                  <option value="DIAGNOSTIC">Diagnostic</option>
                  <option value="NON_CLINICAL">Non-Clinical</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Head of Department (HOD)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Dr. Ramesh Gupta"
                  value={deptForm.headOfDepartment}
                  onChange={e => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Block A, 2nd Floor"
                      value={deptForm.location}
                      onChange={e => setDeptForm({ ...deptForm, location: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Ext.</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 104"
                      value={deptForm.contactExtension}
                      onChange={e => setDeptForm({ ...deptForm, contactExtension: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeptModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Department</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* User Modal */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
          <Form onSubmit={handleSaveUser}>
            <Modal.Header closeButton>
              <Modal.Title>{editingUser ? 'Edit User' : 'Add New Staff User'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      disabled={!!editingUser}
                      value={userForm.username}
                      onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={userForm.fullName}
                      onChange={e => setUserForm({ ...userForm, fullName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={userForm.phone}
                      onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Role *</Form.Label>
                    <Form.Select
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={userForm.departmentId}
                      onChange={e => setUserForm({ ...userForm, departmentId: e.target.value })}
                    >
                      <option value="">-- No Department --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Designation / Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Senior Consultant Cardiologist"
                  value={userForm.designation}
                  onChange={e => setUserForm({ ...userForm, designation: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save User</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Billing Charge Modal */}
        <Modal show={showChargeModal} onHide={() => setShowChargeModal(false)} centered>
          <Form onSubmit={handleSaveCharge}>
            <Modal.Header closeButton>
              <Modal.Title>{editingCharge ? 'Edit Tariff Item' : 'Add Tariff Charge'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Charge Code *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. CONS-01, LAB-LIPID"
                  value={chargeForm.chargeCode}
                  onChange={e => setChargeForm({ ...chargeForm, chargeCode: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Service / Item Name *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. Specialist Consultation"
                  value={chargeForm.chargeName}
                  onChange={e => setChargeForm({ ...chargeForm, chargeName: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      value={chargeForm.category}
                      onChange={e => setChargeForm({ ...chargeForm, category: e.target.value })}
                    >
                      {CHARGE_CATEGORIES.filter(c => c !== 'ALL').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      value={chargeForm.departmentId}
                      onChange={e => setChargeForm({ ...chargeForm, departmentId: e.target.value })}
                    >
                      <option value="">General</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Standard Rate (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      min="0"
                      value={chargeForm.standardRate}
                      onChange={e => setChargeForm({ ...chargeForm, standardRate: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>GST / Tax (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={chargeForm.taxPercentage}
                      onChange={e => setChargeForm({ ...chargeForm, taxPercentage: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={chargeForm.description}
                  onChange={e => setChargeForm({ ...chargeForm, description: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowChargeModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Charge</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* ── Toast Alert ── */}
        {toastMessage && (
          <div className="master-alert-toast">
            <span>✨</span> {toastMessage}
          </div>
        )}

      </Container>
    </div>
  );
};

export default MasterSettings;
