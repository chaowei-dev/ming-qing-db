import React from 'react';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        Welcome to the Admin Dashboard. Here, you can manage users, view system
        statistics, etc.
      </p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
