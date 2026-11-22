import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const OpBilling = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/op-billing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="💰"
      title="OP Billing"
      subtitle="Search patient to generate outpatient bills"
      buttonText="💳 OP Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default OpBilling;
