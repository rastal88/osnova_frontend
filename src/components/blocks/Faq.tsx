import { Collapse } from 'antd';
import type { ReactNode } from 'react';

import Section from './Section';
import type { SectionProps } from './Section';

export interface FaqItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface FaqProps extends Omit<SectionProps, 'children'> {
  items: FaqItem[];
}

/** Questions and answers; answers open on click. */
const Faq = ({ items, ...section }: FaqProps) => (
  <Section {...section}>
    <Collapse
      className="block-faq"
      items={items.map((item, index) => ({
        key: String(index),
        label: item.question,
        children: item.answer,
      }))}
    />
  </Section>
);

export default Faq;
