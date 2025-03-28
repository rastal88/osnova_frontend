import { Button, Form, Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', values);
      setToken(response.data.token);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (error) {
      message.error('Ошибка авторизации');
    }
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item name="email" rules={[{ required: true }]}>
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="Пароль" />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Войти
      </Button>
    </Form>
  );
};

export default Login;