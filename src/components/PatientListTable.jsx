import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../pages/OpBilling.css'; // Inheriting styling

const PatientListTable = ({ patients, title = '📋 Patient List', buttonText = "Select →", onSelectPatient }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Reset pagination to 1 whenever the provided dataset changes completely (like performing a search)
  useEffect(() => {
    setCurrentPage(1);
  }, [patients]);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Pagination Slice Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTableData = patients.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(patients.length / rowsPerPage);

  if (!patients || patients.length === 0) {
    return null;
  }

  return (
    <div className="opbill-results-section">
      <div className="opbill-section-title">
        {title}
      </div>
      <div className="opbill-results-header">
        <div className="rows-per-page-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          <span>Rows per page:</span>
          <select 
            value={rowsPerPage} 
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#334e68', background: 'white', cursor: 'pointer', outline: 'none' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={patients.length > 50 ? patients.length : 100}>All</option>
          </select>
        </div>
        <span className="opbill-results-count">
          Found <strong>{patients.length}</strong> patient{patients.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="opbill-table-wrapper">
        <table className="opbill-table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Age / Gender</th>
              <th>Last Visit</th>
              <th>Doctor</th>
              <th>Pending</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((patient) => (
              <tr key={patient.id} onClick={() => onSelectPatient(patient)}>
                <td><span className="opbill-mrn-badge">{patient.id}</span></td>
                <td><span className="opbill-patient-name">{patient.name}</span></td>
                <td>{patient.phone}</td>
                <td>
                  {calculateAge(patient.dob)} yrs &nbsp;
                  {patient.gender && (
                    <span className={`opbill-gender-badge ${patient.gender.toLowerCase()}`}>
                      {patient.gender}
                    </span>
                  )}
                </td>
                <td>
                  {patient.lastVisit 
                    ? new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                    : 'N/A'}
                </td>
                <td>{patient.doctor || 'N/A'}</td>
                <td>
                  <span style={{ fontWeight: 600, color: (patient.pendingAmount || 0) > 0 ? '#dc2626' : '#059669' }}>
                    ₹{(patient.pendingAmount || 0).toLocaleString()}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-opbill-select" 
                    onClick={(e) => { e.stopPropagation(); onSelectPatient(patient); }}
                  >
                    {buttonText}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      
      <div className="opbill-pagination-wrapper" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '1rem', padding: '0 0.5rem' }}>
        {totalPages > 1 && (
          <div className="opbill-pagination" style={{ marginTop: 0, marginLeft: '70%' }}>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              ← Previous
            </Button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientListTable;
