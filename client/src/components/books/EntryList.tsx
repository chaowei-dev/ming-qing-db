import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countEntries, fetchEntryList } from '../../services/entryService';
import CustomPagination from '../CustomPagination';
import { Container, Row, Col, Table, Button, Spinner } from 'react-bootstrap';
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
  const params = useParams<{
    pageSize?: string;
    pageNum?: string;
    keyword?: string;
  }>();

  const [entryList, setEntryList] = useState<Entry[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  const getEntryList = async () => {
    setIsLoading(true);
    const response = await fetchEntryList(pageSize, pageNum, keyword!);
    setEntryList(response);
    setIsLoading(false);
  };

  const handleTotalPages = async () => {
    const response = await countEntries(keyword!);
    const entriesCount = response;
    setTotalEntries(entriesCount);
    setTotalPages(Math.ceil(entriesCount / pageSize));
  };

  useEffect(() => {
    getEntryList();
    handleTotalPages();
  }, [pageSize, pageNum, keyword]);

  const handleBookDetails = (bookId: number) => {
    window.location.href = `/book/detail/${bookId}`;
  };

  const paginationComponent = (
    <CustomPagination
      category="entry"
      totalPages={totalPages}
      pageNum={pageNum}
      pageSize={pageSize}
      keyword={keyword}
      itemCount={totalEntries}
    />
  );

  let serialNum = (pageNum - 1) * pageSize + 1;

  return (
    <Container>
      <Row className="mt-4">
        <Col className="text-center">
          <h2>
            <b>篇目列表</b>
          </h2>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <SearchForm pageSize={pageSize} keyword={keyword!} />
        </Col>
        <Col>{paginationComponent}</Col>
      </Row>
      <Row className="mt-4">
        <Col>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>編號</th>
                  <th>篇目</th>
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
          )}
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
