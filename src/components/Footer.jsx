import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '1rem 0',
      marginTop: 'auto', // Pushes the footer to the bottom of its flex container
      textAlign: 'center',
      color: '#64748b',
      fontSize: '0.9rem'
    }}>
      <Container fluid>
        <div>
          &copy; {currentYear} Hospital Management System Pro. All rights reserved.
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
          <a href="#privacy" style={{ color: '#0d6efd', textDecoration: 'none', marginRight: '1rem' }}>Privacy Policy</a>
          <a href="#terms" style={{ color: '#0d6efd', textDecoration: 'none', marginRight: '1rem' }}>Terms of Service</a>
          <a href="#support" style={{ color: '#0d6efd', textDecoration: 'none' }}>Support</a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
