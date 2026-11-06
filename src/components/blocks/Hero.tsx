import { Space, Typography } from 'antd';
import type { ReactNode } from 'react';

import Image from '../Image/Image';
import type { ImageSource } from '../Image/Image';
import Section from './Section';

const { Title, Paragraph, Text } = Typography;

export interface HeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  actions?: ReactNode;
  image?: ImageSource;
  imageAlt?: string;
}

/** First screen: headline, text and actions, with an optional image beside them. */
const Hero = ({ eyebrow, title, text, actions, image, imageAlt = '' }: HeroProps) => (
  <Section tone="surface">
    <div className={`block-hero${image ? ' block-hero-with-image' : ''}`}>
      <div className="block-hero-copy">
        {eyebrow && <Text className="block-eyebrow">{eyebrow}</Text>}
        <Title level={1} className="block-hero-title">
          {title}
        </Title>
        {text && <Paragraph className="block-hero-text">{text}</Paragraph>}
        {actions && <Space wrap>{actions}</Space>}
      </div>
      {image && (
        <Image
          image={image}
          alt={imageAlt}
          sizes="(min-width: 992px) 50vw, 100vw"
          priority
          className="block-hero-image"
        />
      )}
    </div>
  </Section>
);

export default Hero;
