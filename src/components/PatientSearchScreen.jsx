import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import PatientListTable from './PatientListTable';
import patientApi from '../api/patientApi';
import '../pages/OpBilling.css'; // Reusing the same CSS to maintain consistency

const formatPatient = (p) => {
  if (!p) return null;
  return {
    id: p.mrn || p.id || '',
    mrn: p.mrn || p.id || '',
    name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown Patient',
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    phone: p.phone || '',
    dob: p.dob || '',
    gender: p.gender || '',
    bloodGroup: p.bloodGroup || '',
    email: p.email || '',
    address: p.address || '',
    city: p.city || '',
    emergencyContact: p.emergencyContactName || p.emergencyContact || '',
    emergencyPhone: p.emergencyContactPhone || p.emergencyPhone || '',
    lastVisit: p.lastVisit || p.registeredAt || null,
    doctor: p.doctor || 'General Consultation',
    pendingAmount: p.pendingAmount !== undefined ? p.pendingAmount : 0
  };
};

const PatientSearchScreen = ({ icon, title, subtitle, buttonText = "💳 Bill →", onSelectPatient }) => {
  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Search state
  const [searchType, setSearchType] = useState('patientId');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initial load: Fetch all registered patients from Backend
  const fetchAllPatients = useCallback(async () => {
    setIsLoading(true);
    setSearchError('');
    try {
      const data = await patientApi.getAll();
      if (Array.isArray(data)) {
        setSearchResults(data.map(formatPatient));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Failed to load patients from backend:", err);
      setSearchError(typeof err === 'string' ? err : 'Unable to connect to Patient Service. Please verify Backend is running.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setHasSearched(false);
      fetchAllPatients();
      return;
    }

    setIsLoading(true);
    setSearchError('');
    setHasSearched(true);

    try {
      let results = [];
      if (searchType === 'patientId') {
        try {
          const singlePatient = await patientApi.getByMrn(q);
          if (singlePatient) {
            results = [singlePatient];
          }
        } catch (e) {
          // If MRN exact lookup fails, try search query
          const searchList = await patientApi.search({ query: q });
          if (Array.isArray(searchList)) results = searchList;
        }
      } else {
        const phoneResults = await patientApi.searchByPhone(q);
        if (Array.isArray(phoneResults)) {
          results = phoneResults;
        }
      }

      const formatted = results.map(formatPatient).filter(Boolean);
      setSearchResults(formatted);
      if (formatted.length === 0) {
        setSearchError('No patients found matching your search criteria.');
      }
    } catch (err) {
      console.error("Patient search failed:", err);
      setSearchError(typeof err === 'string' ? err : 'Error searching patients. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError('');
    setHasSearched(false);
    fetchAllPatients();
  };

  return (
    <div className="opbill-page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={12} xl={12}>
            <div className="opbill-card shadow-lg">
              <div className="opbill-header">
                <span className="opbill-header-icon">{icon}</span>
                <h2 className="opbill-title">{title}</h2>
                <p className="opbill-subtitle mb-0">{subtitle}</p>
                <div className="opbill-header-actions">
                  <div className="opbill-today-badge">📅 {todayStr}</div>
                </div>
              </div>

              <div className="opbill-body text-start">
                {/* Search Section */}
                <div className="opbill-section-title">
                  <span>🔍</span> Search Patient
                </div>
                <div className="opbill-search-box">
                  <Row className="align-items-end">
                    <Col md={3} className="opbill-form-group">
                      <Form.Label className="opbill-form-label">Search By</Form.Label>
                      <Form.Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="opbill-form-select"
                        id={`${title.replace(/\s+/g, '-').toLowerCase()}-search-type`}
                      >
                        <option value="patientId">Patient ID / MRN</option>
                        <option value="phone">Phone Number</option>
                      </Form.Select>
                    </Col>
                    <Col md={5} className="opbill-form-group">
                      <Form.Label className="opbill-form-label">
                        {searchType === 'patientId' ? 'Patient ID / MRN' : 'Phone Number'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'patientId' ? 'e.g., MRN-202604-001' : 'e.g., 9876543210'}
                        className="opbill-form-control"
                        id={`${title.replace(/\s+/g, '-').toLowerCase()}-search-input`}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                      />
                    </Col>
                    <Col md={4} className="opbill-form-group d-flex gap-2">
                      <Button className="btn-opbill-search" onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Searching...
                          </>
                        ) : (
                          '🔍 Search'
                        )}
                      </Button>
                      <Button className="btn-opbill-clear" variant="outline-secondary" onClick={handleClearSearch} disabled={isLoading}>
                        ✕ Clear
                      </Button>
                    </Col>
                  </Row>

                  {searchError && (
                    <div className="opbill-search-error">
                      <span>⚠️ {searchError}</span>
                    </div>
                  )}
                </div>

                {/* Loading state indicator */}
                {isLoading && searchResults.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Spinner animation="border" variant="primary" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 500 }}>Connecting to Patient Service...</p>
                  </div>
                )}

                {/* Results Table via PatientListTable Component */}
                {!isLoading && searchResults.length > 0 && (
                  <PatientListTable 
                    patients={searchResults}
                    title={<span>📋 {hasSearched ? 'Search Results' : 'Registered Patient List'}</span>}
                    buttonText={buttonText}
                    onSelectPatient={onSelectPatient}
                  />
                )}

                {/* Empty State */}
                {!isLoading && searchResults.length === 0 && !searchError && (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
                    <p style={{ fontWeight: 500 }}>No registered patients found in backend. Register a new patient to get started.</p>
                  </div>
                )}

              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PatientSearchScreen;
