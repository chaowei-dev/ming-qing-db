import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetailsById } from '../../services/bookService';
import { Container, Table } from 'react-bootstrap';

interface BookDetail {
  title: string;
  book_id: number;
  entry_id: number;
  entry_name: string;
  roll_id: number;
  roll: string;
  roll_name: string;
}

const BookDetail = () => {
  const params = useParams<{
    id?: string;
  }>();

  const bookId = params.id;

  const [bookDetailList, setBookDetailList] = useState<BookDetail[]>([]);

  // Get book detail (roll, roll_name, entry) by book id from server
  const getBookDetail = async () => {
    const response = await getBookDetailsById(bookId!);
    console.log(response);

    setBookDetailList(response);
  }

  useEffect(() => {
    getBookDetail();
  }
  , [bookId]);

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Entry ID</th>
            <th>Entry Name</th>
            <th>Roll ID</th>
            <th>Roll</th>
            <th>Roll Name</th>
          </tr>
        </thead>
        <tbody>
          {bookDetailList.map((bookDetail, index) => (
            <tr key={index}>
              <td>{bookDetail.book_id}</td>
              <td>{bookDetail.entry_id}</td>
              <td>{bookDetail.entry_name}</td>
              <td>{bookDetail.roll_id}</td>
              <td>{bookDetail.roll}</td>
              <td>{bookDetail.roll_name}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default BookDetail;
