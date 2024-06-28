import axios from './axiosConfig';

// api: http://localhost:3030/entries/list/:size/:page/:keyword
export const fetchEntryList = async (
  size: number,
  page: number,
  keyword: string
) => {
  try {
    const response = await axios.get(`/entries/list/${size}/${page}/${keyword}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch entries failed:', error);
    throw error;
  }
};

export const countEntries = async (keyword: string) => {
  try {
    const response = await axios.get(`/entries/count/${keyword}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Count entries failed:', error);
    throw error;
  }
}