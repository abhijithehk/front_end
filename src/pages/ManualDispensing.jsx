import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const ManualDispensing = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/manual-dispensing/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🛒"
      title="Manual Dispensing"
      subtitle="Search for a profile to manually dispense OTC/Cart medicines"
      buttonText="💊 Proceed →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default ManualDispensing;
