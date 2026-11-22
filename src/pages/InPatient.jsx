import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import patientApi from '../api/patientApi';
import masterApi from '../api/masterApi';
import './InPatient.css';

// ─── Default Ward Configuration ───────────────────────────────────────────────
const DEFAULT_WARDS = [
  { id: 'all',        label: 'All Wards',         icon: '🏥', color: '#7c3aed' },
  { id: 'general',   label: 'General Ward',       icon: '🛏️',  color: '#2563eb' },
  { id: 'icu',       label: 'ICU',                icon: '💊',  color: '#dc2626' },
  { id: 'maternity', label: 'Maternity Ward',     icon: '👶',  color: '#db2777' },
  { id: 'pediatric', label: 'Pediatric Ward',     icon: '🧒',  color: '#f59e0b' },
  { id: 'surgical',  label: 'Surgical Ward',      icon: '🩺',  color: '#059669' },
  { id: 'ortho',     label: 'Orthopaedic Ward',   icon: '🦴',  color: '#0891b2' },
  { id: 'cardio',    label: 'Cardiac Ward',       icon: '❤️',  color: '#e11d48' },
  { id: 'private',   label: 'Private Room',       icon: '🌟',  color: '#7c3aed' },
];

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return isNaN(age) ? 'N/A' : age;
};

const statusConfig = {
  Stable:     { color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  Critical:   { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  Recovering: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const InPatient = () => {
  const navigate = useNavigate();
  const [selectedWard, setSelectedWard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [patients, setPatients] = useState([]);
  const [wardsList, setWardsList] = useState(DEFAULT_WARDS);
  const [isLoading, setIsLoading] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    setIsLoading(true);

    // Load master wards dynamically
    masterApi.getWards().then(masterWards => {
      if (Array.isArray(masterWards) && masterWards.length > 0) {
        const dynamicWards = [
          { id: 'all', label: 'All Wards', icon: '🏥', color: '#7c3aed' },
          ...masterWards.map(mw => ({
            id: mw.wardCode?.toLowerCase() || `ward-${mw.id}`,
            label: mw.wardName,
            icon: mw.wardType === 'ICU' ? '💊' : mw.wardType === 'PRIVATE' ? '🌟' : '🛏️',
            color: mw.wardType === 'ICU' ? '#dc2626' : mw.wardType === 'PRIVATE' ? '#7c3aed' : '#2563eb'
          }))
        ];
        setWardsList(dynamicWards);
      }
    }).catch(err => console.warn("Failed to load master wards for IPD:", err));

    patientApi.getAll()
      .then(data => {
        if (Array.isArray(data)) {
          const wardList = ['general', 'cardio', 'surgical', 'ortho', 'pediatric', 'maternity', 'icu', 'private'];
          const mapped = data.map((p, index) => ({
            id: p.mrn || p.id,
            mrn: p.mrn || p.id,
            name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient',
            phone: p.phone || '',
            dob: p.dob || '',
            gender: p.gender || 'Not specified',
            ward: wardList[index % wardList.length],
            bed: `B-${100 + index}`,
            admitDate: p.registeredAt ? p.registeredAt.split('T')[0] : new Date().toISOString().split('T')[0],
            doctor: 'Dr. Sharma',
            diagnosis: 'Inpatient Care',
            days: 1 + (index % 5),
            status: index % 4 === 1 ? 'Critical' : index % 3 === 0 ? 'Recovering' : 'Stable'
          }));
          setPatients(mapped);
        } else {
          setPatients([]);
        }
      })
      .catch(err => {
        console.error("Failed to load patients for IPD:", err);
        setPatients([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filter by ward then by search query
  const filtered = patients
    .filter(p => selectedWard === 'all' || p.ward === selectedWard)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (searchType === 'name')   return p.name.toLowerCase().includes(q);
      if (searchType === 'id')     return p.id.toLowerCase().includes(q);
      if (searchType === 'phone')  return p.phone.includes(q);
      return true;
    });

  const activeWard = wardsList.find(w => w.id === selectedWard);

  // Count per ward for badges
  const wardCounts = {};
  patients.forEach(p => {
    wardCounts[p.ward] = (wardCounts[p.ward] || 0) + 1;
  });

  return (
    <div className="ipd-page-container">
      <Container fluid>
        {/* ── Header ── */}
        <div className="ipd-card shadow-lg">
          <div className="ipd-header">
            <span className="ipd-header-icon">🛌</span>
            <h2 className="ipd-title">InPatient Department</h2>
            <p className="ipd-subtitle mb-0">Manage admitted patients across all wards</p>
            <div className="ipd-header-badges">
              <span className="ipd-badge-pill">📅 {todayStr}</span>
              <span className="ipd-badge-pill">🛏️ {patients.length} Admitted</span>
            </div>
          </div>

          <div className="ipd-body">

            {/* ── Ward Selection ── */}
            <div className="ipd-section-title">
              <span>🏥</span> Select Ward
            </div>

            {/* Ward Dropdown (mobile-first) */}
            <div className="ipd-ward-select-wrapper">
              <Form.Label className="ipd-form-label">Filter by Ward</Form.Label>
              <div className="ipd-ward-row">
                <Form.Select
                  id="ward-dropdown"
                  className="ipd-ward-dropdown"
                  value={selectedWard}
                  onChange={e => { setSelectedWard(e.target.value); setSearchQuery(''); }}
                >
                  {wardsList.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.icon}  {w.label}
                      {w.id !== 'all' && wardCounts[w.id] ? ` (${wardCounts[w.id]})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>

            {/* Ward Quick-Select Pills */}
            <div className="ipd-ward-pills">
              {wardsList.map(w => {
                const count = w.id === 'all' ? patients.length : (wardCounts[w.id] || 0);
                const isActive = selectedWard === w.id;
                return (
                  <button
                    key={w.id}
                    className={`ipd-ward-pill ${isActive ? 'active' : ''}`}
                    style={isActive ? { '--pill-color': w.color, borderColor: w.color, background: `${w.color}18`, color: w.color } : {}}
                    onClick={() => { setSelectedWard(w.id); setSearchQuery(''); }}
                  >
                    <span className="ipd-pill-icon">{w.icon}</span>
                    <span className="ipd-pill-label">{w.label}</span>
                    {count > 0 && (
                      <span className="ipd-pill-count" style={isActive ? { background: w.color } : {}}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Search ── */}
            <div className="ipd-section-title" style={{ marginTop: '2rem' }}>
              <span>🔍</span> Search Patient
            </div>
            <div className="ipd-search-box">
              <Row className="align-items-end">
                <Col md={3} className="ipd-form-group">
                  <Form.Label className="ipd-form-label">Search By</Form.Label>
                  <Form.Select
                    id="ipd-search-type"
                    className="ipd-form-select"
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                  >
                    <option value="name">Patient Name</option>
                    <option value="id">Patient ID / MRN</option>
                    <option value="phone">Phone Number</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="ipd-form-group">
                  <Form.Label className="ipd-form-label">
                    {searchType === 'name' ? 'Patient Name' : searchType === 'id' ? 'Patient ID / MRN' : 'Phone Number'}
                  </Form.Label>
                  <Form.Control
                    id="ipd-search-input"
                    type="text"
                    className="ipd-form-control"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'name'  ? 'e.g., Rahul Sharma' :
                      searchType === 'id'    ? 'e.g., MRN-001' :
                                              'e.g., 9876543210'
                    }
                  />
                </Col>
                <Col md={3} className="ipd-form-group d-flex gap-2">
                  <Button className="btn-ipd-clear" variant="outline-secondary" onClick={() => setSearchQuery('')}>
                    ✕ Clear
                  </Button>
                </Col>
              </Row>
            </div>

            {/* ── Patient Table ── */}
            <div className="ipd-section-title" style={{ marginTop: '1.5rem' }}>
              <span>{activeWard?.icon}</span>
              {activeWard?.label} — Admitted Patients
              <span className="ipd-results-badge">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="ipd-empty-state">
                <span style={{ fontSize: '2.5rem' }}>🔎</span>
                <p>No admitted patients found {selectedWard !== 'all' ? `in ${activeWard?.label}` : ''} matching your criteria.</p>
              </div>
            ) : (
              <div className="ipd-table-wrapper">
                <table className="ipd-table">
                  <thead>
                    <tr>
                      <th>MRN</th>
                      <th>Patient Name</th>
                      <th>Age / Gender</th>
                      <th>Ward</th>
                      <th>Bed</th>
                      <th>Admit Date</th>
                      <th>Days</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(patient => {
                      const ward = WARDS.find(w => w.id === patient.ward);
                      const st = statusConfig[patient.status] || statusConfig.Stable;
                      return (
                        <tr key={patient.id}>
                          <td><span className="ipd-mrn-badge">{patient.id}</span></td>
                          <td><span className="ipd-patient-name">{patient.name}</span></td>
                          <td>
                            {calculateAge(patient.dob)} yrs &nbsp;
                            <span className={`ipd-gender-badge ${patient.gender.toLowerCase()}`}>
                              {patient.gender}
                            </span>
                          </td>
                          <td>
                            <span
                              className="ipd-ward-badge"
                              style={{ background: `${ward?.color}18`, color: ward?.color, border: `1px solid ${ward?.color}40` }}
                            >
                              {ward?.icon} {ward?.label}
                            </span>
                          </td>
                          <td><span className="ipd-bed-badge">{patient.bed}</span></td>
                          <td>
                            {new Date(patient.admitDate).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td>
                            <span className="ipd-days-badge">{patient.days}d</span>
                          </td>
                          <td>{patient.doctor}</td>
                          <td className="ipd-diagnosis">{patient.diagnosis}</td>
                          <td>
                            <span
                              className="ipd-status-badge"
                              style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                            >
                              {patient.status}
                            </span>
                          </td>
                          <td>
                            <div className="ipd-action-group">
                              <button className="btn-ipd-action view"  title="View Case Sheet" onClick={() => navigate(`/ipd/case-sheet/${patient.id}`, { state: { patient } })}>👁️</button>
                              <button className="btn-ipd-action notes" title="Add Notes">📝</button>
                              <button className="btn-ipd-action discharge" title="Discharge">🚪</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </Container>
    </div>
  );
};

export default InPatient;
