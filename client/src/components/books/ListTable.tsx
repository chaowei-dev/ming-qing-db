import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import CustomPagination from '../CustomPagination';

interface ListTableProps<T> {
  fetchList: (pageSize: number, pageNum: number, keyword?: string) => Promise<T[]>;
  countItems: (keyword?: string) => Promise<number>;
  headers: string[];
  renderRow: (item: T, index: number) => JSX.Element;
}

const ListTable: React.FC<ListTableProps<any>> = ({
  fetchList,
  countItems,
  headers,
  renderRow,
}) => {
  const params = useParams<{ pageSize?: string; pageNum?: string; keyword?: string }>();

  const [list, setList] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const pageSize = parseInt(params.pageSize ?? '10');
  const pageNum = parseInt(params.pageNum ?? '1');
  const keyword = params.keyword;

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetchList(pageSize, pageNum, keyword);
      setList(response);
    };
    fetchItems();
  }, [pageSize, pageNum, keyword, fetchList]);

  useEffect(() => {
    const fetchTotalPages = async () => {
      const total = await countItems(keyword);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / pageSize));
    };
    fetchTotalPages();
  }, [pageSize, pageNum, keyword, countItems]);

  const paginationComponent = (
    <CustomPagination totalPages={totalPages} pageNum={pageNum} pageSize={pageSize} keyword={keyword} />
  );

  let serialNum = (pageNum - 1) * pageSize + 1;

  return (
    <Container>
      <Row className="mt-4">
        <Col>Search</Col>
        <Col className="d-flex justify-content-end">
          {paginationComponent}
          <p className="ml-3 mt-2">{totalItems} entries</p>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>{headers.map(header => <th key={header}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((item, index) => renderRow(item, serialNum + index))}
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

export default ListTable;