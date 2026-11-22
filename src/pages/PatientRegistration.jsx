import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import patientApi from '../api/patientApi';
import './PatientRegistration.css';

const PatientRegistration = ({ embedded = false, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  const validateField = (name, value) => {
    let error = '';
    const trimmedVal = typeof value === 'string' ? value.trim() : '';

    switch (name) {
      case 'firstName':
        if (!trimmedVal) {
          error = 'First name is required.';
        } else if (trimmedVal.length < 2) {
          error = 'First name must be at least 2 characters.';
        } else if (!/^[A-Za-z\s'-]+$/.test(trimmedVal)) {
          error = 'First name can only contain letters and hyphens.';
        }
        break;

      case 'lastName':
        if (!trimmedVal) {
          error = 'Last name is required.';
        } else if (!/^[A-Za-z\s'-]+$/.test(trimmedVal)) {
          error = 'Last name can only contain letters and hyphens.';
        }
        break;

      case 'dob': {
        if (!value) {
          error = 'Date of birth is required.';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (selectedDate > today) {
            error = 'Date of birth cannot be in the future.';
          } else if (selectedDate.getFullYear() < 1900) {
            error = 'Please enter a valid date of birth (year ≥ 1900).';
          }
        }
        break;
      }

      case 'gender':
        if (!trimmedVal) {
          error = 'Please select a gender.';
        }
        break;

      case 'phone': {
        if (!trimmedVal) {
          error = 'Phone number is required.';
        } else {
          const digitsOnly = trimmedVal.replace(/[\s\-()+]/g, '');
          if (!/^\d{10,15}$/.test(digitsOnly)) {
            error = 'Phone number must be 10 to 15 digits.';
          }
        }
        break;
      }

      case 'email':
        if (trimmedVal) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(trimmedVal)) {
            error = 'Please enter a valid email address.';
          }
        }
        break;

      case 'emergencyContactPhone':
        if (trimmedVal) {
          const digitsOnly = trimmedVal.replace(/[\s\-()+]/g, '');
          if (!/^\d{10,15}$/.test(digitsOnly)) {
            error = 'Emergency phone must be 10 to 15 digits.';
          }
        }
        break;

      case 'emergencyContactName':
        if (trimmedVal && !/^[A-Za-z\s.'-]+$/.test(trimmedVal)) {
          error = 'Emergency contact name can only contain letters.';
        }
        break;

      case 'city':
        if (trimmedVal && !/^[A-Za-z\s.'-]+$/.test(trimmedVal)) {
          error = 'City name can only contain letters.';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateAll = (data = formData) => {
    const newErrors = {};
    const fieldsToValidate = [
      'firstName',
      'lastName',
      'dob',
      'gender',
      'phone',
      'email',
      'emergencyContactPhone',
      'emergencyContactName',
      'city'
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      bloodGroup: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    });
    setErrors({});
    setTouched({});
    setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please resolve the highlighted validation errors before submitting.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      console.log(formData);
      const response = await patientApi.register(formData);
      console.log('Patient registered successfully:', response);

      const patientId = response?.id ?? response?.mrn ?? 'N/A';
      const mrn = response?.mrn || '';
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        html: `
          <div style="text-align: left; padding: 0.5rem 1rem;">
            <p style="margin-bottom: 0.5rem;"><strong>Patient Name:</strong> ${fullName}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Patient ID:</strong> <span style="font-weight: bold; color: #0d9488; font-size: 1.15rem;">${patientId}</span></p>
            ${mrn && mrn !== String(patientId) ? `<p style="margin-bottom: 0.5rem;"><strong>MRN:</strong> <span style="font-weight: bold; color: #2563eb;">${mrn}</span></p>` : ''}
          </div>
        `,
        confirmButtonColor: '#0d9488',
        confirmButtonText: 'OK'
      });

      if (onRegisterSuccess) {
         onRegisterSuccess(response || formData);
      } else {
        setSubmitStatus({
          type: 'success',
          message: `Patient "${fullName}" registered successfully! Patient ID: ${patientId}${mrn && mrn !== String(patientId) ? ` (MRN: ${mrn})` : ''}`
        });
        // Reset form
        handleClear();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMsg = typeof error === 'string' ? error : (error?.message || 'Failed to register patient. Please try again.');

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMsg,
        confirmButtonColor: '#ef4444'
      });

      setSubmitStatus({
        type: 'error',
        message: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  const formContent = (
    <Form noValidate onSubmit={handleSubmit} className={embedded ? 'embedded-registration' : ''}>
                  
                  {/* --- Personal Information --- */}
                  <div className="form-section-title">
                    <span role="img" aria-label="user">👤</span> Personal Information
                  </div>
                  <Row>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.firstName}
                        placeholder="e.g., John"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.lastName}
                        placeholder="e.g., Doe"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4} className="custom-form-group">
                      <Form.Label className="custom-form-label">Date of Birth *</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        max={todayDate}
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.dob}
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dob}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={4} className="custom-form-group">
                      <Form.Label className="custom-form-label">Gender *</Form.Label>
                      <Form.Select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.gender}
                        className="custom-form-select"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={4} className="custom-form-group">
                      <Form.Label className="custom-form-label">Blood Group</Form.Label>
                      <Form.Select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="custom-form-select"
                      >
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

                  {/* --- Contact Details --- */}
                  <div className="form-section-title mt-4">
                    <span role="img" aria-label="contact">📞</span> Contact Details
                  </div>
                  <Row>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.phone}
                        placeholder="e.g., 9876543210"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.email}
                        placeholder="john.doe@example.com"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={8} className="custom-form-group">
                      <Form.Label className="custom-form-label">Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St, Apt 4B"
                        className="custom-form-control"
                      />
                    </Col>
                    <Col md={4} className="custom-form-group">
                      <Form.Label className="custom-form-label">City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.city}
                        placeholder="New York"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  {/* --- Emergency Contact --- */}
                  <div className="form-section-title mt-4">
                    <span role="img" aria-label="emergency">🚨</span> Emergency Contact
                  </div>
                  <Row>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">Contact Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.emergencyContactName}
                        placeholder="Jane Doe"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.emergencyContactName}
                      </Form.Control.Feedback>
                    </Col>
                    <Col md={6} className="custom-form-group">
                      <Form.Label className="custom-form-label">Contact Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!errors.emergencyContactPhone}
                        placeholder="e.g., 9876543210"
                        className="custom-form-control"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.emergencyContactPhone}
                      </Form.Control.Feedback>
                    </Col>
                  </Row>

                  <div className="submit-btn-wrapper d-flex gap-3">
                    <button
                      type="button"
                      className="btn-clear-form"
                      onClick={handleClear}
                      disabled={isSubmitting}
                    >
                      Clear Form
                    </button>
                    <button type="submit" className="btn-register" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Registering...
                        </>
                      ) : (
                        'Register Patient'
                      )}
                    </button>
                  </div>

                  {submitStatus && (
                    <Alert
                      variant={submitStatus.type === 'success' ? 'success' : 'danger'}
                      className="mt-3"
                      dismissible
                      onClose={() => setSubmitStatus(null)}
                    >
                      {submitStatus.type === 'success' ? '✅ ' : '❌ '}
                      {submitStatus.message}
                    </Alert>
                  )}

    </Form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="registration-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={10}>
            <div className="registration-card shadow-lg">
              <div className="card-header-custom p-4">
                <span className="card-header-icon">🏥</span>
                <h2 className="card-title-custom mb-1">Patient Registration</h2>
                <p className="card-subtitle-custom mb-0">Enter details to register a new patient securely</p>
              </div>
              <div className="registration-body text-start">
                {formContent}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PatientRegistration;
