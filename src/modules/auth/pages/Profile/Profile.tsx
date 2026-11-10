import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useAuthStore } from '../../authStore';
import VerifyEmailNotice from '../../components/VerifyEmailNotice';
import {
  DeleteSection,
  EmailSection,
  NameSection,
  PasswordSection,
  SessionsSection,
} from './sections';
import './Profile.css';

/** The same page for every role: the account and its settings. */
const Profile = () => {
  const { t } = useTranslation('auth');
  const user = useAuthStore((state) => state.user);

  return (
    <PageContainer title={t('profile.title')} noindex maxWidth={720}>
      <VerifyEmailNotice />
      {user && (
        <Space direction="vertical" size="large" className="profile">
          <Card>
            <div className="profile-head">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <h3 className="profile-name">{user.name || user.email}</h3>
                {user.name && <span className="profile-email">{user.email}</span>}
              </div>
            </div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('email')}>{user.email}</Descriptions.Item>
              <Descriptions.Item label={t('profile.role')}>
                {t(`roles.${user.role}`)}
              </Descriptions.Item>
              <Descriptions.Item label={t('profile.emailStatus')}>
                {t(user.is_verified ? 'profile.verified' : 'profile.notVerified')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <NameSection key={`name-${user.name ?? ''}`} user={user} />
          <PasswordSection />
          <EmailSection user={user} />
          <SessionsSection />
          <DeleteSection user={user} />
        </Space>
      )}
    </PageContainer>
  );
};

export default Profile;
