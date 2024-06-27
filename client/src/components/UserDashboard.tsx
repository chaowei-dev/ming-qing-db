import React from "react";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Col, Container } from "react-bootstrap";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container>
      <Col>
        <h1>User Dashboard</h1>
        <p>
          Welcome to your dashboard. Here, you can view your profile, explore
          books, and more.
        </p>
        <button onClick={handleLogout}>Logout</button>
      </Col>
    </Container>
  );
};

export default UserDashboard;
