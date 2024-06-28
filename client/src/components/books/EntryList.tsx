import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countEntries, fetchEntryList } from '../../services/entryService';
import CustomPagination from '../CustomPagination';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import SearchForm from './SearchForm';
import PageNumOption from './PageNumOption';

interface Entry {
  id: number;
  entry_name: string;
  roll: string;
  roll_name: string;
  rollId: number;
  title: string;
  bookId: number;
  createdAt: string;
  updatedAt: string;
}

const EntryList = () => {
  // Get params from URL
  const params = useParams<{
    pageSize?: string;
    pageNum?: string;
    keyword?: string;
  }>();

  // Use state
  const [entryList, setEntryList] = useState<Entry[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalEntries, setTotalEntries] = useState<number>(0);

  // Convert string parameters to numbers with default values
  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  // Fetch entry list from server
  const getEntryList = async () => {
    const response = await fetchEntryList(pageSize, pageNum, keyword!);
    setEntryList(response);
  };

  // Handle total pages
  const handleTotalPages = async () => {
    const response = await countEntries(keyword!);
    const entriesCount = response;

    setTotalEntries(entriesCount);
    setTotalPages(Math.ceil(entriesCount / pageSize));
  };

  // Fetch entry list from server
  useEffect(() => {
    getEntryList();
  }, [pageSize, pageNum, keyword]);

  // Handle total pages
  useEffect(() => {
    handleTotalPages();
  }, [pageSize, pageNum, keyword]);

  const handleBookDetails = (bookId: number) => {
    // Use book id to redirect to book detail page
    window.location.href = `/book/detail/${bookId}`;
  };

  // Create Pagination
  const paginationComponent = (
    <CustomPagination
      category="entry"
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
        <Col>
          <SearchForm
            pageNum={pageNum}
            pageSize={pageSize}
            keyword={keyword!}
          />
        </Col>
        <Col className="d-flex justify-content-end">
          {paginationComponent}
          <p className="ms-4 mt-2">{totalEntries}筆</p>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>編號</th>
                <th>篇名</th>
                <th>書目</th>
                <th>卷次</th>
                <th>卷名</th>
              </tr>
            </thead>
            <tbody>
              {entryList.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{serialNum + index}</td>
                  <td>{entry.entry_name}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => handleBookDetails(entry.bookId)}
                    >
                      {entry.title}
                    </Button>
                  </td>
                  <td>{entry.roll}</td>
                  <td>{entry.roll_name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col></Col>
        <Col className="d-flex justify-content-center">
          {paginationComponent}
        </Col>
        <Col className="d-flex justify-content-end">
          <PageNumOption
            pageSize={pageSize}
            pageNum={pageNum}
            keyword={keyword!}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default EntryList;
