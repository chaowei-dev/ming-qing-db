import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AdminDashboard from './components/auth/AdminDashboard';
import UserDashboard from './components/auth/UserDashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import HeaderMenu from './components/HeaderMenu';
import BookList from './components/books/BookList';
import BookEdit from './components/books/BookEdit';
import BookAdd from './components/books/BookAdd';
import EntryList from './components/books/EntryList';
import BookDetail from './components/books/BookDetail';

function App() {
  return (
    <>
      <div>
        <HeaderMenu />
      </div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/book/list/:pageSize/:pageNum/:keyword?"
            element={
              <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
                <BookList />
              </PrivateRoute>
            }
          />
          <Route
            path="/book/detail/:id"
            element={
              <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
                <BookDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/entry/list/:pageSize/:pageNum/:keyword?"
            element={
              <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
                <EntryList />
              </PrivateRoute>
            }
          />

          <Route
            path="/book/add"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <BookAdd />
              </PrivateRoute>
            }
          />
          <Route
            path="/book/edit/:id"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <BookEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user"
            element={
              <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
