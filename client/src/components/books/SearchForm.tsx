import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface FormProps {
  bookTitle: string;
  roll: string;
  rollName: string;
  entryName: string;
}

interface SearchFormProps {
  pageSize: number;
  keyword: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ pageSize, keyword }) => {
  const [keywordForm, setKeywordForm] = useState<FormProps>({
    bookTitle: '',
    roll: '',
    rollName: '',
    entryName: '',
  });

  const navigate = useNavigate();

  // Handle init value
  const handleInitValue = () => {
    if (keyword) {
      const searchParams = new URLSearchParams(keyword);
      setKeywordForm({
        bookTitle: searchParams.get('bookTitle') ?? '',
        roll: searchParams.get('roll') ?? '',
        rollName: searchParams.get('rollName') ?? '',
        entryName: searchParams.get('entryName') ?? '',
      });
    }
  };

  useEffect(() => {
    handleInitValue();
  }, [keyword]);

  // Handle search
  const handleSearch = () => {
    // Combine all the search parameters and send them to the server
    const searchQuery = `bookTitle=${keywordForm.bookTitle}&roll=${keywordForm.roll}&rollName=${keywordForm.rollName}&entryName=${keywordForm.entryName}`;

    // Redirect to the search page
    const url = `/entry/list/${pageSize}/1/${searchQuery}`;
    navigate(url);
  };

  return (
    <Form>
      <Row>
        <Col>
          <InputGroup size="sm">
            <InputGroup.Text>書目</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.bookTitle}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, bookTitle: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup size="sm">
            <InputGroup.Text>卷次</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.roll}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, roll: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup size="sm">
            <InputGroup.Text>卷名</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.rollName}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, rollName: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup size="sm">
            <InputGroup.Text>篇名</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.entryName}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, entryName: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchForm;
