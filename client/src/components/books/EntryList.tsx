import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { countEntries, fetchEntryList } from '../../services/entryService';
import CustomPagination from '../CustomPagination';
import { Container, Row, Col, Table, Spinner } from 'react-bootstrap';
import EntrySearch from './EntrySearch';
import PageNumOption from './PageNumOption';

interface Entry {
  id: number;
  entry_name: string;
  roll: string;
  roll_name: string;
  rollId: number;
  title: string;
  author: string;
  bookId: number;
  remarks?: string;
  category?: {
    id: number;
    name: string;
  };
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
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  const getEntryList = async () => {
    setIsLoading(true);
    try {
      const response = await fetchEntryList(pageSize, pageNum, keyword!);
      setEntryList(response);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotalPages = async () => {
    setIsLoading(true);
    try {
      const response = await countEntries(keyword!);
      const entriesCount = response;
      setTotalEntries(entriesCount);
      setTotalPages(Math.ceil(entriesCount / pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEntryList();
    handleTotalPages();
  }, [pageSize, pageNum, keyword]);

  const handleBookDetails = (bookId: number) => {
    window.location.href = `/book/detail/${bookId}`;
  };

  const handleAuthorSearch = (author: string) => {
    // Get the name of the author
    // e.g., 王禕(1322-1373) -> 王禕
    const authorName = author.split('(')[0];

    // URL
    const searchQuery = `bookAuthor=${authorName}`;
    const url = `/book/list/${pageSize}/1/${searchQuery}`;

    // Redirect to the search page
    window.location.href = url;
  };

  const paginationComponent = !isLoading ? (
    <CustomPagination
      category="entry"
      totalPages={totalPages}
      pageNum={pageNum}
      pageSize={pageSize}
      keyword={keyword}
      itemCount={totalEntries}
    />
  ) : null;

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
          <EntrySearch pageSize={pageSize} keyword={keyword!} />
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
            (entryList.length > 0 ? (
              <Table striped bordered hover style={{ tableLayout: 'fixed' }}>
                <thead>
                 <tr>
                     <th style={{ width: '5%' }}>編號</th>
                     <th style={{ width: '15%' }}>篇目</th>
                     <th style={{ width: '15%' }}>書目</th>
                     <th style={{ width: '12%' }}>作者</th>
                     <th style={{ width: '8%' }}>卷次</th>
                     <th style={{ width: '12%' }}>卷名</th>
                     <th style={{ width: '13%' }}>分類</th>
                     <th style={{ width: '10%' }}>備註</th>
                 </tr>
                </thead>
                <tbody>
                  {entryList.map((entry, index) => (
                    <tr key={entry.id}>
                      <td>{serialNum + index}</td>
                      <td>{entry.entry_name}</td>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleBookDetails(entry.bookId);
                          }}
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {entry.title}
                        </a>
                      </td>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAuthorSearch(entry.author);
                          }}
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {entry.author}
                        </a>
                      </td>
                      <td>{entry.roll}</td>
                      <td>{entry.roll_name}</td>
                      <td>
                        {entry.category?.name || '無分類'}
                      </td>
                      <td>{entry.remarks || '-'}</td>
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
      <Row>
        <Col></Col>
        <Col className="d-flex justify-content-center">
          {paginationComponent}
        </Col>
        <Col className="d-flex justify-content-end">
          {!isLoading && (
            <PageNumOption
              pageSize={pageSize}
              keyword={keyword!}
              pageCategory="entry"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EntryList;
