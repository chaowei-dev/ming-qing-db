// src/components/HeaderMenu.tsx
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { logout } from '../services/authService';

const HeaderMenu: React.FC = () => {
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    logout();

    // Nav to login page
    window.location.href = '/login';
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">明清書目資料庫</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {userRole && <Nav.Link href="/book/list/30/1">書目列表</Nav.Link>}
            {userRole === 'ADMIN' && (
              <Nav.Link href="/book/add">新增書目</Nav.Link>
            )}
            {userRole && (
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav>
            {userRole ? (
              <Nav.Link onClick={handleLogout} className="ml-auto">
                Logout
              </Nav.Link>
            ) : (
              <Nav.Link href="/login" className="ml-auto">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderMenu;
