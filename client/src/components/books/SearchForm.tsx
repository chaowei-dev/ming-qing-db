import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface FormProps {
  bookTitle: string;
  rollName: string;
  entryName: string;
  authorName: string;
}

interface SearchFormProps {
  pageSize: number;
  keyword: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ pageSize, keyword }) => {
  const [keywordForm, setKeywordForm] = useState<FormProps>({
    bookTitle: '',
    rollName: '',
    entryName: '',
    authorName: '',
  });

  const navigate = useNavigate();

  // Handle init value
  const handleInitValue = () => {
    if (keyword) {
      const searchParams = new URLSearchParams(keyword);
      setKeywordForm({
        bookTitle: searchParams.get('bookTitle') ?? '',
        rollName: searchParams.get('rollName') ?? '',
        entryName: searchParams.get('entryName') ?? '',
        authorName: searchParams.get('authorName') ?? '',
      });
    }
  };

  useEffect(() => {
    handleInitValue();
  }, [keyword]);

  // Handle search
  const handleSearch = () => {
    // Combine all the search parameters and send them to the server
    const searchQuery = `bookTitle=${keywordForm.bookTitle}&rollName=${keywordForm.rollName}&entryName=${keywordForm.entryName}&authorName=${keywordForm.authorName}`;

    // Redirect to the search page
    const url = `/entry/list/${pageSize}/1/${searchQuery}`;
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
            <InputGroup.Text>作者</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.authorName}
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, authorName: e.target.value })
              }
            />
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>卷名</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.rollName}
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, rollName: e.target.value })
              }
            />
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>篇目</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.entryName}
              onKeyDown={handleKeyDown}
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
