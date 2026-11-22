import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import patientApi from '../api/patientApi';
import appointmentApi from '../api/appointmentApi';
import './DoctorVisit.css';

const DoctorVisit = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Search state
  const [searchType, setSearchType] = useState('patientId');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [patientFound, setPatientFound] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Patient details (editable/addable)
  const [patientDetails, setPatientDetails] = useState({
    id: '',
    name: '',
    phone: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    email: '',
    address: '',
    city: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  // Visit form state
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    visitType: '',
    timeSlot: '',
    reason: '',
    notes: ''
  });

  const [tokenNumber, setTokenNumber] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Search handler (calls patient-service via Gateway)
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchError('Please enter an MRN or Phone number');
      setSearchResult(null);
      setPatientFound(false);
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      let patient = null;
      if (searchType === 'patientId') {
        try {
          patient = await patientApi.getByMrn(q);
        } catch (e) {
          const results = await patientApi.search({ query: q });
          if (Array.isArray(results) && results.length > 0) {
            patient = results[0];
          }
        }
      } else {
        const results = await patientApi.searchByPhone(q);
        if (Array.isArray(results) && results.length > 0) {
          patient = results[0];
        }
      }

      if (patient) {
        const formatted = {
          id: patient.mrn || patient.id,
          name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
          phone: patient.phone || '',
          dob: patient.dob || '',
          gender: patient.gender || '',
          bloodGroup: patient.bloodGroup || '',
          email: patient.email || '',
          address: patient.address || '',
          city: patient.city || '',
          emergencyContact: patient.emergencyContactName || patient.emergencyContact || '',
          emergencyPhone: patient.emergencyContactPhone || patient.emergencyPhone || ''
        };
        setSearchResult(formatted);
        setPatientDetails(formatted);
        setPatientFound(true);
        setSearchError('');
        setShowAddPatient(false);
      } else {
        setSearchResult(null);
        setPatientFound(false);
        setSearchError('Patient not found in database. You can add a new patient below.');
      }
    } catch (err) {
      console.error("Backend search failed:", err);
      setSearchResult(null);
      setPatientFound(false);
      setSearchError(typeof err === 'string' ? err : 'Error communicating with Patient Service. You can register a new patient below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNewPatient = () => {
    setShowAddPatient(true);
    setPatientFound(false);
    setSearchError('');
    setPatientDetails({
      id: '',
      name: '',
      phone: searchType === 'phone' ? searchQuery : '',
      dob: '',
      gender: '',
      bloodGroup: '',
      email: '',
      address: '',
      city: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  const handlePatientDetailChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      let patientMrn = patientDetails.id;

      // If user filled "Add New Patient" inline, register first
      if (showAddPatient && !patientMrn) {
        const nameParts = (patientDetails.name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Patient';
        const lastName = nameParts.slice(1).join(' ') || '';
        const regPayload = {
          firstName,
          lastName,
          phone: patientDetails.phone,
          dob: patientDetails.dob,
          gender: patientDetails.gender,
          bloodGroup: patientDetails.bloodGroup,
          email: patientDetails.email,
          address: patientDetails.address,
          city: patientDetails.city,
          emergencyContactName: patientDetails.emergencyContact,
          emergencyContactPhone: patientDetails.emergencyPhone
        };
        const regResponse = await patientApi.register(regPayload);
        patientMrn = regResponse.mrn;
        setPatientDetails(prev => ({ ...prev, id: patientMrn }));
      }

      const bookingPayload = {
        patientMrn: patientMrn || 'GUEST',
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        department: formData.department,
        doctor: formData.doctor,
        visitType: formData.visitType,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        notes: formData.notes
      };

      const res = await appointmentApi.book(bookingPayload);
      setTokenNumber(res.tokenNumber);
      setSubmitMessage({
        type: 'success',
        text: `OP Visit Booked successfully! Token #${res.tokenNumber} assigned to ${patientDetails.name}.`
      });
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setSubmitMessage({
        type: 'danger',
        text: typeof err === 'string' ? err : (err?.message || 'Failed to book visit with Appointment Service.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setPatientFound(false);
    setSearchError('');
    setShowAddPatient(false);
    setTokenNumber(null);
    setPatientDetails({ id: '', name: '', phone: '', dob: '', gender: '', bloodGroup: '', email: '', address: '', city: '', emergencyContact: '', emergencyPhone: '' });
    setFormData({ department: '', doctor: '', visitType: '', timeSlot: '', reason: '', notes: '' });
  };

  return (
    <div className="visit-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="visit-card shadow-lg">
              <div className="visit-header">
                <span className="visit-header-icon">🩺</span>
                <h2 className="visit-title">Today's OP Visit</h2>
                <p className="visit-subtitle mb-0">Register a patient visit for outpatient consultation</p>
                <div className="visit-header-actions">
                  <div className="visit-today-badge">📅 {todayStr}</div>
                  <button
                    className="btn-new-patient-header"
                    onClick={() => navigate('/patients')}
                    id="btn-new-patient"
                  >
                    👤 + New Patient
                  </button>
                </div>
              </div>

              <div className="visit-body text-start">

                {/* ====== SEARCH SECTION ====== */}
                <div className="visit-section-title">
                  <span>🔍</span> Search Patient
                </div>
                <div className="search-patient-box">
                  <Row className="align-items-end">
                    <Col md={3} className="visit-form-group">
                      <Form.Label className="visit-form-label">Search By</Form.Label>
                      <Form.Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="visit-form-select"
                      >
                        <option value="patientId">Patient ID / MRN</option>
                        <option value="phone">Phone Number</option>
                      </Form.Select>
                    </Col>
                    <Col md={5} className="visit-form-group">
                      <Form.Label className="visit-form-label">
                        {searchType === 'patientId' ? 'Patient ID / MRN' : 'Phone Number'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'patientId' ? 'e.g., MRN-001' : 'e.g., 9876543210'}
                        className="visit-form-control"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                      />
                    </Col>
                    <Col md={4} className="visit-form-group d-flex gap-2">
                      <Button className="btn-search-patient" onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Searching...
                          </>
                        ) : (
                          '🔍 Search'
                        )}
                      </Button>
                      <Button className="btn-clear-search" variant="outline-secondary" onClick={handleClearSearch} disabled={isSearching}>
                        ✕ Clear
                      </Button>
                    </Col>
                  </Row>

                  {searchError && (
                    <div className="search-error-box">
                      <span>⚠️ {searchError}</span>
                      <Button className="btn-add-new-patient" onClick={handleAddNewPatient}>
                        + Add New Patient
                      </Button>
                    </div>
                  )}
                </div>

                {/* ====== PATIENT DETAILS CARD (Read-only when found) ====== */}
                {patientFound && patientDetails && (
                  <div className="patient-details-card">
                    <div className="patient-details-header">
                      <span>✅ Patient Found</span>
                      <span className="patient-mrn-badge">{patientDetails.id}</span>
                    </div>
                    <Row className="patient-details-grid">
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{patientDetails.name}</span>
                      </Col>
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{patientDetails.phone}</span>
                      </Col>
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Date of Birth</span>
                        <span className="detail-value">{patientDetails.dob}</span>
                      </Col>
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{patientDetails.gender}</span>
                      </Col>
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Blood Group</span>
                        <span className="detail-value">{patientDetails.bloodGroup}</span>
                      </Col>
                      <Col md={4} className="patient-detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{patientDetails.email}</span>
                      </Col>
                      <Col md={6} className="patient-detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{patientDetails.address}, {patientDetails.city}</span>
                      </Col>
                      <Col md={3} className="patient-detail-item">
                        <span className="detail-label">Emergency Contact</span>
                        <span className="detail-value">{patientDetails.emergencyContact}</span>
                      </Col>
                      <Col md={3} className="patient-detail-item">
                        <span className="detail-label">Emergency Phone</span>
                        <span className="detail-value">{patientDetails.emergencyPhone}</span>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ====== ADD NEW PATIENT FORM ====== */}
                {showAddPatient && (
                  <div className="add-patient-section">
                    <div className="visit-section-title mt-3">
                      <span>➕</span> Add New Patient
                    </div>
                    <Row>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Full Name *</Form.Label>
                        <Form.Control type="text" name="name" value={patientDetails.name} onChange={handlePatientDetailChange} placeholder="e.g., John Doe" className="visit-form-control" required />
                      </Col>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Phone Number *</Form.Label>
                        <Form.Control type="tel" name="phone" value={patientDetails.phone} onChange={handlePatientDetailChange} placeholder="e.g., 9876543210" className="visit-form-control" required />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4} className="visit-form-group">
                        <Form.Label className="visit-form-label">Date of Birth</Form.Label>
                        <Form.Control type="date" name="dob" value={patientDetails.dob} onChange={handlePatientDetailChange} className="visit-form-control" />
                      </Col>
                      <Col md={4} className="visit-form-group">
                        <Form.Label className="visit-form-label">Gender</Form.Label>
                        <Form.Select name="gender" value={patientDetails.gender} onChange={handlePatientDetailChange} className="visit-form-select">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Col>
                      <Col md={4} className="visit-form-group">
                        <Form.Label className="visit-form-label">Blood Group</Form.Label>
                        <Form.Select name="bloodGroup" value={patientDetails.bloodGroup} onChange={handlePatientDetailChange} className="visit-form-select">
                          <option value="">Select Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Email</Form.Label>
                        <Form.Control type="email" name="email" value={patientDetails.email} onChange={handlePatientDetailChange} placeholder="john@example.com" className="visit-form-control" />
                      </Col>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">City</Form.Label>
                        <Form.Control type="text" name="city" value={patientDetails.city} onChange={handlePatientDetailChange} placeholder="e.g., Kochi" className="visit-form-control" />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12} className="visit-form-group">
                        <Form.Label className="visit-form-label">Address</Form.Label>
                        <Form.Control type="text" name="address" value={patientDetails.address} onChange={handlePatientDetailChange} placeholder="Full address" className="visit-form-control" />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Emergency Contact Name</Form.Label>
                        <Form.Control type="text" name="emergencyContact" value={patientDetails.emergencyContact} onChange={handlePatientDetailChange} placeholder="Emergency contact name" className="visit-form-control" />
                      </Col>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Emergency Contact Phone</Form.Label>
                        <Form.Control type="tel" name="emergencyPhone" value={patientDetails.emergencyPhone} onChange={handlePatientDetailChange} placeholder="Emergency contact phone" className="visit-form-control" />
                      </Col>
                    </Row>
                  </div>
                )}

                {/* ====== VISIT FORM (only visible after patient is found or being added) ====== */}
                {(patientFound || showAddPatient) && (
                  <Form onSubmit={handleSubmit}>
                    {/* --- Doctor & Department --- */}
                    <div className="visit-section-title mt-4">
                      <span>🏥</span> Doctor & Department
                    </div>
                    <Row>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Department *</Form.Label>
                        <Form.Select name="department" value={formData.department} onChange={handleChange} className="visit-form-select" required>
                          <option value="">Select Department</option>
                          <option value="General Medicine">General Medicine</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Dermatology">Dermatology</option>
                          <option value="ENT">ENT</option>
                          <option value="Ophthalmology">Ophthalmology</option>
                          <option value="Gynecology">Gynecology</option>
                          <option value="Neurology">Neurology</option>
                        </Form.Select>
                      </Col>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Doctor *</Form.Label>
                        <Form.Select name="doctor" value={formData.doctor} onChange={handleChange} className="visit-form-select" required>
                          <option value="">Select Doctor</option>
                          <option value="Dr. Sharma">Dr. Sharma</option>
                          <option value="Dr. Patel">Dr. Patel</option>
                          <option value="Dr. Kumar">Dr. Kumar</option>
                          <option value="Dr. Reddy">Dr. Reddy</option>
                          <option value="Dr. Nair">Dr. Nair</option>
                        </Form.Select>
                      </Col>
                    </Row>

                    {/* --- Visit Details --- */}
                    <div className="visit-section-title mt-4">
                      <span>📋</span> Visit Details
                    </div>
                    <Row>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Visit Type *</Form.Label>
                        <Form.Select name="visitType" value={formData.visitType} onChange={handleChange} className="visit-form-select" required>
                          <option value="">Select Visit Type</option>
                          <option value="New Visit">New Visit</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Referral">Referral</option>
                        </Form.Select>
                      </Col>
                      <Col md={6} className="visit-form-group">
                        <Form.Label className="visit-form-label">Time Slot</Form.Label>
                        <Form.Select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="visit-form-select">
                          <option value="">Select Time Slot</option>
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                        </Form.Select>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12} className="visit-form-group">
                        <Form.Label className="visit-form-label">Reason for Visit</Form.Label>
                        <Form.Control as="textarea" rows={2} name="reason" value={formData.reason} onChange={handleChange} placeholder="Brief description of symptoms or reason for visit" className="visit-form-control" />
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12} className="visit-form-group">
                        <Form.Label className="visit-form-label">Additional Notes</Form.Label>
                        <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={handleChange} placeholder="Any allergies, current medications, or special instructions" className="visit-form-control" />
                      </Col>
                    </Row>

                    <div className="visit-submit-wrapper">
                      <button type="submit" className="btn-visit-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Booking OP Visit...
                          </>
                        ) : (
                          'Register OP Visit'
                        )}
                      </button>
                    </div>

                    {submitMessage && (
                      <Alert
                        variant={submitMessage.type === 'success' ? 'success' : 'warning'}
                        className="mt-3"
                        dismissible
                        onClose={() => setSubmitMessage(null)}
                      >
                        {submitMessage.type === 'success' ? '✅ ' : 'ℹ️ '}
                        {submitMessage.text}
                      </Alert>
                    )}

                    {tokenNumber && (
                      <div className="visit-token-preview">
                        <div className="visit-token-label">OP Token Number</div>
                        <div className="visit-token-number">{tokenNumber}</div>
                      </div>
                    )}
                  </Form>
                )}

              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorVisit;
