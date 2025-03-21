import { useState, useEffect } from 'react';
import { Card, Col, Container, Row, Button } from 'react-bootstrap';

interface Category {
  id: number;
  name: string;
}
import myImage from '../assets/nishinonanase.jpg';
import './Home.css';
import { fetchCategories } from '../services/categoryService';

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    getCategories();
  }, []);
  return (
    <Container className="mt-5">
      <Row>
        <div className="one mb-5">
          <h1>法律與文學之間：明清判牘的出版、閱讀與法律知識</h1>
        </div>
      </Row>
      <Row>
        {/* categories 連結，改用垂直排列的按鈕並置中 */}
        <Col md={8} className="mt-5">
          <div className="two d-flex flex-column align-items-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                href={`entry/list/50/1/globalKeyword=&bookTitle=&rollName=&entryName=&authorName=&categoryId=${category.id}`}
                variant="outline-primary"
                className="mb-5"
                size="lg"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </Col>

        {/* 圖片與說明卡，圖片置中 */}
        <Col md={4} className="text-center">
          <a
            href="https://www.instagram.com/nishino.nanase.official/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={myImage}
              alt="Historical manuscript"
              className="styled-image"
              style={{ width: '80%' }} // 調整圖片大小
            />
          </a>
          <Card className="mt-4 text-start" style={{ width: '100%' }}>
            <Card.Body>
              本計劃除了發掘前人未見的判牘資料，擴大後續研究的視野與對象，
              更能從出版史、閱讀史的角度，將做為法律文本的判牘，從製作、編輯、出版、
              閱讀的過程之中，逐一檢視其不同階段的動機，使明清時代法律知識的討論
              避免原則性與概念性的討論，而是更為落實，明確地指出判牘承載的知識對於
              讀者的實際影響，以及讀者真實的感受。
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
