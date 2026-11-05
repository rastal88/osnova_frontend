import { Card, Descriptions, Button, Avatar } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';

import PageContainer from '../../../../components/PageContainer/PageContainer';

const Profile = () => {
  const userData = {
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    role: 'admin',
  };

  return (
    <PageContainer
      title="User profile"
      actions={<Button icon={<EditOutlined />}>Edit</Button>}
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 16 }} />
          <h3>{userData.name}</h3>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
          <Descriptions.Item label="Role">{userData.role}</Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default Profile;
