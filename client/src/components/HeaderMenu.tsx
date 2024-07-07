// src/components/HeaderMenu.tsx
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { logout } from '../services/authService';
import logoImage from '../assets/logo.svg';
import {
  checkRoleIsAllowed,
  isTokenExpired,
  getUserEmail,
} from '../services/authService';

const HeaderMenu: React.FC = () => {
  const isAdmin: boolean = !checkRoleIsAllowed(['admin']);
  const isLogin: boolean = !isTokenExpired();

  const userName: string = getUserEmail();

  const handleLogout = () => {
    logout();

    // Nav to login page
    window.location.href = '/login';
  };

  return (
    <Navbar
      expand="lg"
      className="bg-body-tertiary"
      bg="dark"
      data-bs-theme="dark"
    >
      <Container>
        <Navbar.Brand href="/home">
          <img
            alt=""
            src={logoImage}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          明清書目資料庫
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isLogin && (
              <>
                <Nav.Link href="/book/list/50/1">書目列表</Nav.Link>
                <Nav.Link href="/entry/list/50/1">篇目列表</Nav.Link>
                {/* {isAdmin && <Nav.Link href="/book/add">新增書目</Nav.Link>} */}
                {isAdmin && <Nav.Link href="/importentries">匯入篇目</Nav.Link>}
                {isAdmin && (
                  <NavDropdown title="進階設定" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/edituser">
                      編輯用戶(管理者)
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">
                      Something
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isLogin && (
              <Navbar.Text style={{ color: 'white' }} className="me-4">
                {userName}
              </Navbar.Text>
            )}
            {isLogin ? (
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
