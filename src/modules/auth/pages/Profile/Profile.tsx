import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions } from 'antd';
import { useTranslation } from 'react-i18next';

import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useAuthStore } from '../../authStore';
import VerifyEmailNotice from '../../components/VerifyEmailNotice';

const Profile = () => {
  const { t } = useTranslation('auth');
  const user = useAuthStore((state) => state.user);

  return (
    <PageContainer title={t('profile.title')} noindex>
      <VerifyEmailNotice />
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 16 }} />
          <h3>{user?.email}</h3>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('email')}>{user?.email}</Descriptions.Item>
          <Descriptions.Item label={t('profile.role')}>
            {user && t(`roles.${user.role}`)}
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.emailStatus')}>
            {user && t(user.is_verified ? 'profile.verified' : 'profile.notVerified')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default Profile;
