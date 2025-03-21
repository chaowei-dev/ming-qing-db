import React, { useEffect, useState } from 'react';
import { Col, InputGroup, Row, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../services/categoryService';

interface Category {
  id: number;
  name: string;
}

interface BookSearchProps {
  bookTitle: string;
  bookAuthor: string;
  bookSource: string;
  categoryId: string;
}

interface FormProps {
  pageSize: number;
  keyword: string;
}

const BookSearch: React.FC<FormProps> = ({ pageSize, keyword }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookKeywordForm, setBookKeywordForm] = useState<BookSearchProps>({
    bookTitle: '',
    bookAuthor: '',
    bookSource: '',
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

  const navigate = useNavigate();

  // Handle init value
  const handleInitValue = () => {
    if (keyword) {
      const searchParams = new URLSearchParams(keyword);
      setBookKeywordForm({
        bookTitle: searchParams.get('bookTitle') ?? '',
        bookAuthor: searchParams.get('bookAuthor') ?? '',
        bookSource: searchParams.get('bookSource') ?? '',
        categoryId: searchParams.get('categoryId') ?? '',
      });
    }
  };

  useEffect(() => {
    handleInitValue();
  }, [keyword]);

  // Handle search
  const handleSearch = () => {
    // Combine all the search parameters and send them to the server
    const searchQuery = `bookTitle=${bookKeywordForm.bookTitle}&bookAuthor=${bookKeywordForm.bookAuthor}&bookSource=${bookKeywordForm.bookSource}&categoryId=${bookKeywordForm.categoryId}`;

    // Redirect to the search page
    const url = `/book/list/${pageSize}/1/${searchQuery}`;
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
            <InputGroup.Text>分類</InputGroup.Text>
            <Form.Select
              value={bookKeywordForm.categoryId}
              onChange={(e) =>
                setBookKeywordForm({
                  ...bookKeywordForm,
                  categoryId: e.target.value,
                })
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
            <InputGroup.Text>書目</InputGroup.Text>
            <Form.Control
              type="text"
              value={bookKeywordForm.bookTitle}
              onChange={(e) =>
                setBookKeywordForm({
                  ...bookKeywordForm,
                  bookTitle: e.target.value,
                })
              }
              onKeyDown={handleKeyDown}
            />
          </InputGroup>
          <InputGroup size="sm">
            <InputGroup.Text>作者</InputGroup.Text>
            <Form.Control
              type="text"
              value={bookKeywordForm.bookAuthor}
              onChange={(e) =>
                setBookKeywordForm({
                  ...bookKeywordForm,
                  bookAuthor: e.target.value,
                })
              }
              onKeyDown={handleKeyDown}
            />

            <InputGroup.Text>來源</InputGroup.Text>
            <Form.Control
              type="text"
              value={bookKeywordForm.bookSource}
              onChange={(e) =>
                setBookKeywordForm({
                  ...bookKeywordForm,
                  bookSource: e.target.value,
                })
              }
              onKeyDown={handleKeyDown}
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

export default BookSearch;
