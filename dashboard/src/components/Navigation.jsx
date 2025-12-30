import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUnit } from '../context/UnitContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { units, selectedUnit, selectUnit } = useUnit();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/reports', label: 'Reports', icon: 'bi-graph-up' },
    { path: '/settings', label: 'Unit Settings', icon: 'bi-gear' },
    ...(user?.role === 'global_admin'
      ? [{ path: '/admin', label: 'Admin', icon: 'bi-shield-check' }]
      : []),
  ];

  return (
    <>
      <button className="mobile-menu-toggle d-lg-none" onClick={() => setIsOpen(!isOpen)}>
        <i className="bi-list"></i>
      </button>

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logos/logo-white.svg" alt="LDSChurch.Stream" className="logo" />
          <h5 className="mb-0 brand-name">
            LDSChurch<span className="stream-suffix">.Stream</span>
          </h5>
          <button className="sidebar-close d-lg-none" onClick={() => setIsOpen(false)}>
            <i className="bi-x"></i>
          </button>
        </div>

        <Nav className="flex-column sidebar-nav">
          {navItems.map(item => (
            <LinkContainer key={item.path} to={item.path}>
              <Nav.Link
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => setIsOpen(false)}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </Nav.Link>
            </LinkContainer>
          ))}
        </Nav>

        <div className="sidebar-footer">
          {units.length > 1 ? (
            <Dropdown className="mb-3">
              <Dropdown.Toggle variant="outline-light" size="sm" className="w-100">
                <i className="bi-building me-2"></i>
                {selectedUnit?.name || 'Select Unit'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                {units.map(unit => (
                  <Dropdown.Item
                    key={unit._id}
                    active={selectedUnit?._id === unit._id}
                    onClick={() => selectUnit(unit)}
                  >
                    {unit.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="text-light mb-3 small">
              <i className="bi-building me-2"></i>
              {selectedUnit?.name || 'No Unit'}
            </div>
          )}

          <div className="text-light mb-3 small">
            <i className="bi-person me-2"></i>
            {user?.email}
          </div>

          <Button variant="outline-light" size="sm" className="w-100" onClick={logout}>
            <i className="bi-box-arrow-right me-2"></i>
            Logout
          </Button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay d-lg-none" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Navigation;
