import { Avatar, Rate, Typography } from 'antd';
import type { ReactNode } from 'react';

import Section from './Section';
import type { SectionProps } from './Section';

const { Paragraph, Text } = Typography;

export interface ReviewItem {
  author: string;
  role?: ReactNode;
  text: ReactNode;
  /** 1–5 */
  rating?: number;
  avatar?: string;
}

export interface ReviewsProps extends Omit<SectionProps, 'children'> {
  items: ReviewItem[];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Customer reviews as quote cards. */
const Reviews = ({ items, ...section }: ReviewsProps) => (
  <Section {...section}>
    <div className="block-grid">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: items are static content
        <figure key={index} className="block-card block-review">
          {item.rating && <Rate disabled value={item.rating} className="block-review-rating" />}
          <blockquote>
            <Paragraph>{item.text}</Paragraph>
          </blockquote>
          <figcaption className="block-review-author">
            <Avatar src={item.avatar}>{initials(item.author)}</Avatar>
            <span>
              <Text strong>{item.author}</Text>
              {item.role && (
                <Text type="secondary" className="block-review-role">
                  {item.role}
                </Text>
              )}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  </Section>
);

export default Reviews;
