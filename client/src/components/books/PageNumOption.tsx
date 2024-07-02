import React from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface PageNumOptionProps {
  pageSize: number;
  pageNum: number;
  keyword: string;
}

const PageNumOption: React.FC<PageNumOptionProps> = ({
  pageSize,
  pageNum,
  keyword,
}) => {
  const navigate = useNavigate();

  const handlePageLimitChange = (newPage: string) => {
    const url = `/entry/list/${newPage}/${pageNum}/${keyword}`;
    navigate(url);
  };

  return (
    <>
      {/* FIXME: init value to get correct */}
      {/* Dropdown for page limit */}
      <Form.Control
        size="sm"
        as="select"
        value={pageSize}
        onChange={(e) => handlePageLimitChange(e.target.value)}
        style={{ width: '100px' }}
      >
        <option value="2">2</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </Form.Control>
    </>
  );
};

export default PageNumOption;
