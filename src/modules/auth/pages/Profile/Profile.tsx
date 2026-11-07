import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Descriptions } from 'antd';
import { useTranslation } from 'react-i18next';

import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useAuthStore } from '../../authStore';

const Profile = () => {
  const { t } = useTranslation('auth');
  const user = useAuthStore((state) => state.user);

  return (
    <PageContainer
      title={t('profile.title')}
      actions={<Button icon={<EditOutlined />}>{t('profile.edit')}</Button>}
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 16 }} />
          <h3>{user?.email}</h3>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('email')}>{user?.email}</Descriptions.Item>
          <Descriptions.Item label={t('profile.role')}>{user?.role}</Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default Profile;
