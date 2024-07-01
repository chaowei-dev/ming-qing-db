import axios from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    // Assuming the token is in response.data
    const { token } = response.data;

    // Parse the token to get the role
    // Token is jwt
    const [, payload] = token.split('.');
    const decodedPayload = atob(payload);

    // Assuming the role is in the payload
    const { role } = JSON.parse(decodedPayload);

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    return { token, role };
  } catch (error: any) {
    console.error('Login failed:', error.response.data);
    throw error.response.data;
  }
};

export const signup = async (email: string, password: string) => {
  try {
    const response = await axios.post('/auth/register', { email, password });
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

interface DecodedToken {
  exp: number;
  role: string;
}

// Check role of the user is allowed
export const checkRoleIsAllowed = (allowedRoles: string[]): boolean => {
  // Get token from local storage
  const token = localStorage.getItem('token');

  // Check token is existed or not
  if (!token) {
    return false;
  }

  // Decode the token
  try {
    const { role } = jwtDecode<DecodedToken>(token);

    // Check if the user's role is allowed to access this route
    const isAllowed: boolean = allowedRoles.includes(role);

    return isAllowed;
  } catch (error) {
    console.error('Error decoding token: ', error);
    return false;
  }
};

// Check expiration of the token
export const isTokenExpired = (): boolean => {
  // Get the token from local storage
  const token = localStorage.getItem('token');

  // Check token is existed or not
  if (!token) {
    return true;
  }

  // Check expiration time of the token
  try {
    // Decode the token
    const { exp } = jwtDecode<DecodedToken>(token);

    // Check if the token is expired
    // If now >= exp, the token is expired
    const isExpired: boolean = Date.now() >= exp * 1000;

    return isExpired;
  } catch (error) {
    console.error('Error decoding token: ', error);
    return true;
  }
};
