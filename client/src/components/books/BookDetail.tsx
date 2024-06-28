import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetailsById } from '../../services/bookService';
import { Container, Row, Table, Col } from 'react-bootstrap';

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
  const [pageTitle, setPageTitle] = useState<string>('');

  // Get book detail (roll, roll_name, entry) by book id from server
  const getBookDetail = async () => {
    const response = await getBookDetailsById(bookId!);
    console.log(response);

    setBookDetailList(response);
    setPageTitle(response[0].title);
  };

  useEffect(() => {
    getBookDetail();
  }, [bookId]);

  let serialNum: number = 1;

  return (
    <Container>
      <Row className="mt-3">
        <Col className="text-center">
          <h2>
            <b>{pageTitle}</b>
          </h2>
        </Col>
      </Row>
      <Row className="mt-3">
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>篇名</th>
              <th>卷次</th>
              <th>卷名</th>
            </tr>
          </thead>
          <tbody>
            {bookDetailList.map((bookDetail, index) => (
              <tr key={index}>
                <td>{serialNum++}</td>
                <td>{bookDetail.entry_name}</td>
                <td>{bookDetail.roll}</td>
                <td>{bookDetail.roll_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

export default BookDetail;
