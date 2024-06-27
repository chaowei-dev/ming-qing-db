import React from 'react';
import { Form, Pagination } from 'react-bootstrap';

interface CustomPaginationProps {
  totalPages: number;
  pageNum: number;
  pageSize: number;
  keyword?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPages,
  pageNum,
  pageSize,
  keyword,
}) => {
  const currentPage = Number(pageNum);
  const itemsPerPage = Number(pageSize);

  const handlePageChange = (newPage: number) => {
    // Reload the page with the new page number
    window.location.href = `/book/list/${itemsPerPage}/${newPage}/${keyword}`;
  };

  return (
    <Pagination className="justify-content-center align-items-center">
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
      <div className="d-flex align-items-center ml-1 mr-1">
        <Form.Control
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => handlePageChange(Number(e.target.value))}
          className="text-center"
          style={{ width: '60px' }}
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
  );
};

export default CustomPagination;
