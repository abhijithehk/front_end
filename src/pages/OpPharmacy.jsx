import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const OpPharmacy = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/op-pharmacy/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="💊"
      title="OP Pharmacy"
      subtitle="Search for an Out-Patient to view prescriptions and dispense medicines"
      buttonText="💊 Dispense →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default OpPharmacy;
