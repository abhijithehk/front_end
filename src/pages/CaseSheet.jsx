import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import patientApi from '../api/patientApi';
import './CaseSheet.css';

// ─── Mock Clinical Templates ──────────────────────────────────────────────────
const PROGRESS_NOTES = [
  { id: 1, date: '2026-04-14', time: '08:00', doctor: 'Dr. Sharma', type: 'Morning Round', note: 'Patient is hemodynamically stable. Fever subsided. Appetite improving. Continue current medications. Monitor vitals 4 hourly.', vitals: { bp: '118/76', pulse: 78, temp: '98.8', spo2: 98 } },
  { id: 2, date: '2026-04-13', time: '09:15', doctor: 'Dr. Sharma', type: 'Evening Round', note: 'Mild residual headache reported. IV fluids continued. Patient ambulatory. Plan to step down to oral medications tomorrow if stable.', vitals: { bp: '122/80', pulse: 82, temp: '99.4', spo2: 97 } },
  { id: 3, date: '2026-04-12', time: '10:30', doctor: 'Dr. Sharma', type: 'Admission Note', note: 'Patient admitted with high-grade fever (104°F), body ache, and weakness for 3 days. Started IV antibiotics and supportive care. Investigations ordered.', vitals: { bp: '115/72', pulse: 96, temp: '103.6', spo2: 96 } },
];

const MEDICATIONS = [
  { id: 1, drug: 'Inj. Ceftriaxone 1g',      route: 'IV',   freq: '0-0-1',   duration: '5 Days',  startDate: '2026-04-10', status: 'Active',      instructions: 'Dilute in 100mL NS, infuse over 30 min' },
  { id: 2, drug: 'Tab. Paracetamol 650mg',    route: 'Oral', freq: '1-1-1',   duration: '5 Days',  startDate: '2026-04-10', status: 'Active',      instructions: 'After food, SOS for fever > 101°F' },
  { id: 3, drug: 'Inj. Pantoprazole 40mg',    route: 'IV',   freq: '1-0-0',   duration: '5 Days',  startDate: '2026-04-10', status: 'Active',      instructions: 'Before breakfast' },
  { id: 4, drug: 'IV Fluids NS 500mL',        route: 'IV',   freq: 'Continuous', duration: '48 hrs', startDate: '2026-04-10', status: 'Completed', instructions: 'Rate: 80 mL/hr' },
  { id: 5, drug: 'Tab. Dolo 650mg',           route: 'Oral', freq: 'SOS',     duration: 'PRN',     startDate: '2026-04-12', status: 'Active',      instructions: 'SOS — if temp > 100.4°F' },
];

const LAB_RESULTS = [
  { id: 1, date: '2026-04-10', test: 'Complete Blood Count (CBC)',      result: 'WBC: 14.2 (↑)  Hb: 11.8  Plt: 185K',         status: 'Abnormal', flag: 'High WBC' },
  { id: 2, date: '2026-04-10', test: 'Dengue NS1 Antigen',             result: 'Non-Reactive',                                  status: 'Normal',   flag: '' },
  { id: 3, date: '2026-04-10', test: 'Widal Test',                     result: 'S.Typhi O: 1:160 (↑)  S.Typhi H: 1:80',       status: 'Abnormal', flag: 'Suggestive Typhoid' },
  { id: 4, date: '2026-04-10', test: 'Liver Function Tests (LFT)',     result: 'SGOT: 48  SGPT: 52  ALP: 110  Bilirubin: 1.1', status: 'Abnormal', flag: 'Mildly Elevated Enzymes' },
  { id: 5, date: '2026-04-10', test: 'Blood Culture & Sensitivity',    result: 'Salmonella typhi — Ceftriaxone Sensitive',      status: 'Positive', flag: 'Organism Identified' },
  { id: 6, date: '2026-04-12', test: 'CBC — Repeat',                   result: 'WBC: 11.4  Hb: 12.1  Plt: 198K',               status: 'Normal',   flag: 'Improving' },
];

const NURSING_NOTES = [
  { id: 1, date: '2026-04-14', time: '06:00', nurse: 'Sr. Deepa K.', note: 'Patient slept well. Morning vitals stable. Oral intake adequate. IV site patent, no redness.' },
  { id: 2, date: '2026-04-13', time: '14:00', nurse: 'Sr. Anitha V.', note: 'IV site changed to left arm after mild phlebitis noted on right. Patient cooperative. Temp: 99°F. Paracetamol given SOS.' },
  { id: 3, date: '2026-04-13', time: '22:00', nurse: 'Sr. Deepa K.', note: 'Night round done. Patient resting comfortably. IV fluids running at ordered rate. No complaints.' },
  { id: 4, date: '2026-04-12', time: '18:00', nurse: 'Sr. Anitha V.', note: 'Admission assessments completed. IV access established (right forearm). Pre-medications administered as per chart. Allergy documented: Penicillin.' },
];

const VITALS_HISTORY = [
  { date: '10 Apr 10AM', bp: '115/72', pulse: 96, temp: 103.6, spo2: 96 },
  { date: '10 Apr 06PM', bp: '118/74', pulse: 90, temp: 102.4, spo2: 97 },
  { date: '11 Apr 08AM', bp: '120/78', pulse: 86, temp: 101.2, spo2: 97 },
  { date: '11 Apr 06PM', bp: '119/76', pulse: 82, temp: 100.0, spo2: 98 },
  { date: '12 Apr 08AM', bp: '122/80', pulse: 80, temp: 99.4, spo2: 97 },
  { date: '13 Apr 08AM', bp: '118/76', pulse: 78, temp: 98.8, spo2: 98 },
  { date: '14 Apr 08AM', bp: '116/74', pulse: 76, temp: 98.6, spo2: 99 },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const labStatusConfig = {
  Normal:   { color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  Abnormal: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  Positive: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
};

const medStatusConfig = {
  Active:    { color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  Completed: { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  Stopped:   { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
};

const TABS = [
  { id: 'overview',   label: 'Overview',          icon: '📋' },
  { id: 'vitals',     label: 'Vitals Trend',       icon: '📈' },
  { id: 'progress',   label: 'Progress Notes',     icon: '📝' },
  { id: 'medications', label: 'Medications',       icon: '💊' },
  { id: 'labs',       label: 'Lab Results',        icon: '🧪' },
  { id: 'nursing',    label: 'Nursing Notes',      icon: '🩺' },
  { id: 'discharge',  label: 'Discharge Summary',  icon: '🚪' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const CaseSheet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useParams();
  const passedPatient = location.state?.patient;

  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote]   = useState('');
  const [noteType, setNoteType] = useState('Morning Round');
  const [livePatient, setLivePatient] = useState(passedPatient || null);
  const [loading, setLoading] = useState(!passedPatient && !!patientId);

  useEffect(() => {
    if (!passedPatient && patientId) {
      setLoading(true);
      patientApi.getByMrn(patientId)
        .then(res => {
          if (res) {
            setLivePatient({
              id: res.mrn || patientId,
              name: res.name || `${res.firstName || ''} ${res.lastName || ''}`.trim() || 'Patient',
              phone: res.phone || '--',
              dob: res.dob || res.dateOfBirth || '1990-01-01',
              gender: res.gender || 'Not specified',
              ward: res.ward || 'General',
              bed: res.bed || 'G-01',
              admitDate: res.admitDate || new Date().toISOString().split('T')[0],
              doctor: res.doctor || 'Dr. Sharma',
              diagnosis: res.diagnosis || 'Clinical Investigation',
              days: res.days || 1,
              status: res.status || 'Admitted'
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch patient details for Case Sheet:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [patientId, passedPatient]);

  const p = livePatient || {
    id: patientId || 'MRN-20260401-001',
    name: 'Rahul Sharma',
    phone: '9876543210',
    dob: '1990-05-15',
    gender: 'Male',
    ward: 'General',
    bed: 'G-04',
    admitDate: '2026-04-10',
    doctor: 'Dr. Sharma',
    diagnosis: 'Viral Fever',
    days: 4,
    status: 'Stable',
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // ── Tab Renderers ───────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="cs-tab-body">
      {/* Admission Info */}
      <div className="cs-section-title"><span>🏥</span> Admission Details</div>
      <div className="cs-info-grid">
        <div className="cs-info-item"><span className="cs-info-label">IP Number</span><span className="cs-info-value">IP-2026-0142</span></div>
        <div className="cs-info-item"><span className="cs-info-label">MRN</span><span className="cs-info-value cs-mono">{p.id}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Admit Date</span><span className="cs-info-value">{new Date(p.admitDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Ward / Bed</span><span className="cs-info-value">{p.ward?.charAt(0).toUpperCase() + p.ward?.slice(1)} Ward — <strong>{p.bed}</strong></span></div>
        <div className="cs-info-item"><span className="cs-info-label">Consultant</span><span className="cs-info-value">{p.doctor}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Days Admitted</span><span className="cs-info-value"><span className="cs-days-badge">{p.days} days</span></span></div>
        <div className="cs-info-item"><span className="cs-info-label">Current Status</span><span className="cs-info-value"><span className={`cs-status-badge ${p.status?.toLowerCase()}`}>{p.status}</span></span></div>
        <div className="cs-info-item"><span className="cs-info-label">Diet</span><span className="cs-info-value">Soft Diet</span></div>
      </div>

      {/* Patient Bio */}
      <div className="cs-section-title" style={{ marginTop: '2rem' }}><span>👤</span> Patient Information</div>
      <div className="cs-info-grid">
        <div className="cs-info-item"><span className="cs-info-label">Full Name</span><span className="cs-info-value cs-bold">{p.name}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Age / Gender</span><span className="cs-info-value">{calculateAge(p.dob)} yrs / {p.gender}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Date of Birth</span><span className="cs-info-value">{p.dob}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Phone</span><span className="cs-info-value">{p.phone}</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Blood Group</span><span className="cs-info-value cs-blood">A+</span></div>
        <div className="cs-info-item"><span className="cs-info-label">Allergies</span><span className="cs-info-value cs-allergy">⚠️ Penicillin</span></div>
      </div>

      {/* Diagnosis */}
      <div className="cs-section-title" style={{ marginTop: '2rem' }}><span>🩺</span> Diagnosis & Chief Complaints</div>
      <div className="cs-dx-box">
        <div className="cs-dx-row">
          <span className="cs-dx-label">Primary Diagnosis</span>
          <span className="cs-dx-value">{p.diagnosis}</span>
        </div>
        <div className="cs-dx-row">
          <span className="cs-dx-label">ICD-10 Code</span>
          <span className="cs-dx-value cs-mono">A01.0</span>
        </div>
        <div className="cs-dx-row">
          <span className="cs-dx-label">Chief Complaints</span>
          <span className="cs-dx-value">High-grade fever for 3 days, generalised body ache, headache, loss of appetite, weakness</span>
        </div>
        <div className="cs-dx-row">
          <span className="cs-dx-label">Surgical Procedure</span>
          <span className="cs-dx-value">None</span>
        </div>
      </div>

      {/* Current Vitals Strip */}
      <div className="cs-section-title" style={{ marginTop: '2rem' }}><span>❤️</span> Current Vitals (Last Recorded)</div>
      <div className="cs-vitals-strip">
        {[
          { label: 'Blood Pressure', value: '116/74', unit: 'mmHg', icon: '🫀', ok: true },
          { label: 'Heart Rate',     value: '76',     unit: 'bpm',  icon: '💓', ok: true },
          { label: 'Temperature',    value: '98.6',   unit: '°F',   icon: '🌡️', ok: true },
          { label: 'SpO₂',           value: '99',     unit: '%',    icon: '🫁', ok: true },
          { label: 'Resp. Rate',     value: '16',     unit: '/min', icon: '💨', ok: true },
        ].map(v => (
          <div key={v.label} className={`cs-vital-card ${v.ok ? 'ok' : 'alert'}`}>
            <span className="cs-vital-icon">{v.icon}</span>
            <div className="cs-vital-value">{v.value} <small>{v.unit}</small></div>
            <div className="cs-vital-label">{v.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVitals = () => (
    <div className="cs-tab-body">
      <div className="cs-section-title"><span>📈</span> Vitals Trend (Chronological)</div>
      <div className="cs-table-wrapper">
        <table className="cs-table">
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>BP (mmHg)</th>
              <th>Pulse (bpm)</th>
              <th>Temp (°F)</th>
              <th>SpO₂ (%)</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {VITALS_HISTORY.map((v, i) => {
              const isFever = v.temp >= 100.4;
              const isHighBP = parseInt(v.bp) > 130;
              return (
                <tr key={i}>
                  <td className="cs-mono-sm" style={{ fontWeight: 600 }}>{v.date}</td>
                  <td>
                    <span className={isHighBP ? 'cs-val-warn' : 'cs-val-ok'}>{v.bp}</span>
                  </td>
                  <td>{v.pulse}</td>
                  <td>
                    <span className={isFever ? 'cs-val-warn' : 'cs-val-ok'}>{v.temp}</span>
                    {isFever && <span className="cs-flag">🌡️ Fever</span>}
                  </td>
                  <td>{v.spo2}</td>
                  <td>
                    {i === VITALS_HISTORY.length - 1 ? (
                      <span className="cs-trend improving">✅ Stable</span>
                    ) : v.temp > VITALS_HISTORY[i + 1]?.temp ? (
                      <span className="cs-trend improving">↘ Improving</span>
                    ) : (
                      <span className="cs-trend same">→ Same</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="cs-tab-body">
      {/* Add Note form */}
      <div className="cs-section-title"><span>✏️</span> Add Progress Note</div>
      <div className="cs-note-form">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label className="cs-form-label">Round Type</Form.Label>
            <Form.Select className="cs-form-select" value={noteType} onChange={e => setNoteType(e.target.value)}>
              {['Morning Round','Evening Round','Emergency Note','ICU Round','Surgical Note','Investigative Update'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={9}>
            <Form.Label className="cs-form-label">Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              className="cs-form-control"
              placeholder="Enter clinical observations, plan, and instructions..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
          </Col>
          <Col md={12} className="text-end">
            <button
              className="btn-cs-save"
              onClick={() => { if (newNote.trim()) { alert('✅ Progress note saved.'); setNewNote(''); } }}
            >
              💾 Save Note
            </button>
          </Col>
        </Row>
      </div>

      {/* Existing Notes */}
      <div className="cs-section-title" style={{ marginTop: '1.5rem' }}><span>📝</span> Previous Progress Notes</div>
      <div className="cs-notes-timeline">
        {PROGRESS_NOTES.map(note => (
          <div key={note.id} className="cs-note-entry">
            <div className="cs-note-header">
              <div className="cs-note-meta">
                <span className="cs-note-type">{note.type}</span>
                <span className="cs-note-date">📅 {note.date} &nbsp; 🕐 {note.time}</span>
                <span className="cs-note-doctor">👨‍⚕️ {note.doctor}</span>
              </div>
              <div className="cs-note-vitals-mini">
                <span>BP: {note.vitals.bp}</span>
                <span>HR: {note.vitals.pulse}</span>
                <span style={{ color: note.vitals.temp > 100 ? '#dc2626' : '#059669' }}>
                  🌡️ {note.vitals.temp}°F
                </span>
                <span>SpO₂: {note.vitals.spo2}%</span>
              </div>
            </div>
            <p className="cs-note-body">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="cs-tab-body">
      <div className="cs-section-title"><span>💊</span> Medication Chart</div>
      <div className="cs-table-wrapper">
        <table className="cs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Drug Name</th>
              <th>Route</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Start Date</th>
              <th>Instructions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MEDICATIONS.map((med, i) => {
              const sc = medStatusConfig[med.status] || medStatusConfig.Active;
              return (
                <tr key={med.id}>
                  <td style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>{i + 1}</td>
                  <td><span className="cs-drug-name">{med.drug}</span></td>
                  <td>
                    <span className={`cs-route-badge ${med.route === 'IV' ? 'iv' : 'oral'}`}>
                      {med.route}
                    </span>
                  </td>
                  <td className="cs-mono-sm">{med.freq}</td>
                  <td>{med.duration}</td>
                  <td>{med.startDate}</td>
                  <td style={{ fontSize: '0.85rem', color: '#475569', maxWidth: 200 }}>{med.instructions}</td>
                  <td>
                    <span className="cs-status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {med.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cs-med-legend">
        <span>🔵 Active &nbsp;&nbsp; ⚫ Completed &nbsp;&nbsp; 🔴 Stopped</span>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>All medications verified by Pharmacist</span>
      </div>
    </div>
  );

  const renderLabs = () => (
    <div className="cs-tab-body">
      <div className="cs-section-title"><span>🧪</span> Laboratory Results</div>
      <div className="cs-table-wrapper">
        <table className="cs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Test Name</th>
              <th>Result</th>
              <th>Flag</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {LAB_RESULTS.map(lab => {
              const sc = labStatusConfig[lab.status] || labStatusConfig.Normal;
              return (
                <tr key={lab.id}>
                  <td className="cs-mono-sm">{lab.date}</td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{lab.test}</td>
                  <td style={{ fontSize: '0.85rem', color: '#334e68', maxWidth: 260 }}>{lab.result}</td>
                  <td>
                    {lab.flag && (
                      <span className="cs-lab-flag" style={{ color: sc.color }}>
                        {lab.status === 'Positive' ? '🔴' : lab.status === 'Abnormal' ? '⚠️' : '✅'} {lab.flag}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="cs-status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {lab.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNursing = () => (
    <div className="cs-tab-body">
      <div className="cs-section-title"><span>🩺</span> Nursing Notes</div>
      <div className="cs-notes-timeline">
        {NURSING_NOTES.map(note => (
          <div key={note.id} className="cs-note-entry nursing">
            <div className="cs-note-header">
              <div className="cs-note-meta">
                <span className="cs-note-type nursing">Nursing Record</span>
                <span className="cs-note-date">📅 {note.date} &nbsp; 🕐 {note.time}</span>
                <span className="cs-note-doctor">👩‍⚕️ {note.nurse}</span>
              </div>
            </div>
            <p className="cs-note-body">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDischarge = () => (
    <div className="cs-tab-body">
      <div className="cs-discharge-notice">
        <span style={{ fontSize: '2rem' }}>🚪</span>
        <h4>Discharge Summary</h4>
        <p>Patient is currently admitted. Discharge summary will be generated upon discharge.</p>
        <div className="cs-discharge-preview">
          <div className="cs-section-title" style={{ marginTop: 0 }}><span>📋</span> Preliminary Summary</div>
          <div className="cs-info-grid">
            <div className="cs-info-item"><span className="cs-info-label">Estimated Discharge</span><span className="cs-info-value">2026-04-16 (Tentative)</span></div>
            <div className="cs-info-item"><span className="cs-info-label">Treating Doctor</span><span className="cs-info-value">{p.doctor}</span></div>
            <div className="cs-info-item"><span className="cs-info-label">Diagnosis at Admission</span><span className="cs-info-value">{p.diagnosis}</span></div>
            <div className="cs-info-item"><span className="cs-info-label">Total Days</span><span className="cs-info-value">{p.days} days (so far)</span></div>
          </div>
          <div className="cs-section-title" style={{ marginTop: '1.5rem' }}><span>💊</span> Discharge Medications (Preliminary)</div>
          <ul className="cs-discharge-med-list">
            <li>Tab. Azithromycin 500mg — Once daily × 5 days (After food)</li>
            <li>Tab. Paracetamol 500mg — SOS for fever</li>
            <li>Tab. Pantoprazole 40mg — Before breakfast × 7 days</li>
            <li>Syrup. ORS sachet — 2L per day for 5 days</li>
          </ul>
          <div className="cs-section-title" style={{ marginTop: '1.5rem' }}><span>📅</span> Follow-Up Advice</div>
          <p style={{ color: '#475569', lineHeight: 1.8 }}>
            Review after 7 days with repeat CBC. Avoid outside food. Adequate rest. 
            Return immediately if fever recurs or new symptoms appear.
          </p>
          <div className="text-end mt-3">
            <button className="btn-cs-primary" onClick={() => alert('🖨️ Discharge summary print initiated.')}>
              🖨️ Print Discharge Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabRenderers = {
    overview:    renderOverview,
    vitals:      renderVitals,
    progress:    renderProgress,
    medications: renderMedications,
    labs:        renderLabs,
    nursing:     renderNursing,
    discharge:   renderDischarge,
  };

  return (
    <div className="cs-page-container">
      {/* ── Sticky Patient Header Strip ── */}
      <div className="cs-header-strip">
        <div className="cs-header-left">
          <button className="cs-back-btn" onClick={() => navigate(-1)} title="Back to IPD">
            ← Back
          </button>
          <div className="cs-patient-info">
            <div className="cs-patient-avatar">
              {p.name?.charAt(0)}
            </div>
            <div>
              <h2 className="cs-patient-name">{p.name}</h2>
              <div className="cs-patient-meta">
                <span><strong>MRN:</strong> {p.id}</span>
                <span><strong>Age:</strong> {calculateAge(p.dob)} yrs, {p.gender}</span>
                <span><strong>Ward:</strong> {p.ward?.charAt(0).toUpperCase() + p.ward?.slice(1)}</span>
                <span><strong>Bed:</strong> {p.bed}</span>
                <span><strong>Consultant:</strong> {p.doctor}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cs-header-right">
          <div className="cs-badge-row">
            <span className="cs-ip-badge">🏥 IP-2026-0142</span>
            <span className={`cs-status-strip ${p.status?.toLowerCase()}`}>{p.status}</span>
            <span className="cs-allergy-badge">⚠️ Penicillin Allergy</span>
          </div>
          <div className="cs-quick-vitals">
            <span>🫀 116/74</span>
            <span>💓 76 bpm</span>
            <span>🌡️ 98.6°F</span>
            <span>🫁 99%</span>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="cs-tab-nav-wrapper">
        <div className="cs-tab-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`cs-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="cs-tab-icon">{tab.icon}</span>
              <span className="cs-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <Container fluid className="px-4 pb-5">
        <div className="cs-content-card">
          {(tabRenderers[activeTab] || renderOverview)()}
        </div>
      </Container>
    </div>
  );
};

export default CaseSheet;
