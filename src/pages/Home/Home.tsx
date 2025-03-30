import { Card, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <Card>
      <Title level={2}>Добро пожаловать!</Title>
      <Paragraph>
        Это главная страница приложения. Здесь может быть описание вашего сервиса.
      </Paragraph>
      <Link to="/dashboard">
        <Button type="primary">Перейти в приложение</Button>
      </Link>
    </Card>
  );
};

export default HomePage;