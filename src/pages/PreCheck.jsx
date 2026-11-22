import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const PreCheck = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/pre-check/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🩺"
      title="Nursing Pre-Check"
      subtitle="Search patient to enter initial vitals and health indicators"
      buttonText="🩺 Take Vitals →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default PreCheck;
