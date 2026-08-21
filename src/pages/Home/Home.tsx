import { Card, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';
import './Home.css';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <Card>
      <Title level={2}>Welcome!</Title>
      <Paragraph>
        This is the main page of the application. This could be a description of your service.
      </Paragraph>
      <Link to="/dashboard">
        <Button type="primary">Go to application</Button>
      </Link>
    </Card>
  );
};

export default HomePage;