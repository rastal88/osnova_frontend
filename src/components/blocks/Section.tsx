import { Typography } from 'antd';
import type { ReactNode } from 'react';

import './blocks.css';

const { Title, Paragraph } = Typography;

export type SectionTone = 'plain' | 'surface' | 'primary';

export interface SectionProps {
  /** Anchor for in-page links: <a href="#pricing"> */
  id?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  tone?: SectionTone;
  children?: ReactNode;
}

/** A landing section: optional heading and a centred content column. */
const Section = ({ id, title, subtitle, tone = 'plain', children }: SectionProps) => (
  <section id={id} className={`block block-${tone}`}>
    <div className="block-inner">
      {(title || subtitle) && (
        <header className="block-header">
          {title && (
            <Title level={2} className="block-title">
              {title}
            </Title>
          )}
          {subtitle && <Paragraph className="block-subtitle">{subtitle}</Paragraph>}
        </header>
      )}
      {children}
    </div>
  </section>
);

export default Section;
