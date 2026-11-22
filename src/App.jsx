import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AppointmentBooking from './pages/AppointmentBooking'
import Footer from './components/Footer'
import BreadcrumbNav from './components/BreadcrumbNav'
import PatientRegistration from './pages/PatientRegistration'
import DoctorVisit from './pages/DoctorVisit'
import OpBilling from './pages/OpBilling'
import BillingDetail from './pages/BillingDetail'
import IpBilling from './pages/IpBilling'
import LabBilling from './pages/LabBilling'
import PharmacyBilling from './pages/PharmacyBilling'
import OtherBilling from './pages/OtherBilling'
import CreateBill from './pages/CreateBill'
import PreCheck from './pages/PreCheck'
import PreCheckDetail from './pages/PreCheckDetail'
import OpPharmacy from './pages/OpPharmacy'
import IpPharmacy from './pages/IpPharmacy'
import ManualDispensing from './pages/ManualDispensing'
import PharmacyDispense from './pages/PharmacyDispense'
import OpPharmacyDispense from './pages/OpPharmacyDispense'
import OpDepartmentQueue from './pages/OpDepartmentQueue'
import DoctorConsultation from './pages/DoctorConsultation'
import InPatient from './pages/InPatient'
import CaseSheet from './pages/CaseSheet'
import MasterSettings from './pages/MasterSettings'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <BrowserRouter>
      <div className="app-layout-container">
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        
        {/* Main Content Area */}
        <div className="app-main-content-wrapper">
          <Header />
          <BreadcrumbNav />
          <main className="app-scrollable-main">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Dashboard — Coming Soon</h2>} />
              <Route path="/visit" element={<DoctorVisit />} />
              <Route path="/edit-visit" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📝 Edit Visit — Coming Soon</h2>} />
              <Route path="/consultation/:patientId" element={<DoctorConsultation />} />
              <Route path="/booking" element={<AppointmentBooking />} />
              <Route path="/patients" element={<PatientRegistration />} />
              <Route path="/opd/general" element={<OpDepartmentQueue />} />
              <Route path="/opd/ortho" element={<OpDepartmentQueue />} />
              <Route path="/opd/pediatric" element={<OpDepartmentQueue />} />
              <Route path="/opd/dental" element={<OpDepartmentQueue />} />
              <Route path="/opd/ent" element={<OpDepartmentQueue />} />
              <Route path="/opd/gastro" element={<OpDepartmentQueue />} />
              <Route path="/create-bill" element={<CreateBill />} />
              <Route path="/create-bill/:patientId" element={<BillingDetail />} />
              <Route path="/op-billing" element={<OpBilling />} />
              <Route path="/op-billing/:patientId" element={<BillingDetail />} />
              <Route path="/ip-billing" element={<IpBilling />} />
              <Route path="/ip-billing/:patientId" element={<BillingDetail />} />
              <Route path="/lab-billing" element={<LabBilling />} />
              <Route path="/lab-billing/:patientId" element={<BillingDetail />} />
              <Route path="/pharmacy-billing" element={<PharmacyBilling />} />
              <Route path="/pharmacy-billing/:patientId" element={<BillingDetail />} />
              <Route path="/other-billing" element={<OtherBilling />} />
              <Route path="/other-billing/:patientId" element={<BillingDetail />} />
              <Route path="/op-pharmacy" element={<OpPharmacy />} />
              <Route path="/op-pharmacy/:patientId" element={<OpPharmacyDispense />} />
              <Route path="/ip-pharmacy" element={<IpPharmacy />} />
              <Route path="/ip-pharmacy/:patientId" element={<OpPharmacyDispense />} />
              <Route path="/manual-dispensing" element={<ManualDispensing />} />
              <Route path="/manual-dispensing/:patientId" element={<PharmacyDispense />} />
              <Route path="/store" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📦 Store — Coming Soon</h2>} />
              <Route path="/ipd" element={<InPatient />} />
              <Route path="/ipd/case-sheet/:patientId" element={<CaseSheet />} />
              <Route path="/reports" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📈 Reports — Coming Soon</h2>} />
              <Route path="/settings" element={<MasterSettings />} />
              <Route path="/master" element={<MasterSettings />} />
              <Route path="/nursing" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>🩺 Nursing — Coming Soon</h2>} />
              <Route path="/pre-check" element={<PreCheck />} />
              <Route path="/pre-check/:patientId" element={<PreCheckDetail />} />
              <Route path="/post-check" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>🩺 Post-Check — Coming Soon</h2>} />
              <Route path="/op-nursing" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>🩺 OP Nursing — Coming Soon</h2>} />
              <Route path="/ip-nursing" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>🩺 IP Nursing — Coming Soon</h2>} />
              <Route path="/dashboard-reception" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Reception Dashboard — Coming Soon</h2>} />
              <Route path="/dashboard-doctor" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Doctor Dashboard — Coming Soon</h2>} />
              <Route path="/dashboard-nurse" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Nurse Dashboard — Coming Soon</h2>} />
              <Route path="/dashboard-patient" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Patient Dashboard — Coming Soon</h2>} />
              <Route path="/dashboard-admin" element={<h2 style={{ padding: '2rem', color: '#334e68' }}>📊 Admin Dashboard — Coming Soon</h2>} />
            </Routes>
            <Footer />
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
