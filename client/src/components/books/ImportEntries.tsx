import { Container, Row, Col } from 'react-bootstrap';

// TODO: Add ImportEntries component
const ImportEntries = () => {
  return (
    <Container>
      <Row className="mt-4">
        <Col className="text-center">
          <h2>
            <b>匯入篇目清單</b>
          </h2>
          <span>建立中...</span>
        </Col>
      </Row>
    </Container>
  );
};

export default ImportEntries;
