import { Card, Descriptions, Button, Avatar } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';

const Profile = () => {
  // В реальном приложении данные будут приходить из состояния или API
  const userData = {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    role: 'admin', // или 'user'
  };

  return (
    <Card
      title="User profile"
      extra={<Button icon={<EditOutlined />}>Edit</Button>}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 16 }} />
        <h3>{userData.name}</h3>
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{userData.role}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Profile;