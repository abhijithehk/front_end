import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumb.css';

// Map of route paths to their display info
const routeMap = {
  '/dashboard': { label: 'Dashboard', parent: null },
  '/dashboard-reception': { label: 'Reception Dashboard', parent: { label: 'Dashboard' } },
  '/dashboard-doctor': { label: 'Doctor Dashboard', parent: { label: 'Dashboard' } },
  '/dashboard-nurse': { label: 'Nurse Dashboard', parent: { label: 'Dashboard' } },
  '/dashboard-patient': { label: 'Patient Dashboard', parent: { label: 'Dashboard' } },
  '/dashboard-admin': { label: 'Admin Dashboard', parent: { label: 'Dashboard' } },
  '/visit': { label: 'Visit', parent: { label: 'Appointments' } },
  '/edit-visit': { label: 'Edit Visit', parent: { label: 'Appointments' } },
  '/booking': { label: 'Booking', parent: { label: 'Appointments' } },
  '/patients': { label: 'Patient Registration', parent: null },
  '/pre-check': { label: 'Pre-Check', parent: { label: 'Nursing' } },
  '/post-check': { label: 'Post-Check', parent: { label: 'Nursing' } },
  '/op-nursing': { label: 'OP Nursing', parent: { label: 'Nursing' } },
  '/ip-nursing': { label: 'IP Nursing', parent: { label: 'Nursing' } },
  '/opd': { label: 'OPD', parent: null },
  '/create-bill': { label: 'Create Bill', parent: { label: 'Billing' } },
  '/op-billing': { label: 'OP Billing', parent: { label: 'Billing' } },
  '/ip-billing': { label: 'IP Billing', parent: { label: 'Billing' } },
  '/lab-billing': { label: 'Lab Billing', parent: { label: 'Billing' } },
  '/pharmacy-billing': { label: 'Pharmacy Billing', parent: { label: 'Billing' } },
  '/other-billing': { label: 'Other Billing', parent: { label: 'Billing' } },
  '/op-pharmacy': { label: 'OP Pharmacy', parent: { label: 'Pharmacy' } },
  '/ip-pharmacy': { label: 'IP Pharmacy', parent: { label: 'Pharmacy' } },
  '/store': { label: 'Store', parent: null },
  '/ipd': { label: 'InPatient', parent: null },
  '/reports': { label: 'Reports', parent: null },
  '/settings': { label: 'Settings', parent: null },
};

const BreadcrumbNav = () => {
  const location = useLocation();
  let currentRoute = routeMap[location.pathname];

  // Dynamic route handling
  const billingRoutes = ['/op-billing', '/ip-billing', '/lab-billing', '/pharmacy-billing', '/other-billing', '/create-bill'];
  if (!currentRoute && billingRoutes.some(route => location.pathname.startsWith(`${route}/`))) {
    const parentPath = billingRoutes.find(route => location.pathname.startsWith(`${route}/`));
    currentRoute = { label: 'Bill Detail', parent: { label: routeMap[parentPath].label, path: parentPath } };
  }

  if (!currentRoute && location.pathname.startsWith('/pre-check/')) {
    currentRoute = { label: 'Enter Vitals', parent: { label: 'Pre-Check', path: '/pre-check' } };
  }

  if (!currentRoute && location.pathname.startsWith('/op-pharmacy/')) {
    currentRoute = { label: 'Dispense Medicine', parent: { label: 'OP Pharmacy', path: '/op-pharmacy' } };
  }

  if (!currentRoute && location.pathname.startsWith('/ip-pharmacy/')) {
    currentRoute = { label: 'Dispense Medicine', parent: { label: 'IP Pharmacy', path: '/ip-pharmacy' } };
  }

  if (!currentRoute) return null;

  const crumbs = [];

  // Always start with Home
  crumbs.push({ label: 'Home', icon: '🏠', path: '/dashboard' });

  // If there's a parent (like Appointments for Visit)
  if (currentRoute.parent) {
    crumbs.push({
      label: currentRoute.parent.label,
      icon: currentRoute.parent.icon,
      path: currentRoute.parent.path || null // Clickable if path provided
    });
  }

  // Current page (no link)
  crumbs.push({
    label: currentRoute.label,
    icon: currentRoute.icon,
    path: null,
    isCurrent: true
  });

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-nav-list">
        {crumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-nav-item">
            {index > 0 && <span className="breadcrumb-separator">▸</span>}
            {crumb.isCurrent ? (
              <span className="breadcrumb-current">
                {crumb.label}
              </span>
            ) : crumb.path ? (
              <Link to={crumb.path}>
                {crumb.label}
              </Link>
            ) : (
              <span>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
