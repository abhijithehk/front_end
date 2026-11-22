import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const IpPharmacy = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/ip-pharmacy/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🛏️"
      title="IP Pharmacy"
      subtitle="Search for an In-Patient to view active medication charts and dispense drugs"
      buttonText="💊 Dispense →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default IpPharmacy;
