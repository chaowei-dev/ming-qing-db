import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countBooks, fetchBookList } from '../../services/bookService';
import { Col, Container, Row, Table, Spinner } from 'react-bootstrap';
import CustomPagination from '../CustomPagination';
import BookSearch from './BookSearch';
import PageNumOption from './PageNumOption';

interface Book {
  id: number;
  title: string;
  author: string;
  version: string;
  source: string;
  remarks?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  // const [showDetailModal, setShowDetailModal] = useState(false);
  // const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Convert string parameters to numbers with default values
  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  // Fetch book list from server
  const getBookList = async () => {
    setIsLoading(true);
    try {
      const response = await fetchBookList(pageSize, pageNum, keyword!);
      setBookList(response);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle total pages
  const handleTotalPages = async () => {
    setIsLoading(true);
    try {
      const response = await countBooks(keyword!);
      const booksCount = response;
      setTotalBooks(booksCount);
      setTotalPages(Math.ceil(booksCount / pageSize));
    } finally {
      setIsLoading(false);
    }
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
  const paginationComponent = !isLoading ? (
    <CustomPagination
      category="book"
      totalPages={totalPages}
      pageNum={pageNum}
      pageSize={pageSize}
      keyword={keyword}
      itemCount={totalBooks}
    />
  ) : null;

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
          {/* Loading spinner */}
          {isLoading && (
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">載入中...</span>
                </Spinner>
              </Col>
            </Row>
          )}
          {/* Table */}
          {!isLoading &&
            (bookList.length > 0 ? (
              <Table striped bordered hover style={{ tableLayout: 'fixed' }}>
                <thead>
                 <tr>
                     <th style={{ width: '5%' }}>編號</th>
                     <th style={{ width: '25%' }}>書名</th>
                     <th style={{ width: '15%' }}>作者</th>
                     <th style={{ width: '15%' }}>版本</th>
                     <th style={{ width: '10%' }}>來源</th>
                     <th style={{ width: '15%' }}>分類</th>
                     <th style={{ width: '10%' }}>備註</th>
                 </tr>
                </thead>
                <tbody>
                  {bookList.map((book) => (
                    <tr key={book.id}>
                      <td>{serialNum++}</td>
                      <td>
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
                      <td>
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
                      <td>{book.version}</td>
                      <td>{book.source}</td>
                      <td>{book.category?.name}</td>
                      <td>{book.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Row className="justify-content-center">
                <Col md={6}>
                  <div className="text-center">關鍵字未搜尋到</div>
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col></Col>
        <Col className="d-flex justify-content-center">
          {paginationComponent}
        </Col>
        <Col className="d-flex justify-content-end">
          {!isLoading && (
            <PageNumOption
              pageSize={pageSize}
              keyword={keyword!}
              pageCategory="book"
            />
          )}
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
