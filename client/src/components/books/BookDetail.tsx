import React, { useEffect, useState } from 'react';
import { Col, Container, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getBookDetailsById } from '../../services/bookService';

interface EntryOfBook {
  title: string;
  book_id: number;
  entry_id: number;
  entry_name: string;
  roll_id: number;
  roll: string;
  roll_name: string;
}

interface RouteParams {
  id: string; // Ensure this matches the dynamic part of your route definition
}

// FIXME: The page will flash then be blank when loading the book details
const BookDetail: React.FC = () => {
  // Get params with type safety
  const { id } = useParams<RouteParams>();
  const book_id = id || '';

  // State for entries and loading status
  const [entryOfBookList, setEntryOfBookList] = useState<EntryOfBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEntryByBookId = async (bookId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBookDetailsById(bookId);
      setEntryOfBookList(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to fetch book details');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (book_id) {
      getEntryByBookId(book_id);
    }
  }, [book_id]);

  return (
    <Container>
      <Col>
        <h2>書籍詳細</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>書名</th>
                <th>分類</th>
                <th>角色</th>
              </tr>
            </thead>
            <tbody>
              {entryOfBookList.map((entry) => (
                <tr key={entry.entry_id}>
                  <td>{entry.entry_name}</td>
                  <td>{entry.roll}</td>
                  <td>{entry.roll_name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Container>
  );
};

export default BookDetail;
