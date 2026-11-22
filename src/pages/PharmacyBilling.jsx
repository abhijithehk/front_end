import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const PharmacyBilling = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/pharmacy-billing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="💊"
      title="Pharmacy Billing"
      subtitle="Search patient to generate pharmacy bills"
      buttonText="💳 Pharmacy Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default PharmacyBilling;
