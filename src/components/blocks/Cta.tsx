import { Space, Typography } from 'antd';
import type { ReactNode } from 'react';

import Section from './Section';

const { Title, Paragraph } = Typography;

export interface CtaProps {
  id?: string;
  title: ReactNode;
  text?: ReactNode;
  actions?: ReactNode;
}

/** Call to action on a brand-coloured band. */
const Cta = ({ id, title, text, actions }: CtaProps) => (
  <Section id={id} tone="primary">
    <div className="block-cta">
      <Title level={2} className="block-cta-title">
        {title}
      </Title>
      {text && <Paragraph className="block-cta-text">{text}</Paragraph>}
      {actions && <Space wrap>{actions}</Space>}
    </div>
  </Section>
);

export default Cta;
