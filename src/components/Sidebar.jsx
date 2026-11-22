import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import keycloak, { logoutUser } from '../api/keycloak';
import './Sidebar.css';

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const isAuthenticated = !!keycloak.authenticated;
  const username = keycloak.tokenParsed?.preferred_username || (isAuthenticated ? "User" : "Guest");
  const initials = username.substring(0, 2).toUpperCase();
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const primaryRole = roles.includes('ADMIN') ? 'Administrator'
    : roles.includes('DOCTOR') ? 'Doctor'
    : roles.includes('RECEPTIONIST') ? 'Receptionist'
    : roles.includes('NURSE') ? 'Nurse'
    : (isAuthenticated ? 'Staff' : 'Guest Mode');
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState(['appointments']);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', subItems: [
        { id: 'dashboard-reception', label: 'Reception-Dashboard', path: '/dashboard-reception' },
        { id: 'dashboard-doctor', label: 'Doctor-Dashboard', path: '/dashboard-doctor' },
        { id: 'dashboard-nurse', label: 'Nurse-Dashboard', path: '/dashboard-nurse' },
        { id: 'dashboard-patient', label: 'Patient-Dashboard', path: '/dashboard-patient' },
        {id: 'dashboard-admin', label: 'Admin-Dashboard', path: '/dashboard-admin' },
      ]
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: '📅',
      subItems: [
        { id: 'visit', label: 'Visit', path: '/visit' },
        { id: 'edit-visit', label: 'Edit Visit', path: '/edit-visit' },
        { id: 'booking', label: 'Booking', path: '/booking' }
      ]
    },
    { id: 'patients', label: 'Patients', icon: '👥', path: '/patients' },
    { 
      id: 'nursing', 
      label: 'Nursing', 
      icon: '🩺',
      subItems: [
        { id: 'pre-check', label: 'Pre-Check', path: '/pre-check' },
        { id: 'post-check', label: 'Post-Check', path: '/post-check' },
        { id: 'op-nursing', label: 'OP Nursing', path: '/op-nursing' },
        { id: 'ip-nursing', label: 'IP Nursing', path: '/ip-nursing' }
      ]
    },
    { 
      id: 'opd', 
      label: 'OPD Clinics', 
      icon: '👨‍⚕️',
      subItems: [
        { id: 'general-op', label: 'General OP', path: '/opd/general' },
        { id: 'ortho-op', label: 'Ortho OP', path: '/opd/ortho' },
        { id: 'pediatric-op', label: 'Pediatric OP', path: '/opd/pediatric' },
        { id: 'dental-op', label: 'Dental OP', path: '/opd/dental' },
        { id: 'ent-op', label: 'ENT OP', path: '/opd/ent' },
        { id: 'gastro-op', label: 'Gastro OP', path: '/opd/gastro' },
      ]
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: '💰',
      subItems: [
        { id: 'create-bill', label: 'Create Bill', path: '/create-bill' },
        { id: 'op-billing', label: 'OP Billing', path: '/op-billing' },
        { id: 'ip-billing', label: 'IP Billing', path: '/ip-billing' },
        { id: 'lab-billing', label: 'Lab Billing', path: '/lab-billing' },
        { id: 'pharmacy-billing', label: 'Pharmacy Billing', path: '/pharmacy-billing' },
        { id: 'other-billing', label: 'Other Billing', path: '/other-billing' }
      ]
    },
    { 
      id: 'pharmacy', 
      label: 'Pharmacy', 
      icon: '💊',
      subItems: [
        { id: 'op-pharmacy', label: 'OP Pharmacy', path: '/op-pharmacy' },
        { id: 'ip-pharmacy', label: 'IP Pharmacy', path: '/ip-pharmacy' },
        { id: 'manual-dispense', label: 'Manual Dispensing', path: '/manual-dispensing' }
      ]
    },
    { id: 'store', label: 'Store', icon: '📦', path: '/store' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
    { id: 'ipd', label: 'InPatient', icon: '🛌', path: '/ipd' },
    { 
      id: 'settings', 
      label: 'Master Settings', 
      icon: '⚙️',
      subItems: [
        { id: 'master-wards', label: 'Wards & Beds', path: '/settings?tab=wards' },
        { id: 'master-hospital', label: 'Hospital & Services', path: '/settings?tab=hospital' },
        { id: 'master-depts', label: 'Departments', path: '/settings?tab=depts' },
        { id: 'master-users', label: 'User Management', path: '/settings?tab=users' },
        { id: 'master-roles', label: 'Roles & Screens', path: '/settings?tab=roles' },
        { id: 'master-billing', label: 'Billing Charges', path: '/settings?tab=billing' },
      ]
    },
  ];

  // Determine active menu from current URL path and query
  const currentPath = location.pathname;
  const currentPathWithSearch = location.pathname + location.search;

  const isActive = (item) => {
    if (item.path) {
      if (item.path.includes('?')) return currentPathWithSearch === item.path;
      return currentPath === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(sub => {
        if (sub.path.includes('?')) return currentPathWithSearch === sub.path;
        return currentPath === sub.path;
      });
    }
    return false;
  };

  const handleMenuClick = (item) => {
    if (item.subItems) {
      if (!isExpanded) {
        setIsExpanded(true);
      }
      setOpenMenus(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id) 
          : [...prev, item.id]
      );
    } else {
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (sub) => {
    navigate(sub.path);
  };

  return (
    <div className={`sidebar-container ${isExpanded ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isExpanded && (
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🏥</span>
            <span>HMS Pro</span>
          </div>
        )}
        <div className="toggle-btn-wrapper">
          <button className="toggle-btn" onClick={handleToggle} title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}>
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.subItems;
          const isOpen = openMenus.includes(item.id);
          const active = isActive(item);

          return (
            <div key={item.id} className="menu-group">
              <div
                className={`menu-item ${active && !hasSubmenu ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
                title={!isExpanded ? item.label : ""}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </div>
                {hasSubmenu && isExpanded && (
                  <span className={`submenu-chevron ${isOpen ? 'open' : ''}`}>▼</span>
                )}
              </div>

              {hasSubmenu && isOpen && isExpanded && (
                <div className="submenu-list">
                  {item.subItems.map(sub => {
                    const isSubActive = sub.path.includes('?')
                      ? currentPathWithSearch === sub.path
                      : currentPath === sub.path;
                    return (
                      <div
                        key={sub.id}
                        className={`submenu-item ${isSubActive ? 'active' : ''}`}
                        onClick={() => handleSubMenuClick(sub)}
                      >
                        <span className="submenu-icon">•</span>
                        <span className="submenu-label">{sub.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{initials}</div>
          {isExpanded && (
            <div className="user-info d-flex justify-content-between align-items-center w-100">
              <div>
                <span className="user-name">{username}</span>
                <span className="user-role">{primaryRole}</span>
              </div>
              {isAuthenticated && (
                <button
                  className="btn btn-sm btn-link text-danger p-0 ms-2"
                  onClick={logoutUser}
                  title="Logout"
                  style={{ textDecoration: 'none', fontSize: '1.1rem' }}
                >
                  🚪
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
