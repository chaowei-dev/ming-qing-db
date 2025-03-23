import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countBooks, fetchBookList } from '../../services/bookService';
import { Col, Container, Row, Table } from 'react-bootstrap';
import CustomPagination from '../CustomPagination';
import BookSearch from './BookSearch';
import PageNumOption from './PageNumOption';

interface Book {
  id: number;
  title: string;
  author: string;
  version: string;
  source: string;
  createBy: string;
  updateBy: string;
  category?: {
    name: string;
  };
}

const BookList = () => {
  // Get params from URL
  const params = useParams<{
    pageSize?: string;
    pageNum?: string;
    keyword?: string;
    categoryId?: string;
  }>();

  // Use state
  const [bookList, setBookList] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  // const [showDetailModal, setShowDetailModal] = useState(false);
  // const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Convert string parameters to numbers with default values
  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  // Fetch book list from server
  const getBookList = async () => {
    const response = await fetchBookList(
      pageSize,
      pageNum,
      keyword!,
    );
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

  // Use author name to search for books
  const handleAuthorSearch = (author: string) => {
    const authorName = author.split('(')[0];

    // URL
    const searchQuery = `bookAuthor=${authorName}`;
    const url = `/book/list/${pageSize}/1/${searchQuery}`;

    // Redirect to the search page
    window.location.href = url;
  };

  // Create Pagination component
  const paginationComponent = (
    <CustomPagination
      category="book"
      totalPages={totalPages}
      pageNum={pageNum}
      pageSize={pageSize}
      keyword={keyword}
      itemCount={totalBooks}
    />
  );

  const handleBookDetails = (book: Book) => {
    // Use book id to redirect to book detail page
    window.location.href = `/book/detail/${book.id}`;
  };

  // MODAL:
  // Show detail modal
  // const handleShowModal = (book: Book) => {
  //   setSelectedBook(book);
  //   setShowDetailModal(true);
  // };

  // Close detail modal
  // const handleCloseModal = () => setShowDetailModal(false);

  // Create serial number
  let serialNum = (pageNum - 1) * pageSize + 1;

  return (
    <Container>
      <Row className="mt-4">
        <Col className="text-center">
          <h2>
            <b>書目列表</b>
          </h2>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <BookSearch pageSize={pageSize} keyword={keyword!} />
        </Col>
        <Col>{paginationComponent}</Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table striped bordered hover style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>編號</th>
                <th style={{ width: '30%' }}>書名</th>
                <th style={{ width: '20%' }}>作者</th>
                <th style={{ width: '10%' }}>版本</th>
                <th style={{ width: '20%' }}>來源</th>
                <th style={{ width: '15%' }}>分類</th>
              </tr>
            </thead>
            <tbody>
              {bookList.map((book) => (
                <tr key={book.id}>
                  <td style={{ width: '5%' }}>{serialNum++}</td>
                  <td style={{ width: '30%' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBookDetails(book);
                      }}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {book.title}
                    </a>
                  </td>
                  <td style={{ width: '20%' }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAuthorSearch(book.author);
                      }}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {book.author}
                    </a>
                  </td>
                  <td style={{ width: '10%' }}>{book.version}</td>
                  <td style={{ width: '20%' }}>{book.source}</td>
                  <td style={{ width: '15%' }}>{book.category?.name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col></Col>
        <Col className="d-flex justify-content-center">
          {paginationComponent}
        </Col>
        <Col className="d-flex justify-content-end">
          <PageNumOption
            pageSize={pageSize}
            keyword={keyword!}
            pageCategory="book"
          />
        </Col>
      </Row>
      {/* {selectedBook && (
        <BookDetail
          showDetailModal={showDetailModal}
          selectedBook={selectedBook}
          handleCloseModal={handleCloseModal}
        />
      )} */}
    </Container>
  );
};

export default BookList;
