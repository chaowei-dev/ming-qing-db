import axios from './axiosConfig';

export const fetchCategories = async () => {
  try {
    const response = await axios.get('/categories', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch categories failed:', error);
    throw error;
  }
};