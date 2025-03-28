import { Button, Card } from 'antd';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';

const Dashboard = () => {
  const { token, clearToken } = useAuthStore();

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/protected-data');
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card title="Dashboard">
      <p>Токен: {token}</p>
      <Button onClick={fetchData}>Получить данные</Button>
      <Button danger onClick={clearToken}>
        Выйти
      </Button>
    </Card>
  );
};

export default Dashboard;