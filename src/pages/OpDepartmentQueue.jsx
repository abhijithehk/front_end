import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import appointmentApi from '../api/appointmentApi';
import './OpDepartmentQueue.css';

const MOCK_LAB_ALERTS = [
  { id: 'PT-10008', name: 'Sarah Connor', age: 39, gender: 'Female', test: 'Complete Blood Count', alert: 'Low Hemoglobin (9.2 g/dL)', time: '10:45 AM' },
  { id: 'PT-10024', name: 'John Doe', age: 45, gender: 'Male', test: 'Lipid Profile', alert: 'High LDL (180 mg/dL)', time: '11:10 AM' }
];

const MOCK_RADIO_ALERTS = [
  { id: 'PT-10033', name: 'Emily Davis', age: 29, gender: 'Female', scan: 'MRI Brain', alert: 'Report Ready for Review', time: '09:30 AM' }
];

const formatAppointment = (a) => {
  return {
    id: a.id,
    appointmentId: a.id,
    mrn: a.patientMrn || a.id,
    name: a.patientName || 'Unknown Patient',
    phone: a.patientPhone || '',
    tokenNumber: a.tokenNumber !== undefined ? a.tokenNumber : 1,
    department: a.department || 'General Medicine',
    doctor: a.doctor || 'Doctor',
    visitType: a.visitType || 'OP Visit',
    timeSlot: a.timeSlot || '',
    reason: a.reason || a.notes || '',
    status: (a.status || 'WAITING').toLowerCase(),
    vitals: 'Done', // Vitals indicator
    age: a.patientAge || 35,
    gender: a.patientGender || 'Patient'
  };
};

const OpDepartmentQueue = ({ defaultDepartment = 'General Medicine' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Deriving department name gracefully from App Router paths if available
  const pathSegment = location.pathname.split('/').pop();
  let deptName = defaultDepartment;
  if (pathSegment === 'general') deptName = 'General Medicine';
  if (pathSegment === 'ortho') deptName = 'Orthopedics';
  if (pathSegment === 'pediatric') deptName = 'Pediatrics';
  if (pathSegment === 'dental') deptName = 'Dental';
  if (pathSegment === 'ent') deptName = 'ENT';
  if (pathSegment === 'gastro') deptName = 'Gastroenterology';

  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCallId, setActiveCallId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('waiting');

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let data = [];
      try {
        data = await appointmentApi.getQueue(deptName);
      } catch (e) {
        // Fallback to today's appointments if department queue endpoint returns empty or fails
        const todayData = await appointmentApi.getToday();
        if (Array.isArray(todayData)) {
          data = todayData.filter(item => 
            !deptName || item.department?.toLowerCase().includes(deptName.toLowerCase()) || deptName.toLowerCase().includes(item.department?.toLowerCase() || '')
          );
        }
      }

      if (Array.isArray(data)) {
        setQueue(data.map(formatAppointment));
      } else {
        setQueue([]);
      }
    } catch (err) {
      console.error("Failed to load department queue:", err);
      setErrorMsg('Unable to load queue from Appointment Service.');
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [deptName]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Utility logic for search string constraints
  const matchSearch = (p, qStr) => {
    if (!qStr) return true;
    const q = qStr.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(q)) || 
           (p.mrn && p.mrn.toLowerCase().includes(q)) ||
           (p.tokenNumber && p.tokenNumber.toString() === q);
  };

  // Guarantee Strict Ascending Token Sort for Waiting Queue
  const waitingQueue = useMemo(() => {
    return queue.filter(p => (p.status === 'waiting' || p.status === 'pending' || p.status === 'booked' || p.status === 'calling') && matchSearch(p, searchQuery))
                .sort((a, b) => a.tokenNumber - b.tokenNumber);
  }, [queue, searchQuery]);

  // Sort Consulted queue maintaining identical formatting
  const consultedQueue = useMemo(() => {
    return queue.filter(p => p.status === 'consulted' && matchSearch(p, searchQuery))
                .sort((a, b) => a.tokenNumber - b.tokenNumber);
  }, [queue, searchQuery]);

  const handleCall = async (patient) => {
    setActiveCallId(patient.id);
    try {
      await appointmentApi.updateStatus(patient.appointmentId || patient.id, 'CALLING');
    } catch (err) {
      console.warn("Could not update status to CALLING:", err);
    }
  };

  const handleConsult = async (patient) => {
    try {
      await appointmentApi.updateStatus(patient.appointmentId || patient.id, 'CONSULTED');
    } catch (err) {
      console.warn("Could not update status to CONSULTED:", err);
    }
    // Navigate doctor directly to the detailed Electronic Medical Record Interface!
    navigate(`/consultation/${patient.mrn || patient.id}`);
  };

  const handleRecall = async (patientId) => {
    try {
      await appointmentApi.updateStatus(patientId, 'WAITING');
    } catch (err) {
      console.warn("Could not recall patient status:", err);
    }
    setQueue(prev => prev.map(p => p.id === patientId ? { ...p, status: 'waiting' } : p));
  };

  return (
    <div className="opq-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <div className="opq-card shadow-lg">
              
              <div className="opq-header">
                <div>
                  <h2 className="opq-title">🩺 {deptName} Queue</h2>
                  <p className="opq-subtitle">Active patients waiting for consultation</p>
                </div>
                <div className="opq-stats">
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>
                    <div><strong>Total Waiting:</strong> {waitingQueue.length}</div>
                    <div><strong>Next Token:</strong> {waitingQueue.length > 0 ? waitingQueue[0].tokenNumber : '--'}</div>
                    <Button variant="outline-light" size="sm" onClick={fetchQueue} disabled={isLoading} title="Refresh Queue">
                      {isLoading ? <Spinner animation="border" size="sm" /> : '🔄 Refresh'}
                    </Button>
                  </div>
                  <div className="opq-search-box">
                    <span className="opq-search-icon">🔍</span>
                    <input 
                      type="search" 
                      className="opq-search-input" 
                      placeholder="Search Name or Token..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive p-3 pt-0">
                <div className="opq-tabs mt-3">
                  <button 
                    className={`opq-tab ${activeTab === 'waiting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('waiting')}
                  >
                    ⏳ Waiting Queue ({waitingQueue.length})
                  </button>
                  <button 
                    className={`opq-tab ${activeTab === 'consulted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('consulted')}
                  >
                    ✅ Consulted ({consultedQueue.length})
                  </button>
                  <button 
                    className={`opq-tab ${activeTab === 'lab_alert' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lab_alert')}
                  >
                    🧪 Lab Alerts ({MOCK_LAB_ALERTS.length})
                  </button>
                  <button 
                    className={`opq-tab ${activeTab === 'radiology_alert' ? 'active' : ''}`}
                    onClick={() => setActiveTab('radiology_alert')}
                  >
                    ☢️ Radiology ({MOCK_RADIO_ALERTS.length})
                  </button>
                </div>

                {isLoading && queue.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Spinner animation="border" variant="primary" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 500 }}>Fetching live department queue...</p>
                  </div>
                )}

                {activeTab === 'waiting' && !isLoading && (
                <table className="opq-table">
                  <thead>
                    <tr>
                      <th className="col-token">Token</th>
                      <th className="col-mrn">MRN</th>
                      <th className="col-patient">Patient Details</th>
                      <th className="col-vitals">Reason / Complaint</th>
                      <th className="col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingQueue.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-5">
                          Nobody is actively waiting in this queue. Book an appointment to add patients.
                        </td>
                      </tr>
                    )}
                    {waitingQueue.map((patient) => {
                      const isCalling = activeCallId === patient.id || patient.status === 'calling';
                      return (
                        <tr key={patient.id} style={{ background: isCalling ? '#f0fdf4' : '' }}>
                          <td className="col-token">
                            <span className="token-badge">{patient.tokenNumber}</span>
                          </td>
                          <td className="col-mrn">{patient.mrn}</td>
                          <td className="col-patient">
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{patient.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                              {patient.phone ? `📞 ${patient.phone}` : ''} {patient.doctor ? `• ${patient.doctor}` : ''}
                            </div>
                          </td>
                          <td className="col-vitals">
                            <span style={{ fontSize: '0.9rem', color: '#334e68' }}>
                              {patient.reason || 'General Checkup'}
                            </span>
                          </td>
                          <td className="col-action">
                            {isCalling ? (
                              <button className="btn-opq-consult" onClick={() => handleConsult(patient)} title="Finalize consultation window">
                                👨‍⚕️ Consult
                              </button>
                            ) : (
                              <button 
                                className="btn-opq-call" 
                                onClick={() => handleCall(patient)}
                              >
                                📢 Call Patient
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}

                {/* CONSULTED PATIENTS BLOCK */}
                {activeTab === 'consulted' && (
                <table className="opq-table">
                  <thead>
                    <tr>
                      <th className="col-token">Token</th>
                      <th className="col-mrn">MRN</th>
                      <th className="col-patient">Patient Details</th>
                      <th className="col-vitals">Consultation</th>
                      <th className="col-action">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultedQueue.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No consultations completed yet today.
                        </td>
                      </tr>
                    )}
                    {consultedQueue.map((patient) => (
                      <tr key={patient.id}>
                        <td className="col-token">
                          <span className="token-badge" style={{ background: '#94a3b8' }}>{patient.tokenNumber}</span>
                        </td>
                        <td className="col-mrn">{patient.id}</td>
                        <td className="col-patient">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{patient.age} yrs • {patient.gender}</div>
                        </td>
                        <td className="col-vitals">
                          <span className="vitals-status vitals-done" style={{ background: '#f1f5f9', color: '#475569' }}>
                            ✓ Discharged
                          </span>
                        </td>
                        <td className="col-action">
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleRecall(patient.id)}
                              style={{ fontSize: '0.85rem', padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                              title="Move back to Waiting Queue"
                            >
                              ↩ Recall
                            </button>
                            <button className="btn-opq-consult" style={{ fontSize: '0.85rem', padding: '6px 14px', background: '#475569', margin: 0 }}>
                              View Case
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}

                {/* LAB ALERTS BLOCK */}
                {activeTab === 'lab_alert' && (
                <table className="opq-table">
                  <thead>
                    <tr>
                      <th className="col-token">Time</th>
                      <th className="col-mrn">MRN</th>
                      <th className="col-patient">Patient Details</th>
                      <th className="col-vitals">Test / Alert</th>
                      <th className="col-action">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_LAB_ALERTS.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No pending lab alerts.
                        </td>
                      </tr>
                    )}
                    {MOCK_LAB_ALERTS.map((alert, idx) => (
                      <tr key={idx}>
                        <td className="col-token">
                          <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>{alert.time}</span>
                        </td>
                        <td className="col-mrn">{alert.id}</td>
                        <td className="col-patient">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{alert.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{alert.age} yrs • {alert.gender}</div>
                        </td>
                        <td className="col-vitals">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{alert.test}</div>
                          <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>⚠️ {alert.alert}</div>
                        </td>
                        <td className="col-action">
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-opq-call" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                              📢 Recall
                            </button>
                            <button className="btn-opq-consult" style={{ fontSize: '0.85rem', padding: '6px 14px', background: '#3b82f6', margin: 0 }}>
                              View Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}

                {/* RADIOLOGY ALERTS BLOCK */}
                {activeTab === 'radiology_alert' && (
                <table className="opq-table">
                  <thead>
                    <tr>
                      <th className="col-token">Time</th>
                      <th className="col-mrn">MRN</th>
                      <th className="col-patient">Patient Details</th>
                      <th className="col-vitals">Scan / Alert</th>
                      <th className="col-action">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RADIO_ALERTS.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No pending radiology alerts.
                        </td>
                      </tr>
                    )}
                    {MOCK_RADIO_ALERTS.map((alert, idx) => (
                      <tr key={idx}>
                        <td className="col-token">
                          <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>{alert.time}</span>
                        </td>
                        <td className="col-mrn">{alert.id}</td>
                        <td className="col-patient">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{alert.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{alert.age} yrs • {alert.gender}</div>
                        </td>
                        <td className="col-vitals">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{alert.scan}</div>
                          <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600 }}>🔔 {alert.alert}</div>
                        </td>
                        <td className="col-action">
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                            <button className="btn-opq-call" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                              📢 Recall
                            </button>
                            <button className="btn-opq-consult" style={{ fontSize: '0.85rem', padding: '6px 14px', background: '#8b5cf6', margin: 0 }}>
                              View Scans
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>

            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OpDepartmentQueue;
