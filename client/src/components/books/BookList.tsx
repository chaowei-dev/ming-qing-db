import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBookList } from '../../services/bookService';
import { Col, Container, Row, Table } from 'react-bootstrap';
import Pagination from '../Pagination';

interface Book {
  id: number;
  title: string;
  author: string;
  version: string;
  source: string;
  createBy: string;
  updateBy: string;
}

const BookList = () => {
  // Get params from URL
  const params = useParams<{
    pageSize?: string;
    pageNum?: string;
    keyword?: string;
  }>();

  // Use state
  const [bookList, setBookList] = useState<Book[]>([]);

  // Convert string parameters to numbers with default values
  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  const getBookList = async () => {
    const response = await fetchBookList(pageSize, pageNum, keyword!);
    setBookList(response);
  };

  // Fetch book list from server
  useEffect(() => {
    getBookList();
  }, [pageSize, pageNum, keyword]);

  return (
    <Container>
      <Row className="mt-4">
        <Col>Search</Col>
        <Col>
          <Pagination />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Version</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {bookList.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.version}</td>
                  <td>{book.source}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Pagination />
        </Col>
      </Row>
    </Container>
  );
};

export default BookList;
