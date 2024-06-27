import axios from './axiosConfig';

// api: /books/list/:size/:page/:keyword
export const fetchBookList = async (
  size: number,
  page: number,
  keyword: string
) => {
  try {
    const response = await axios.get(`/books/list/${size}/${page}/${keyword}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch books failed:', error);
    throw error;
  }
};

export const fetchBookById = async (id: string) => {
  try {
    const response = await axios.get(`/books/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch book failed:', error);
    throw error;
  }
};

export const addBook = async (book: any) => {
  try {
    const response = await axios.post('/books', book, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Add book failed:', error);
    throw error;
  }
};

export const updateBook = async (id: string, book: any) => {
  try {
    const response = await axios.put(`/books/${id}`, book, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Update book failed:', error);
    throw error;
  }
};

export const deleteBook = async (id: string) => {
  try {
    const response = await axios.delete(`/books/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Delete book failed:', error);
    throw error;
  }
};

export const countBooks = async (keyword: string) => {
  try {
    const response = await axios.get(`/books/count/${keyword}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Count books failed:', error);
    throw error;
  }
};
