import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import PatientRegistration from './PatientRegistration';
import patientApi from '../api/patientApi';
import appointmentApi from '../api/appointmentApi';
import './OpBilling.css'; // Shared premium styles
import './AppointmentBooking.css'; // Component specific active/pill styles

const doctorsByDept = {
  'General Medicine': ['Dr. Sharma', 'Dr. Verma'],
  'Cardiology': ['Dr. Kumar', 'Dr. Iyer'],
  'Neurology': ['Dr. Menon'],
  'Orthopedics': ['Dr. Reddy', 'Dr. Desai'],
  'Pediatrics': ['Dr. Varma', 'Dr. Nair'],
  'Dermatology': ['Dr. Patel'],
  'ENT': ['Dr. Joseph']
};

const allTimeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const AppointmentBooking = () => {
  // Setup today's date for 'min' attribute restriction
  const todayRaw = new Date();
  const todayStr = new Date(todayRaw.getTime() - (todayRaw.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  // Forms & State
  const [bookingMode, setBookingMode] = useState('existing'); // 'existing' | 'new'

  // Existing patient state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Appointment State
  const [apptDept, setApptDept] = useState('');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState(todayStr);
  const [apptTime, setApptTime] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Final Confirmation
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Auto-reset doctor when department changes
  useEffect(() => {
    setApptDoctor('');
  }, [apptDept]);

  const handleSearchPatient = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchError('Please enter an MRN or Phone number');
      setSelectedPatient(null);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSelectedPatient(null);

    try {
      let patient = null;
      // Try searching by MRN directly
      try {
        patient = await patientApi.getByMrn(q);
      } catch (e) {
        // If not found by exact MRN, try searching by phone or keyword query
        const results = await patientApi.search({ phone: q, query: q });
        if (Array.isArray(results) && results.length > 0) {
          patient = results[0];
        }
      }

      if (patient) {
        const formatted = {
          id: patient.mrn || patient.id,
          mrn: patient.mrn || patient.id,
          name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
          phone: patient.phone || '',
          gender: patient.gender || '',
          dob: patient.dob || ''
        };
        setSelectedPatient(formatted);
        setSearchError('');
      } else {
        setSelectedPatient(null);
        setSearchError('Patient not found. Try switching to "New Patient" to register.');
      }
    } catch (err) {
      console.error("Patient search failed:", err);
      setSearchError(typeof err === 'string' ? err : 'Patient not found. You can register them below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterSuccess = (patientData) => {
    // Treat the newly registered patient as "existing" locally so they can book immediately
    const realMrn = patientData.mrn || patientData.id || '';
    const tempPatient = {
      id: realMrn,
      mrn: realMrn,
      name: patientData.name || `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
      phone: patientData.phone || '',
      gender: patientData.gender || '',
      dob: patientData.dob || ''
    };
    setSelectedPatient(tempPatient);
    setSearchQuery(realMrn || tempPatient.phone);
    setBookingMode('existing');
  };

  const isFormValid = () => {
    if (!selectedPatient) return false;
    if (!apptDept || !apptDoctor || !apptDate || !apptTime) return false;
    return true;
  };

  const handleBookingConfirm = async () => {
    if (!isFormValid()) return;
    
    setIsBooking(true);
    setBookingError('');

    try {
      const payload = {
        patientMrn: selectedPatient.id || selectedPatient.mrn,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        department: apptDept,
        doctor: apptDoctor,
        visitType: 'OP Visit',
        timeSlot: apptTime,
        reason: apptNotes,
        notes: apptNotes,
        appointmentDate: apptDate
      };

      const res = await appointmentApi.book(payload);
      setTokenNumber(res.tokenNumber ? `Token #${res.tokenNumber}` : `TKN-CONFIRMED`);
      setConfirmedBooking(res);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setBookingError(typeof err === 'string' ? err : (err?.message || 'Failed to confirm booking with Appointment Service. Please try again.'));
    } finally {
      setIsBooking(false);
    }
  };

  const handleRestart = () => {
    setIsSubmitted(false);
    setSelectedPatient(null);
    setSearchQuery('');
    setApptDept('');
    setApptDoctor('');
    setApptTime('');
    setApptNotes('');
    setBookingError('');
    setConfirmedBooking(null);
  };

  // Determine which names to show on success
  const displayPatientName = selectedPatient?.name || confirmedBooking?.patientName;

  return (
    <div className="opbill-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="opbill-card shadow-lg">
              
              {!isSubmitted ? (
                <>
                  <div className="opbill-header">
                    <span className="opbill-header-icon">📅</span>
                    <h2 className="opbill-title">Appointment Booking</h2>
                    <p className="opbill-subtitle mb-0">Schedule and manage patient appointments</p>
                  </div>

                  <div className="opbill-body text-start">
                    
                    {/* ===== Patient Information Section ===== */}
                    <div className="opbill-section-title">
                      <span>👤</span> Patient Details
                    </div>

                    <div className="booking-toggle-group">
                      <div 
                        className={`booking-toggle-btn ${bookingMode === 'existing' ? 'active' : ''}`}
                        onClick={() => setBookingMode('existing')}
                      >
                        Registered Patient
                      </div>
                      <div 
                        className={`booking-toggle-btn ${bookingMode === 'new' ? 'active' : ''}`}
                        onClick={() => setBookingMode('new')}
                      >
                        New Patient
                      </div>
                    </div>

                    {bookingMode === 'existing' ? (
                      <div className="opbill-search-box">
                        <Row className="align-items-end">
                          <Col md={8} className="opbill-form-group mb-0 pb-0">
                            <Form.Label className="opbill-form-label">Search by MRN or Phone</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="e.g., MRN-202604-001 or 9876543210"
                              className="opbill-form-control"
                              onKeyDown={(e) => { if(e.key === 'Enter') handleSearchPatient(); }}
                            />
                          </Col>
                          <Col md={4} className="d-flex">
                            <Button className="btn-opbill-search w-100" onClick={handleSearchPatient} disabled={isSearching}>
                              {isSearching ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Fetching...
                                </>
                              ) : (
                                '🔍 Fetch'
                              )}
                            </Button>
                          </Col>
                        </Row>
                        {searchError && <div className="text-danger mt-2 fw-medium">⚠️ {searchError}</div>}
                        
                        {selectedPatient && (
                          <div className="opbill-patient-strip mt-3" style={{ border: '2px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                            <div className="opbill-patient-meta m-0 p-0">
                              <h4>✅ {selectedPatient.name}</h4>
                              <div className="opbill-patient-meta-details mt-1">
                                <span>📞 {selectedPatient.phone}</span>
                                <span>{selectedPatient.gender}</span>
                                <span>MRN: {selectedPatient.id}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4" style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ color: '#0d9488', marginBottom: '1rem', fontWeight: 600 }}>Please register this patient first:</h5>
                        <PatientRegistration embedded={true} onRegisterSuccess={handleRegisterSuccess} />
                      </div>
                    )}

                    {selectedPatient && (
                      <>
                        {/* ===== Appointment Details Section ===== */}
                        <div className="opbill-section-title mt-4">
                          <span>🏥</span> Consultation Details
                        </div>

                        <Row>
                          <Col md={4} className="opbill-form-group">
                        <Form.Label className="opbill-form-label">Department *</Form.Label>
                        <Form.Select className="opbill-form-select" value={apptDept} onChange={e => setApptDept(e.target.value)}>
                          <option value="">Select Dept</option>
                          {Object.keys(doctorsByDept).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4} className="opbill-form-group">
                        <Form.Label className="opbill-form-label">Doctor *</Form.Label>
                        <Form.Select className="opbill-form-select" value={apptDoctor} onChange={e => setApptDoctor(e.target.value)} disabled={!apptDept}>
                          <option value="">Select Doctor</option>
                          {apptDept && doctorsByDept[apptDept].map(doc => (
                            <option key={doc} value={doc}>{doc}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={4} className="opbill-form-group">
                        <Form.Label className="opbill-form-label">Date *</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="opbill-form-control" 
                          min={todayStr} // Restrict to future dates only
                          value={apptDate} 
                          onChange={e => setApptDate(e.target.value)} 
                        />
                      </Col>
                    </Row>

                    <div className="opbill-form-group mb-4">
                      <Form.Label className="opbill-form-label">Time Slot *</Form.Label>
                      <div className="time-slot-grid">
                        {allTimeSlots.map(time => {
                          return (
                            <button
                              key={time}
                              disabled={!apptDoctor || !apptDate}
                              className={`time-slot-pill ${apptTime === time ? 'selected' : ''}`}
                              onClick={() => setApptTime(time)}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                      {!apptDoctor && <small className="text-muted mt-2 d-inline-block">Select a doctor and date to view available time slots.</small>}
                        </div>

                        <div className="opbill-form-group">
                          <Form.Label className="opbill-form-label">Chief Complaint / Reason</Form.Label>
                          <Form.Control as="textarea" rows={2} className="opbill-form-control" value={apptNotes} onChange={e => setApptNotes(e.target.value)} placeholder="Briefly describe the reason for visit (optional)"/>
                        </div>

                        {bookingError && (
                          <Alert variant="danger" className="mt-3">
                            ⚠️ {bookingError}
                          </Alert>
                        )}

                        {/* Actions */}
                        <div className="opbill-submit-wrapper">
                          <button className="btn-opbill-draft" onClick={() => handleRestart()}>
                            ✕ Clear Form
                          </button>
                          <button 
                            className="btn-opbill-submit" 
                            onClick={handleBookingConfirm} 
                            disabled={!isFormValid() || isBooking}
                            style={!isFormValid() ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                          >
                            {isBooking ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Booking...
                              </>
                            ) : (
                              '✓ Confirm Appointment'
                            )}
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                </>
              ) : (
                /* ===== SUCCESS STATE ===== */
                <div className="booking-success-card">
                  <div className="booking-success-icon">✅</div>
                  <div className="booking-success-title">Appointment Confirmed!</div>
                  <div className="booking-success-token">{tokenNumber}</div>
                  <div className="booking-success-details">
                    <strong>Patient:</strong> {displayPatientName} <br />
                    <strong>Consultation:</strong> {apptDoctor} ({apptDept}) <br />
                    <strong>Date & Time:</strong> {new Date(apptDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} at {apptTime}
                  </div>
                  <button className="btn-opbill-submit" onClick={handleRestart} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                    Book Another Appointment
                  </button>
                </div>
              )}

            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AppointmentBooking;
