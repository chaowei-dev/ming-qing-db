import React, { useEffect, useState } from 'react';
// import { Form } from 'react-bootstrap';

interface PageNumOptionProps {
  pageSize: number;
  pageNum: number;
  keyword: string;
  pageCategory: pageCategoryType;
}

type pageCategoryType = 'book' | 'entry';

const PageNumOption: React.FC<PageNumOptionProps> = ({
  pageSize,
  pageNum,
  keyword,
  pageCategory
}) => {
  const [pageCurrentSize, setPageCurrentSize] = useState<number>(0);

  useEffect(() => {
    setPageCurrentSize(pageSize);
  }, [pageSize]);

  // console.log(`PageSize: ${pageSize}`);

  const handlePageLimitChange = (newPage: string) => {
    const url = `/${pageCategory}/list/${parseInt(newPage)}/${pageNum}/${keyword}`;

    window.location.href = url;
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
        value={pageCurrentSize.toString()} // Convert number to string for the select value
        onChange={(e) => handlePageLimitChange(e.target.value)}
        style={{ width: '100px' }}
      >
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="300">300</option>
        <option value="500">500</option>
      </select>
    </>
  );
};

export default PageNumOption;
