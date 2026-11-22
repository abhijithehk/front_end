import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const OtherBilling = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/other-billing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="📝"
      title="Other Billing"
      subtitle="Search patient for miscellaneous billing"
      buttonText="💳 Other Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default OtherBilling;
