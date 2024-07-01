import React from 'react';
import { Form, Pagination, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const handlePageChange = (newPage: number) => {
    // Reload the page with the new page number
    const url: string = `/${category}/list/${itemsPerPage}/${newPage}/${keyword}`;
    navigate(url);
  };

  return (
    <>
      <Pagination className="justify-content-center align-items-center mb-2">
        {' '}
        {/* Added mb-2 for spacing */}
        {/* Pre */}
        <Pagination.First
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
        />
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        />
        {/* Input */}
        <div className="d-flex align-items-center ms-1 me-1">
          <Form.Control
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
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
      <div className="d-flex align-items-center ms-1">
        <span>{itemCount}筆</span>
      </div>
    </>
  );
};

export default CustomPagination;
