import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const IpBilling = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/ip-billing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🏥"
      title="IP Billing"
      subtitle="Search patient to generate inpatient bills"
      buttonText="💳 IP Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default IpBilling;
