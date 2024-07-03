import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
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
import Home from './components/Home';
import EditUser from './components/auth/EditUser';
import ImportEntries from './components/books/ImportEntries';
import { isTokenExpired } from './services/authService';

function App() {
  return (
    <>
      <div>
        <HeaderMenu />
      </div>
      <Router>
        <Routes>
          {/* root route */}
          <Route
            path="*"
            element={
              isTokenExpired() ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* auth route */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* user route */}
          <Route
            path="/home"
            element={
              <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
                <Home />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/edituser"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <EditUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/importentries"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <ImportEntries />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
