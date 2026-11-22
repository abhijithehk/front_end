import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Tab, Tabs, Alert } from 'react-bootstrap';
import './OpBilling.css'; // Reuse premium layout
import './PreCheckDetail.css'; // Specific styling

const PreCheckDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;

  // Form State
  const [vitals, setVitals] = useState({
    height: '',
    weight: '',
    temp: '',
    sysBp: '',
    diaBp: '',
    pulse: '',
    resp: '',
    spo2: '',
    notes: ''
  });

  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState('normal'); // underweight, normal, overweight, obese
  const [isSaved, setIsSaved] = useState(false);

  // Auto-calculate BMI
  useEffect(() => {
    if (vitals.height && vitals.weight) {
      const hMeters = parseFloat(vitals.height) / 100;
      const wKg = parseFloat(vitals.weight);
      if (hMeters > 0 && wKg > 0) {
        const calcBmi = (wKg / (hMeters * hMeters)).toFixed(1);
        setBmi(calcBmi);
        if (calcBmi < 18.5) setBmiStatus('underweight');
        else if (calcBmi >= 18.5 && calcBmi <= 24.9) setBmiStatus('normal');
        else if (calcBmi >= 25 && calcBmi <= 29.9) setBmiStatus('overweight');
        else setBmiStatus('obese');
      } else {
        setBmi(0);
      }
    } else {
      setBmi(0);
    }
  }, [vitals.height, vitals.weight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!vitals.sysBp || !vitals.pulse) {
      alert("Blood Pressure and Pulse are mandatory baseline vitals.");
      return;
    }
    // Simulation
    setIsSaved(true);
    setTimeout(() => {
      navigate('/pre-check');
    }, 2500);
  };

  // Prevent loading without a patient context
  if (!patient) {
    return (
      <div className="opbill-page-container">
        <Container>
          <div className="opbill-card shadow-lg text-center" style={{ padding: '4rem' }}>
             <h3>No Patient Selected</h3>
             <p className="text-muted">Please search and select a patient to take their vitals.</p>
             <button className="btn-opbill-submit mt-3" onClick={() => navigate('/pre-check')}>
               ← Back to Search
             </button>
          </div>
        </Container>
      </div>
    );
  }

  // Dummy Past Vitals
  const dummyHistory = [
    { id: 1, date: '2026-03-15T09:30:00Z', temp: '98.6', bp: '120/80', pulse: 72, resp: 16, spo2: 98, weight: '70.5' },
    { id: 2, date: '2025-11-20T14:15:00Z', temp: '99.1', bp: '125/82', pulse: 84, resp: 18, spo2: 96, weight: '71.2' },
    { id: 3, date: '2025-05-10T10:00:00Z', temp: '98.4', bp: '118/76', pulse: 68, resp: 15, spo2: 99, weight: '72.0' },
  ];

  return (
    <div className="opbill-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="opbill-card shadow-lg">
              
              {/* Header */}
              <div className="opbill-detail-header">
                <div className="opbill-detail-header-top">
                  <button className="opbill-back-btn" onClick={() => navigate('/pre-check')}>
                    ← Back to Search
                  </button>
                </div>
                <div className="opbill-detail-header-center">
                  <h2 className="opbill-title">🩺 Pre-Check Vitals</h2>
                  <p className="opbill-subtitle mb-0">Record and review patient health indices</p>
                </div>
              </div>

              <div className="opbill-body text-start">
                {/* Patient Strip */}
                <div className="opbill-patient-strip mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="opbill-patient-meta m-0 p-0">
                    <h4>{patient.name}</h4>
                    <div className="opbill-patient-meta-details mt-1">
                      <span>📞 {patient.phone}</span>
                      <span>{patient.gender}</span>
                      <span style={{ fontWeight: 600, color: '#0d9488' }}>{patient.id}</span>
                    </div>
                  </div>
                </div>

                {isSaved && (
                  <Alert variant="success" className="mb-4">
                    ✅ Vitals recorded successfully! Returning to queue...
                  </Alert>
                )}

                <Tabs defaultActiveKey="new" className="pre-check-tabs custom-tabs mb-4">
                  {/* TAB 1: NEW VITALS */}
                  <Tab eventKey="new" title="✏️ Take New Vitals">
                    <Row>
                      <Col md={8}>
                        {/* Biometrics */}
                        <div className="opbill-section-title mt-0">
                          <span>⚖️</span> Physical Biometrics
                        </div>
                        <Row>
                          <Col md={6} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Height</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" name="height" value={vitals.height} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">cm</span>
                            </div>
                          </Col>
                          <Col md={6} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Weight</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" step="0.1" name="weight" value={vitals.weight} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">kg</span>
                            </div>
                          </Col>
                        </Row>

                        {/* Signs */}
                        <div className="opbill-section-title mt-2">
                          <span>❤️</span> Vital Signs
                        </div>
                        <Row>
                          <Col md={6} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Blood Pressure *</Form.Label>
                            <div className="d-flex align-items-center gap-2">
                              <div className="vital-input-group flex-grow-1">
                                <Form.Control type="number" name="sysBp" placeholder="Sys" value={vitals.sysBp} onChange={handleChange} className="opbill-form-control" />
                              </div>
                              <span style={{ color: '#94a3b8', fontSize: '1.5rem' }}>/</span>
                              <div className="vital-input-group flex-grow-1">
                                <Form.Control type="number" name="diaBp" placeholder="Dia" value={vitals.diaBp} onChange={handleChange} className="opbill-form-control" />
                              </div>
                            </div>
                          </Col>
                          <Col md={6} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Heart Rate (Pulse) *</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" name="pulse" value={vitals.pulse} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">bpm</span>
                            </div>
                          </Col>
                          
                          <Col md={4} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Temperature</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" step="0.1" name="temp" value={vitals.temp} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">°F</span>
                            </div>
                          </Col>
                          <Col md={4} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Respiration Rate</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" name="resp" value={vitals.resp} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">bpm</span>
                            </div>
                          </Col>
                          <Col md={4} className="opbill-form-group">
                            <Form.Label className="opbill-form-label">Oxygen (SpO2)</Form.Label>
                            <div className="vital-input-group">
                              <Form.Control type="number" name="spo2" value={vitals.spo2} onChange={handleChange} className="opbill-form-control" />
                              <span className="vital-input-unit">%</span>
                            </div>
                          </Col>
                        </Row>
                        
                        <div className="opbill-form-group mt-2">
                          <Form.Label className="opbill-form-label">Clinical Notes / Symptoms</Form.Label>
                          <Form.Control as="textarea" rows={2} name="notes" value={vitals.notes} onChange={handleChange} className="opbill-form-control" placeholder="Observations..."/>
                        </div>
                      </Col>

                      {/* Right Panel: Auto-Calc BMI */}
                      <Col md={4}>
                        <div className="bmi-card">
                          <span style={{ fontSize: '2rem' }}>⚖️</span>
                          <h5 className="mt-3" style={{ color: '#64748b' }}>Body Mass Index</h5>
                          {bmi > 0 ? (
                            <>
                              <div className="bmi-value">{bmi}</div>
                              <div className={`bmi-status ${bmiStatus}`}>
                                {bmiStatus.toUpperCase()}
                              </div>
                            </>
                          ) : (
                            <p className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
                              Enter height and weight to automatically calculate BMI.
                            </p>
                          )}
                        </div>
                      </Col>
                    </Row>
                    
                    <hr className="my-4" style={{ borderColor: '#e2e8f0' }} />
                    <div className="text-end">
                      <button className="btn-opbill-submit" onClick={handleSave} disabled={isSaved}>
                        {isSaved ? "Saving..." : "💾 Save Vitals"}
                      </button>
                    </div>
                  </Tab>

                  {/* TAB 2: HISTORY */}
                  <Tab eventKey="history" title="🕒 Vitals History">
                    <div style={{ overflowX: 'auto' }}>
                      <table className="vitals-history-table">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>BP (mmHg)</th>
                            <th>Pulse</th>
                            <th>Temp (°F)</th>
                            <th>SpO2</th>
                            <th>Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dummyHistory.map(record => {
                            const isHighBp = parseInt(record.bp.split('/')[0]) > 130;
                            const isFever = parseFloat(record.temp) >= 99.5;
                            return (
                              <tr key={record.id}>
                                <td style={{ fontWeight: 500 }}>
                                  {new Date(record.date).toLocaleDateString('en-GB')}<br />
                                  <small className="text-muted">{new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                </td>
                                <td>
                                  <div className="vital-metric">
                                    <span className={`val ${isHighBp ? 'vital-warning' : ''}`}>{record.bp}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="vital-metric"><span className="val">{record.pulse}</span> <span className="unit">bpm</span></div>
                                </td>
                                <td>
                                  <div className="vital-metric"><span className={`val ${isFever ? 'vital-warning' : ''}`}>{record.temp}</span></div>
                                </td>
                                <td>
                                  <div className="vital-metric"><span className="val">{record.spo2}</span> <span className="unit">%</span></div>
                                </td>
                                <td>
                                  <div className="vital-metric"><span className="val">{record.weight}</span> <span className="unit">kg</span></div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Tab>
                </Tabs>

              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PreCheckDetail;
