import axios from './axiosConfig';

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post('/login', { email, password });
        // Assuming the token is in response.data
        const { token } = response.data;

        // Parse the token to get the role
        // Token is jwt
        const [, payload] = token.split('.');
        const decodedPayload = atob(payload);

        // Assuming the role is in the payload
        const { role } = JSON.parse(decodedPayload);

        localStorage
            .setItem('token', token);
        localStorage
            .setItem('role', role);

        return { token, role };
    } catch (error: any) {
        console.error('Login failed:', error.response.data);
        throw error.response.data;
    }
};

export const signup = async (email: string, password: string) => {
    try {
        const response = await axios.post('/register', { email, password });
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