import { Card, Container, Row } from 'react-bootstrap';
import myImage from '../assets/nishinonanase.jpg';
import './Home.css';

const Home = () => {
  return (
    <Container>
      <Row>
        <div className="image-container mt-5">
          <div className="one mb-5">
            <h1>法律與文學之間：明清判牘的出版、閱讀與法律知識</h1>
          </div>
          <a
            href="https://www.instagram.com/nishino.nanase.official/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={myImage}
              alt="Historical manuscript"
              className="styled-image"
            />
          </a>
          <Card className="mt-4 text-start" style={{ width: '30%' }}>
            <Card.Body>
              本計劃除了發掘前人未見的判牘資料，擴大後續研究的視野與對象，更能從出版史、閱讀史的角度，將做為法律文本的判牘，從製作、編輯、出版、閱讀的過程之中，逐一檢視其不同階段的動機，使明清時代法律知識的討論避免原則性與概念性的討論，而是更為落實，明確地指出判牘承載的知識對於讀者的實際影響，以及讀者真實的感受。
            </Card.Body>
          </Card>
        </div>
      </Row>
    </Container>
  );
};

export default Home;
