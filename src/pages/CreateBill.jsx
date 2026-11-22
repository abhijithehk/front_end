import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSearchScreen from '../components/PatientSearchScreen';

const CreateBill = () => {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    navigate(`/create-bill/${patient.id}`, { state: { patient } });
  };

  return (
    <PatientSearchScreen
      icon="🧾"
      title="Create Bill"
      subtitle="Search patient to initiate new bill"
      buttonText="💳 Create Bill →"
      onSelectPatient={handleSelectPatient}
    />
  );
};

export default CreateBill;
