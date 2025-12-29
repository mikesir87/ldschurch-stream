import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useUnit } from '../context/UnitContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { units, selectedUnit, selectUnit } = useUnit();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="navbar">
      <Container>
        <Navbar.Brand className="navbar-brand">
          <img src="/logos/logo-white.svg" alt="LDSChurch.Stream" className="logo" />
          LDSChurch.Stream
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/reports">
              <Nav.Link>Reports</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/settings">
              <Nav.Link>Unit Settings</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            {units.length > 1 ? (
              <NavDropdown
                title={selectedUnit?.name || 'Select Unit'}
                id="unit-dropdown"
                className="me-3"
              >
                {units.map(unit => (
                  <NavDropdown.Item
                    key={unit._id}
                    active={selectedUnit?._id === unit._id}
                    onClick={() => selectUnit(unit)}
                  >
                    {unit.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            ) : (
              <Navbar.Text className="me-3">{selectedUnit?.name || 'No Unit'}</Navbar.Text>
            )}
            <Navbar.Text className="me-3">{user?.email}</Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={logout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
