import axios from './axiosConfig';

interface EntryWithBookAndRoll {
  title: string;
  author: string;
  source: string;
  version: string;
  roll: string;
  rollName: string;
  entry: string;
  remarks?: string;
  categoryId?: string;
}

// api: http://localhost:3001/entries/list/:size/:page/:keyword
export const fetchEntryList = async (
  size: number,
  page: number,
  keyword: string
) => {
  try {
    const response = await axios.get(
      `/entries/list/${size}/${page}/${keyword}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
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
};

export const addEntry = async (entry: EntryWithBookAndRoll) => {
  try {
    const response = await axios.post('/entries/add', entry, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Add entries failed:', error);
    throw error;
  }
};

export const importEntries = async (entries: EntryWithBookAndRoll[], categoryId: string) => {
  try {
    const response = await axios.post('/entries/import', {
      entries,
      categoryId
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Import entries failed:', error);
    throw error;
  }
};
