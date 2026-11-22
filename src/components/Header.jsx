import React, { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  Nav,
  NavDropdown,
  Button
} from "react-bootstrap";
import keycloak, { logoutUser, loginUser } from "../api/keycloak";
import "./Header.css";

const Header = () => {
  const isAuthenticated = !!keycloak.authenticated;
  const username = keycloak.tokenParsed?.preferred_username || (isAuthenticated ? "User" : "Guest User");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    await logoutUser();
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    await loginUser();
  };

  return (
    <Navbar className="bg-white shadow-sm custom-sticky-header">
      <Container fluid className="position-relative">
        {/* Branding */}
        <Navbar.Brand href="#" className="fw-bold text-primary fs-4 position-absolute start-50 translate-middle-x m-0 z-1">
          Hospital Services
        </Navbar.Brand>

        {/* Live Clock Header */}
        <div className="ms-auto d-none d-md-flex flex-column align-items-end me-4 text-end position-relative z-2" style={{ color: '#475569', letterSpacing: '0.02em' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
             📅 {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
             🕒 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* User Dropdown / Login Button */}
        <Nav className="d-flex align-items-center">
          {isAuthenticated ? (
            <NavDropdown
              title={
                <span>
                  <span className="badge bg-success me-1" style={{ fontSize: '0.65rem' }}>●</span>
                  👤 {username}
                </span>
              }
              id="user-dropdown"
              align="end"
              className="custom-user-dropdown"
            >
              <div className="p-2 text-center border-bottom bg-light">
                <strong>{username}</strong>
                {keycloak.tokenParsed?.email && (
                  <div className="text-muted small">{keycloak.tokenParsed.email}</div>
                )}
              </div>
              <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
              <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                as="button"
                onClick={handleLogout}
                className="text-danger fw-bold"
              >
                Logout 🚪
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleLogin}
              className="d-flex align-items-center gap-1"
            >
              🔑 Login with Keycloak
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
