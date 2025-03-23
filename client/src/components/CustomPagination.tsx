import React from 'react';
import { Form, Pagination, Row, Col } from 'react-bootstrap';

interface CustomPaginationProps {
  category: string;
  totalPages: number;
  pageNum: number;
  pageSize: number;
  keyword?: string;
  itemCount: number;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  category,
  totalPages,
  pageNum,
  pageSize,
  keyword,
  itemCount,
}) => {
  const currentPage = Number(pageNum);
  const itemsPerPage = Number(pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Reload the page with the new page number
    const url: string = `/${category}/list/${itemsPerPage}/${newPage}/${keyword}`;
    window.location.href = url;
  };

  return (
    <>
      <Row>
        <Col className="d-flex justify-content-end">
          <Pagination>
            {' '}
            {/* Added mb-2 for spacing */}
            {/* Pre */}
            <Pagination.First
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            />
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
            />
            {/* Input */}
            <div className="d-flex align-items-center ms-1 me-1">
              <Form.Control
                type="number"
                min="0"
                max={totalPages}
                value={totalPages === 0 ? 0 : currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="text-center"
                style={{ width: '100px' }}
              />
              <span className="mx-1">/ {totalPages}</span>
            </div>
            {/* Next */}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
            />
            <Pagination.Last
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            />
          </Pagination>
        </Col>
      </Row>
      <Row className="mt-2 ms-2">
        <Col className="d-flex justify-content-end">
          <span>{itemCount.toLocaleString()}筆</span>
        </Col>
      </Row>
    </>
  );
};

export default CustomPagination;
