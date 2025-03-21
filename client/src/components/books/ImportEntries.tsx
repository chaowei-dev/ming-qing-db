import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  ProgressBar,
  Table,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { addEntry } from '../../services/entryService';
import { fetchCategories } from '../../services/categoryService';

interface Category {
  id: number;
  name: string;
}

interface EntryWithBookAndRoll {
  title: string;
  author: string;
  source: string;
  version: string;
  roll: string;
  rollName: string;
  entry: string;
}

const ImportEntries = () => {
  const [dataList, setDataList] = useState<EntryWithBookAndRoll[]>([]);
  const [sucessDataCount, setSucessDataCount] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorUploadData, setErrorUploadData] = useState<
    EntryWithBookAndRoll[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Fetch categories
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

  // Read CSV file and parse data
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Step 1: Read the file
    const reader = new FileReader();

    // Step 2: Parse the file
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n');

      // Initialize data array within the onload event
      const data: EntryWithBookAndRoll[] = [];

      // Parse each row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        if (row.length === 7) {
          data.push({
            title: row[0],
            author: row[1],
            roll: row[2],
            rollName: row[3],
            entry: row[4],
            version: row[5],
            source: row[6],
          });
        }
      }

      // Step 3: Set dataList and totalData
      setDataList(data);
      setTotalData(data.length);
    };

    // Read the file as text
    reader.readAsText(selectedFile);
  };

  // Upload data to backend
  const handleDataUpload = async () => {
    if (dataList.length === 0) {
      setUploadStatus('請先選擇檔案');
      return;
    }
    if (!selectedCategoryId) {
      setUploadStatus('請選擇分類');
      return;
    }

    // Set upload status
    handleUploadStatus('uploading');

    // Loop dataList and send to backend
    for (let i = 0; i < dataList.length; i++) {
      try {
        // Add entry with API
        await addEntry({
          ...dataList[i],
          categoryId: selectedCategoryId,
        });

        // Update currentData
        setSucessDataCount(i + 1);
      } catch (error) {
        console.error('Add entry failed:', error);
        setErrorUploadData([...errorUploadData, dataList[i]]);
        return;
      }
      // delay 0.1s
      await new Promise((r) => setTimeout(r, 100));
    }

    // Set upload status
    handleUploadStatus('success');
  };

  // Setting uploading status
  const handleUploadStatus = (status: string) => {
    if (status === 'success') {
      setUploadStatus('匯入成功');
    }
    if (status === 'error') {
      setUploadStatus('匯入失敗');
    }
    if (status === 'uploading') {
      setUploadStatus('匯入中...');
    }
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col className="text-center">
          <h2>
            <b>匯入篇目清單</b>
          </h2>
        </Col>
      </Row>
      {/* File upload */}
      <Row className="justify-content-md-center mt-5">
        <Col xs lg="2" className="align-self-center">
          <InputGroup size="sm">
            <InputGroup.Text>分類</InputGroup.Text>
            <Form.Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={uploadStatus === 'uploading'}
            >
              <option value="">選擇分類</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      <Row className="justify-content-md-center mt-5">
        <Col xs lg="2" className="align-self-center"></Col>
        <Col xs lg="2">
          <div>
            <input
              className="form-control"
              type="file"
              id="formFile"
              onChange={(e) =>
                handleFileSelect(e.target.files ? e.target.files[0] : null)
              }
              disabled={!selectedCategoryId || uploadStatus === 'uploading'}
            />
          </div>
        </Col>
        <Col xs lg="2" className="align-self-center">
          <Button
            variant="primary"
            onClick={handleDataUpload}
            disabled={!selectedCategoryId || uploadStatus === 'uploading'}
          >
            匯入
          </Button>
        </Col>
      </Row>
      {/* Progress display */}
      <Row className="justify-content-md-center mt-5">
        <Col xs lg="6">
          <Card>
            <Card.Header as="h5">匯入進度:</Card.Header>
            <Card.Body className="text-center">
              <Card.Text>
                {sucessDataCount} / {totalData}
              </Card.Text>
              <ProgressBar now={(sucessDataCount / totalData) * 100} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Error data list */}
      <Row className="justify-content-md-center mt-5">
        <Col xs lg="6">
          <Card>
            <Card.Header as="h5">錯誤資料:</Card.Header>
            <Card.Body className="text-center">
              <Card.Text>
                {errorUploadData.map((data, index) => (
                  <div key={index}>
                    <p>
                      {data.title} - {data.roll} - {data.rollName}
                    </p>
                  </div>
                ))}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* csv data example */}
      <Row className="justify-content-md-center mt-5">
        <Col xs lg="6">
          <Card>
            <Card.Header as="h5">範例(注意標題順序):</Card.Header>
            <Card.Body className="text-center">
              <Card.Text>
                <Table striped bordered hover size="sm">
                  <tr>
                    <th>書名</th>
                    <th>作者</th>
                    <th>卷次</th>
                    <th>卷名</th>
                    <th>篇名</th>
                    <th>版本</th>
                  </tr>
                  <tr>
                    <td>太師誠意伯劉文成公集</td>
                    <td>劉基</td>
                    <td>序</td>
                    <td>李本</td>
                    <td>重編誠意伯文集序</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>太師誠意伯劉文成公集</td>
                    <td>劉基</td>
                    <td>卷之一</td>
                    <td>御書（七篇）</td>
                    <td>御製慰書</td>
                    <td>1</td>
                  </tr>
                </Table>
              </Card.Text>
              <Card.Text className="text-danger">
                <b>請另存為 CSV 格式，並確認檔案內容符合範例格式。</b>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ImportEntries;
