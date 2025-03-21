import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryService';

interface Category {
  id: number;
  name: string;
}

interface FormProps {
  bookTitle: string;
  rollName: string;
  entryName: string;
  authorName: string;
  globalKeyword: string;
  categoryId: string;
}

interface SearchFormProps {
  pageSize: number;
  keyword: string;
}

const EntrySearch: React.FC<SearchFormProps> = ({ pageSize, keyword }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [keywordForm, setKeywordForm] = useState<FormProps>({
    bookTitle: '',
    rollName: '',
    entryName: '',
    authorName: '',
    globalKeyword: '',
    categoryId: '',
  });

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.sort((a: Category, b: Category) => a.id - b.id));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    getCategories();
  }, []);
  const [globalSearch, setGlobalSearch] = useState<boolean>(false);

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
        globalKeyword: searchParams.get('globalKeyword') ?? '',
        categoryId: searchParams.get('categoryId') ?? '',
      });
    }
  };

  useEffect(() => {
    handleInitValue();
  }, [keyword]);

  useEffect(() => {
    if (keywordForm.globalKeyword) {
      setGlobalSearch(true);
    }
  }, [keywordForm]);

  // Handle search
  const handleSearch = () => {
    // Combine all the search parameters and send them to the server
    const searchQuery = `globalKeyword=${keywordForm.globalKeyword}&bookTitle=${keywordForm.bookTitle}&rollName=${keywordForm.rollName}&entryName=${keywordForm.entryName}&authorName=${keywordForm.authorName}&categoryId=${keywordForm.categoryId}`;

    // Redirect to the search page
    const url = `/entry/list/${pageSize}/1/${searchQuery}`;
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearch(e.target.checked);

    // Clear the search form when switching to check or uncheck
    if (e.target.checked) {
      setKeywordForm({
        bookTitle: '',
        rollName: '',
        entryName: '',
        authorName: '',
        globalKeyword: '',
        categoryId: '',
      });
    }
  };

  return (
    <Form>
      <Row>
        <Col>
          {/* Input */}
          <InputGroup size="sm">
            <InputGroup.Text>分類</InputGroup.Text>
            <Form.Select
              value={keywordForm.categoryId}
              disabled={globalSearch}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, categoryId: e.target.value })
              }
            >
              <option value="">全部</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>全域</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.globalKeyword}
              onKeyDown={handleKeyDown}
              disabled={!globalSearch}
              onChange={(e) =>
                setKeywordForm({
                  ...keywordForm,
                  globalKeyword: e.target.value,
                })
              }
            />
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>書目</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.bookTitle}
              onKeyDown={handleKeyDown}
              disabled={globalSearch}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, bookTitle: e.target.value })
              }
            />
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>作者</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.authorName}
              onKeyDown={handleKeyDown}
              disabled={globalSearch}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, authorName: e.target.value })
              }
            />

            <InputGroup.Text>卷名</InputGroup.Text>
            <Form.Control
              type="text"
              value={keywordForm.rollName}
              onKeyDown={handleKeyDown}
              disabled={globalSearch}
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
              disabled={globalSearch}
              onChange={(e) =>
                setKeywordForm({ ...keywordForm, entryName: e.target.value })
              }
            />
          </InputGroup>
          {/* Switch */}
          <Form.Check
            type="switch"
            id="custom-switch"
            label="全域搜尋"
            checked={globalSearch}
            onChange={handleSwitch}
          />
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

export default EntrySearch;
