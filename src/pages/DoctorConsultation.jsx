import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import patientApi from '../api/patientApi';
import './DoctorConsultation.css';

// --- MOCK HISTORICAL DATA FOR ADVANCED TABS --- //
const MOCK_LAB_REPORTS = [
  { id: 'LR-101', date: '15 Mar 2026', test: 'Complete Blood Count', doctor: 'Dr. Ramesh', status: 'Normal' },
  { id: 'LR-102', date: '10 Feb 2026', test: 'Lipid Profile', doctor: 'Dr. Sharma', status: 'High LDL' },
  { id: 'LR-103', date: '05 Nov 2025', test: 'Liver Function Test', doctor: 'Dr. Ramesh', status: 'Normal' }
];

const MOCK_RADIO_REPORTS = [
  { id: 'RR-201', date: '22 Jan 2026', scan: 'Chest X-Ray PA', doctor: 'Dr. Ramesh', finding: 'Clear lungs, normal cardiac silhouette' },
  { id: 'RR-202', date: '14 Aug 2025', scan: 'Ultrasound Abdomen', doctor: 'Dr. Smitha', finding: 'Mild fatty liver (Grade 1)' }
];

const MOCK_MED_HISTORY = [
  { id: 'RX-501', date: '10 Feb 2026', drug: 'Atorvastatin 20mg', freq: '0-0-1', days: '30 Days', doctor: 'Dr. Sharma' },
  { id: 'RX-502', date: '05 Nov 2025', drug: 'Amoxicillin 500mg', freq: '1-0-1', days: '5 Days', doctor: 'Dr. Patel' }
];

const MOCK_IP_HISTORY = [
  { id: 'IP-802', admitDate: '10 Apr 2025', dischargeDate: '15 Apr 2025', reason: 'Acute Bronchitis', ward: 'General Ward 3' }
];

const MOCK_VITALS_HISTORY = [
  { date: '10 Aug',  SysBP: 125, DiaBP: 82, HR: 75 },
  { date: '05 Nov',  SysBP: 130, DiaBP: 85, HR: 78 },
  { date: '10 Feb',  SysBP: 135, DiaBP: 88, HR: 80 },
  { date: '15 Mar',  SysBP: 128, DiaBP: 84, HR: 76 },
  { date: 'Today',   SysBP: 118, DiaBP: 75, HR: 72 }
];

const calculateAge = (dob) => {
  if (!dob) return 30;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return isNaN(age) ? 30 : age;
};

const DoctorConsultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Primary 8-Tab Navigation State
  const [activeTab, setActiveTab] = useState('consultation');
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  // Live Patient Record Fetch
  const [patient, setPatient] = useState({
    id: patientId || 'PT-10033',
    name: 'Emily Davis',
    age: 29,
    gender: 'Female',
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    vitals: {
      bp: '118/75',
      pulse: '72',
      temp: '98.6',
      spO2: '99',
      weight: '62'
    }
  });

  useEffect(() => {
    if (patientId) {
      setIsLoadingPatient(true);
      patientApi.getByMrn(patientId)
        .then(p => {
          if (p) {
            setPatient({
              id: p.mrn || p.id || patientId,
              name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient',
              age: calculateAge(p.dob),
              gender: p.gender || 'Not specified',
              bloodType: p.bloodGroup || 'O+',
              allergies: 'None recorded',
              phone: p.phone,
              vitals: {
                bp: '120/80',
                pulse: '76',
                temp: '98.6',
                spO2: '99',
                weight: '68'
              }
            });
          }
        })
        .catch(err => {
          console.warn("Could not fetch patient details for consultation:", err);
        })
        .finally(() => {
          setIsLoadingPatient(false);
        });
    }
  }, [patientId]);

  // --- CONSULTATION TAB STATE --- //
  const [clinicalNotes, setClinicalNotes] = useState({
    complaints: '',
    history: '',
    examination: '',
    diagnosis: ''
  });
  
  const [rxList, setRxList] = useState([]);
  const [newRx, setNewRx] = useState({ drug: '', dosage: '', freq: '', days: '', instructions: '' });

  // Custom Lab/Radio Order States
  const [labOrders, setLabOrders] = useState([]);
  const [newLab, setNewLab] = useState({ test: '', priority: 'Routine', notes: '' });
  
  const [radioOrders, setRadioOrders] = useState([]);
  const [newRadio, setNewRadio] = useState({ scan: '', priority: 'Routine', notes: '' });

  // Quick Order Shortcut States
  const [selectedLabs, setSelectedLabs] = useState({
    'CBC': false,
    'Lipid Profile': false,
    'LFT (Liver)': false,
    'KFT (Kidney)': false,
    'HbA1c': false
  });

  const [selectedRadio, setSelectedRadio] = useState({
    'X-Ray Chest PA': false,
    'Ultrasound Abdomen': false,
    'MRI Brain': false,
    'CT Scan Head': false
  });

  // --- HANDLERS --- //
  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setClinicalNotes(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRx = () => {
    if (!newRx.drug || !newRx.freq || !newRx.days) {
      alert("Please fill Drug Name, Frequency, and Days fields.");
      return;
    }
    setRxList([...rxList, { ...newRx, id: Date.now() }]);
    setNewRx({ drug: '', dosage: '', freq: '', days: '', instructions: '' });
  };

  const removeRx = (id) => {
    setRxList(rxList.filter(rx => rx.id !== id));
  };

  const handleAddLab = () => {
    if (!newLab.test) return;
    setLabOrders([...labOrders, { ...newLab, id: Date.now() }]);
    setNewLab({ test: '', priority: 'Routine', notes: '' });
  };
  const removeLab = (id) => setLabOrders(labOrders.filter(l => l.id !== id));

  const handleAddRadio = () => {
    if (!newRadio.scan) return;
    setRadioOrders([...radioOrders, { ...newRadio, id: Date.now() }]);
    setNewRadio({ scan: '', priority: 'Routine', notes: '' });
  };
  const removeRadio = (id) => setRadioOrders(radioOrders.filter(r => r.id !== id));

  const toggleLab = (lab) => setSelectedLabs(prev => ({ ...prev, [lab]: !prev[lab] }));
  const toggleRadio = (scan) => setSelectedRadio(prev => ({ ...prev, [scan]: !prev[scan] }));

  const handleComplete = () => {
    alert('✅ Consultation Saved Successfully! Notes and Orders forwarded to applicable departments.');
    navigate('/opd/general');
  };

  // --- TAB RENDER LOGIC --- //
  const renderTabContent = () => {
    switch(activeTab) {
      case 'quick-view':
        return (
          <>
            <Row>
              <Col md={12}>
                <Card className="consult-card mb-4 shadow-sm">
                  <div className="consult-card-header">⭐ Current Vitals & Alerts Dashboard</div>
                  <div className="consult-card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">
                      <h5 style={{ color: '#0f172a', fontWeight: 'bold' }}>Current Reading</h5>
                      <div className="d-flex gap-3 flex-wrap mt-3">
                        <div><strong style={{ color: '#64748b' }}>BP:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{patient.vitals.bp} mmHg</span></div>
                        <div><strong style={{ color: '#64748b' }}>Pulse:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{patient.vitals.pulse} bpm</span></div>
                        <div><strong style={{ color: '#64748b' }}>Temp:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>{patient.vitals.temp} °F</span></div>
                      </div>
                    </div>
                    <div className="alert-separator">
                      <h5 style={{ color: '#dc2626', fontWeight: 'bold' }}>Active Alerts</h5>
                      <ul style={{ color: '#dc2626', fontWeight: 600, margin: 0, paddingLeft: '1.2rem' }}>
                        <li>Allergies: {patient.allergies}</li>
                        <li>Awaiting MRI Brain Results</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Card className="consult-card shadow-sm mb-4">
                  <div className="consult-card-header">📈 Historical Vitals Trend (Last 5 Visits)</div>
                  <div className="consult-card-body" style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_VITALS_HISTORY} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="SysBP" stroke="#dc2626" activeDot={{ r: 8 }} strokeWidth={3} name="Systolic BP" />
                        <Line type="monotone" dataKey="DiaBP" stroke="#3b82f6" strokeWidth={3} name="Diastolic BP" />
                        <Line type="monotone" dataKey="HR" stroke="#10b981" strokeWidth={3} name="Heart Rate" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        );

      case 'consultation':
        return (
          <>
            <Row>
              <Col lg={12}>
                <Card className="consult-card shadow-sm mb-4">
                  <div className="consult-card-header">
                    <span>📝 Clinical Notes (SOAP)</span>
                  </div>
                  <div className="consult-card-body">
                    <Form>
                      <Row>
                        <Col lg={6} md={12} sm={12} className="mb-3">
                          <Form.Label className="consult-form-label">Chief Complaints</Form.Label>
                          <Form.Control as="textarea" rows={3} className="consult-form-control" name="complaints" value={clinicalNotes.complaints} onChange={handleNoteChange} placeholder="e.g. Fever and dry cough..." />
                        </Col>
                        <Col lg={6} md={12} sm={12} className="mb-3">
                          <Form.Label className="consult-form-label">History of Present Illness (HPI)</Form.Label>
                          <Form.Control as="textarea" rows={3} className="consult-form-control" name="history" value={clinicalNotes.history} onChange={handleNoteChange} placeholder="Details of symptoms..." />
                        </Col>
                        <Col lg={6} md={12} sm={12} className="mb-3">
                          <Form.Label className="consult-form-label">Objective Examination Findings</Form.Label>
                          <Form.Control as="textarea" rows={3} className="consult-form-control" name="examination" value={clinicalNotes.examination} onChange={handleNoteChange} placeholder="Chest clear bilaterally..." />
                        </Col>
                        <Col lg={6} md={12} sm={12} className="mb-3">
                          <Form.Label className="consult-form-label">Primary Diagnosis (ICD-10)</Form.Label>
                          <Form.Control type="text" className="consult-form-control" name="diagnosis" value={clinicalNotes.diagnosis} onChange={handleNoteChange} placeholder="e.g. Acute Viral Pharyngitis" />
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* MAX LENGTH PRESCRIPTION PAD */}
            <Row>
              <Col lg={12}>
                <Card className="consult-card shadow-sm mb-4">
                  <div className="consult-card-header">
                    <span>💊 Digital Prescription Pad (Rx)</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>
                      Total Meds: {rxList.length}
                    </span>
                  </div>
                  <div className="p-0 table-responsive mx-0">
                    <table className="rx-digital-grid">
                      <thead>
                        <tr>
                          <th style={{ width: '25%' }}>Drug Name</th>
                          <th style={{ width: '15%' }}>Dosage</th>
                          <th style={{ width: '15%' }}>Freq</th>
                          <th style={{ width: '12%' }}>Days</th>
                          <th style={{ width: '23%' }}>Instructions</th>
                          <th style={{ width: '10%', textAlign: 'center' }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rxList.map((rx) => (
                          <tr key={rx.id}>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{rx.drug}</td>
                            <td>{rx.dosage}</td>
                            <td>{rx.freq}</td>
                            <td>{rx.days} Days</td>
                            <td style={{ color: '#64748b' }}>{rx.instructions}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="btn-rx-remove" onClick={() => removeRx(rx.id)}>✕</button>
                            </td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc' }}>
                          <td><input type="text" className="rx-med-input" placeholder="Paracetamol" value={newRx.drug} onChange={e => setNewRx({...newRx, drug: e.target.value})} /></td>
                          <td><input type="text" className="rx-med-input" placeholder="650mg" value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} /></td>
                          <td>
                            <select className="rx-med-input" value={newRx.freq} onChange={e => setNewRx({...newRx, freq: e.target.value})}>
                              <option value="">Freq...</option>
                              <option value="1-0-1">1-0-1 (BD)</option>
                              <option value="1-1-1">1-1-1 (TDS)</option>
                              <option value="1-0-0">1-0-0 (OD-M)</option>
                              <option value="0-0-1">0-0-1 (OD-N)</option>
                              <option value="SOS">SOS</option>
                            </select>
                          </td>
                          <td><input type="number" className="rx-med-input" placeholder="5" value={newRx.days} onChange={e => setNewRx({...newRx, days: e.target.value})} /></td>
                          <td><input type="text" className="rx-med-input" placeholder="After food" value={newRx.instructions} onChange={e => setNewRx({...newRx, instructions: e.target.value})} /></td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="btn-rx-add-med" onClick={handleAddRx}>+ Add</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>
            </Row>

           
          

            {/* CUSTOM ORDERS (LAB / RADIO) */}
            <Row>
              <Col lg={6} md={12} sm={12}>
                <Card className="consult-card shadow-sm mb-4">
                  <div className="consult-card-header">
                    <span>🧪 Lab Orders</span>
                  </div>
                  <div className="consult-card-body">
                    <div className="quick-shortcut-box">
                      {Object.keys(selectedLabs).map(lab => (
                        <div key={lab} className={`quick-shortcut-pill ${selectedLabs[lab] ? 'active' : ''}`} onClick={() => toggleLab(lab)}>
                          {lab} {selectedLabs[lab] && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                
                  <div className="p-0 table-responsive mx-0">
                    <table className="rx-digital-grid">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Test Name</th>
                          <th style={{ width: '25%' }}>Priority</th>
                          <th style={{ width: '25%' }}>Notes</th>
                          <th style={{ width: '10%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {labOrders.map(lab => (
                          <tr key={lab.id}>
                            <td style={{ fontWeight: 600 }}>{lab.test}</td>
                            <td><span style={{ color: lab.priority === 'Urgent' ? '#dc2626' : '#475569', fontWeight: 600 }}>{lab.priority}</span></td>
                            <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{lab.notes}</td>
                            <td style={{ textAlign: 'center' }}><button className="btn-rx-remove" onClick={() => removeLab(lab.id)}>✕</button></td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc' }}>
                          <td><input type="text" className="rx-med-input" placeholder="e.g. TSH" value={newLab.test} onChange={e => setNewLab({...newLab, test: e.target.value})} /></td>
                          <td>
                            <select className="rx-med-input" value={newLab.priority} onChange={e => setNewLab({...newLab, priority: e.target.value})}>
                              <option value="Routine">Routine</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </td>
                          <td><input type="text" className="rx-med-input" placeholder="Reason..." value={newLab.notes} onChange={e => setNewLab({...newLab, notes: e.target.value})} /></td>
                          <td style={{ textAlign: 'center' }}><button className="btn-rx-add-med" onClick={handleAddLab}>Add</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>
              
              <Col lg={6} md={12} sm={12}>
                <Card className="consult-card shadow-sm mb-4">
                  <div className="consult-card-header">
                    <span>☢️ Detailed Radiology Orders</span>
                  </div>
                  <div className="consult-card-body">
                    <div className="quick-shortcut-box">
                      {Object.keys(selectedRadio).map(scan => (
                        <div key={scan} className={`quick-shortcut-pill ${selectedRadio[scan] ? 'active' : ''}`} onClick={() => toggleRadio(scan)}>
                          {scan} {selectedRadio[scan] && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-0 table-responsive mx-0">
                    <table className="rx-digital-grid">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Scan Requested</th>
                          <th style={{ width: '25%' }}>Priority</th>
                          <th style={{ width: '25%' }}>Clinical Info</th>
                          <th style={{ width: '10%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {radioOrders.map(rad => (
                          <tr key={rad.id}>
                            <td style={{ fontWeight: 600 }}>{rad.scan}</td>
                            <td><span style={{ color: rad.priority === 'Urgent' ? '#dc2626' : '#475569', fontWeight: 600 }}>{rad.priority}</span></td>
                            <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{rad.notes}</td>
                            <td style={{ textAlign: 'center' }}><button className="btn-rx-remove" onClick={() => removeRadio(rad.id)}>✕</button></td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc' }}>
                          <td><input type="text" className="rx-med-input" placeholder="e.g. USG KUB" value={newRadio.scan} onChange={e => setNewRadio({...newRadio, scan: e.target.value})} /></td>
                          <td>
                            <select className="rx-med-input" value={newRadio.priority} onChange={e => setNewRadio({...newRadio, priority: e.target.value})}>
                              <option value="Routine">Routine</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </td>
                          <td><input type="text" className="rx-med-input" placeholder="Instructions..." value={newRadio.notes} onChange={e => setNewRadio({...newRadio, notes: e.target.value})} /></td>
                          <td style={{ textAlign: 'center' }}><button className="btn-rx-add-med" onClick={handleAddRadio}>Add</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={12}>
                <button className="btn-complete-consult mb-5" onClick={handleComplete}>
                  💾 Save & Complete Consultation
                </button>
              </Col>
            </Row>
          </>
        );

      case 'med-history':
        return (
          <Card className="consult-card mb-4 shadow-sm">
            <div className="consult-card-header">Past Medication Records</div>
            <div className="table-responsive m-0 p-0">
              <table className="rx-digital-grid">
                <thead><tr><th>Date Issued</th><th>Drug Name</th><th>Frequency</th><th>Duration</th><th>Prescribing Doctor</th></tr></thead>
                <tbody>
                  {MOCK_MED_HISTORY.map(rx => (
                    <tr key={rx.id}>
                      <td>{rx.date}</td>
                      <td style={{ fontWeight: 600 }}>{rx.drug}</td>
                      <td>{rx.freq}</td>
                      <td>{rx.days}</td>
                      <td>{rx.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'lab-reports':
        return (
          <Card className="consult-card mb-4 shadow-sm">
            <div className="consult-card-header">Historical Lab Reports</div>
            <div className="table-responsive m-0 p-0">
              <table className="rx-digital-grid">
                <thead><tr><th>Date</th><th>Test Name</th><th>Results</th><th>Status</th><th>Ordering Doctor</th></tr></thead>
                <tbody>
                  {MOCK_LAB_REPORTS.map(lab => (
                    <tr key={lab.id}>
                      <td>{lab.date}</td>
                      <td style={{ fontWeight: 600 }}>{lab.test}</td>
                      <td><a href="#view" style={{ color: '#0ea5e9', textDecoration: 'none' }}>📄 {lab.result}</a></td>
                      <td><span style={{ color: lab.status.includes('Normal') ? '#10b981' : '#dc2626', fontWeight: 600 }}>{lab.status}</span></td>
                      <td>{lab.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'radio-reports':
         return (
          <Card className="consult-card mb-4 shadow-sm">
            <div className="consult-card-header">Historical Radiology Scans</div>
            <div className="table-responsive m-0 p-0">
              <table className="rx-digital-grid">
                <thead><tr><th>Date</th><th>Scan Name</th><th>Key Findings</th><th>Ordering Doctor</th></tr></thead>
                <tbody>
                  {MOCK_RADIO_REPORTS.map(rad => (
                    <tr key={rad.id}>
                      <td>{rad.date}</td>
                      <td style={{ fontWeight: 600 }}>{rad.scan}</td>
                      <td style={{ color: '#475569' }}>{rad.finding}</td>
                      <td>{rad.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case 'ip-history':
         return (
          <Card className="consult-card mb-4 shadow-sm">
            <div className="consult-card-header">IP Admission Records</div>
            <div className="table-responsive m-0 p-0">
              <table className="rx-digital-grid">
                <thead><tr><th>Admit Date</th><th>Discharge Date</th><th>Primary Reason</th><th>Ward</th></tr></thead>
                <tbody>
                  {MOCK_IP_HISTORY.map(ip => (
                    <tr key={ip.id}>
                      <td>{ip.admitDate}</td>
                      <td>{ip.dischargeDate}</td>
                      <td style={{ fontWeight: 600 }}>{ip.reason}</td>
                      <td>{ip.ward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      
      case 'family-history':
        return (
          <div className="history-text-box shadow-sm mb-4">
            <h5>🧬 Family History</h5>
            <p><strong>Father:</strong> Diagnosed with Type 2 Diabetes at age 55. History of Hypertension.</p>
            <p><strong>Mother:</strong> Asthmatic. No major cardiac history.</p>
            <p><strong>Siblings:</strong> Brother generally healthy.</p>
            <button className="btn-rx-add-med mt-3">✎ Edit Family History</button>
          </div>
        );

      case 'disease-history':
        return (
          <div className="history-text-box shadow-sm mb-4">
            <h5>🩺 Past Medical & Surgical History (Disease History)</h5>
            <p><strong>2018:</strong> Diagnosed with mild Hypertension. Controlled with diet and occasional medication.</p>
            <p><strong>2020:</strong> Appendectomy (Laparoscopic) with complete recovery.</p>
            <button className="btn-rx-add-med mt-3">✎ Edit PMH Data</button>
          </div>
        );

      default:
        return <div>Tab under construction.</div>;
    }
  };

  return (
    <div className="consult-page-container">
      {/* GLOBAL VITALS HEADER STRIP (PINNED) */}
      <div className="consult-header-strip flex-md-row flex-column align-items-start align-items-md-center">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/opd/general')} 
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            title="Back to OPD Queue"
          >
            ←
          </button>
          <div className="consult-patient-meta">
            <h2 className="consult-patient-name">{patient.name}</h2>
            <div className="consult-patient-details">
              <span><strong>MRN:</strong> {patient.id}</span>
              <span><strong>Age/Gender:</strong> {patient.age} yrs, {patient.gender}</span>
              <span><strong>Blood:</strong> <span style={{ color: '#dc2626', fontWeight: 700 }}>{patient.bloodType}</span></span>
              <span><strong>Allergies:</strong> <span style={{ color: '#d97706', fontWeight: 700 }}>⚠️ {patient.allergies}</span></span>
            </div>
          </div>
        </div>

        <div className="consult-vitals-strip">
          <div className="vital-box">
            <span className="v-label">BP (mmHg)</span>
            <span className="v-value">{patient.vitals.bp}</span>
          </div>
          <div className="vital-box">
            <span className="v-label">Heart Rate</span>
            <span className="v-value">{patient.vitals.pulse} bpm</span>
          </div>
          <div className="vital-box alert">
            <span className="v-label">Temperature</span>
            <span className="v-value">{patient.vitals.temp} °F</span>
          </div>
          <div className="vital-box">
            <span className="v-label">SpO2</span>
            <span className="v-value">{patient.vitals.spO2}%</span>
          </div>
          <div className="vital-box">
            <span className="v-label">Weight</span>
            <span className="v-value">{patient.vitals.weight} kg</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION BAR */}
      <div className="consult-nav-wrapper">
        <div className="consult-nav-tabs">
          {[
            { id: 'quick-view', label: 'Quick View' },
            { id: 'consultation', label: 'Consultation' },
            { id: 'med-history', label: 'Medication History' },
            { id: 'lab-reports', label: 'Lab Reports' },
            { id: 'radio-reports', label: 'Radiology Reports' },
            { id: 'ip-history', label: 'IP Admission' },
            { id: 'family-history', label: 'Family History' },
            { id: 'disease-history', label: 'Disease History' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`consult-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC TAB BODY CONTAINER */}
      <Container fluid className="px-4">
        {renderTabContent()}
      </Container>
    </div>
  );
};

export default DoctorConsultation;
