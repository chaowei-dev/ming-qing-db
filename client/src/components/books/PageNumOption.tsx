import React, { useEffect, useState } from 'react';
// import { Form } from 'react-bootstrap';
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
  const [pageCurrentSize, setPageCurrentSize] = useState<number>(0);

  useEffect(() => {
    setPageCurrentSize(pageSize);
  }, [pageSize]);

  console.log(`PageSize: ${pageSize}`);

  const handlePageLimitChange = (newPage: string) => {
    const url = `/entry/list/${parseInt(newPage)}/${pageNum}/${keyword}`;
    navigate(url);
  };

  return (
    <>
      {/* Dropdown for page limit */}
      {/* <Form.Control
        size="sm"
        as="select"
        value={pageSize.toString()} // Convert number to string for the select value
        onChange={(e) => handlePageLimitChange(e.target.value)}
        style={{ width: '100px' }}
      >
        <option value="2">2</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </Form.Control> */}
      <select
        value={pageCurrentSize}
        onChange={(e) => handlePageLimitChange(e.target.value)}
        style={{ width: '100px' }}
      >
        <option value="2">2</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="100">300</option>
        <option value="100">500</option>
      </select>
    </>
  );
};

export default PageNumOption;
