import { Alert, Card, Typography } from 'antd';
import type { ReactNode } from 'react';

import Seo from '../../../../components/Seo/Seo';
import './AuthCard.css';

const { Title } = Typography;

interface AuthCardProps {
  title: string;
  error?: string | null;
  footer?: ReactNode;
  children: ReactNode;
}

/** Centred card for the standalone sign-in and sign-up pages. */
const AuthCard = ({ title, error, footer, children }: AuthCardProps) => (
  <div className="auth-page">
    <Seo title={title} noindex />
    <Card className="auth-card">
      <Title level={3} className="auth-card-title">
        {title}
      </Title>
      {error && <Alert className="auth-card-error" type="error" showIcon message={error} />}
      {children}
      {footer && <div className="auth-card-footer">{footer}</div>}
    </Card>
  </div>
);

export default AuthCard;
