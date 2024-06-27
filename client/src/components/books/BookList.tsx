import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countBooks, fetchBookList } from '../../services/bookService';
import { Col, Container, Row, Table } from 'react-bootstrap';
import CustomPagination from '../CustomPagination';

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
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  // Convert string parameters to numbers with default values
  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  // Fetch book list from server
  const getBookList = async () => {
    const response = await fetchBookList(pageSize, pageNum, keyword!);
    setBookList(response);
  };

  // Handle total pages
  const handleTotalPages = async () => {
    const response = await countBooks(keyword!);
    const booksCount = response;

    setTotalBooks(booksCount);
    setTotalPages(Math.ceil(booksCount / pageSize));
  };

  // Fetch book list from server
  useEffect(() => {
    getBookList();
  }, [pageSize, pageNum, keyword]);

  // Handle total pages
  useEffect(() => {
    handleTotalPages();
  }, [pageSize, pageNum, keyword]);

  // Create Pagination component
  const paginationComponent = (
    <CustomPagination
      totalPages={totalPages}
      pageNum={pageNum}
      pageSize={pageSize}
      keyword={keyword}
    />
  );

  // Create serial number
  let serialNum = (pageNum - 1) * pageSize + 1;

  return (
    <Container>
      <Row className="mt-4">
        <Col>Search</Col>
        <Col className="d-flex justify-content-end">
          {paginationComponent}
          <p className="ml-3 mt-2">{totalBooks}筆</p>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>編號</th>
                <th>書名</th>
                <th>作者</th>
                <th>版本</th>
                <th>來源</th>
              </tr>
            </thead>
            <tbody>
              {bookList.map((book) => (
                <tr key={book.id}>
                  <td>{serialNum++}</td>
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
        <Col>{paginationComponent}</Col>
      </Row>
    </Container>
  );
};

export default BookList;
