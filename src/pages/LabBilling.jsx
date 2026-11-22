import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const LabBilling = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/lab-billing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🔬"
      title="Lab Billing"
      subtitle="Search patient to generate laboratory bills"
      buttonText="💳 Lab Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default LabBilling;
