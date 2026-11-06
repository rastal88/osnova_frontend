import { Typography } from 'antd';
import type { ReactNode } from 'react';

import Section from './Section';
import type { SectionProps } from './Section';

const { Title, Paragraph } = Typography;

export interface ServiceItem {
  icon?: ReactNode;
  title: ReactNode;
  text: ReactNode;
}

export interface ServicesProps extends Omit<SectionProps, 'children'> {
  items: ServiceItem[];
}

/** Services or features as a grid of cards. */
const Services = ({ items, ...section }: ServicesProps) => (
  <Section {...section}>
    <div className="block-grid">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: items are static content
        <article key={index} className="block-card">
          {item.icon && <span className="block-icon">{item.icon}</span>}
          <Title level={4} className="block-card-title">
            {item.title}
          </Title>
          <Paragraph type="secondary" className="block-card-text">
            {item.text}
          </Paragraph>
        </article>
      ))}
    </div>
  </Section>
);

export default Services;
