import { CheckOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

import Section from './Section';
import type { SectionProps } from './Section';

const { Title, Paragraph, Text } = Typography;

export interface PricingPlan {
  name: ReactNode;
  /** Already formatted, e.g. format.currency(19) */
  price: ReactNode;
  period?: ReactNode;
  description?: ReactNode;
  features: ReactNode[];
  action?: ReactNode;
  highlighted?: boolean;
  badge?: ReactNode;
}

export interface PricingProps extends Omit<SectionProps, 'children'> {
  plans: PricingPlan[];
}

/** Plans side by side; a highlighted plan stands out. */
const Pricing = ({ plans, ...section }: PricingProps) => (
  <Section {...section}>
    <div className="block-grid block-pricing">
      {plans.map((plan, index) => (
        <article
          // biome-ignore lint/suspicious/noArrayIndexKey: plans are static content
          key={index}
          className={`block-card block-plan${plan.highlighted ? ' block-plan-highlighted' : ''}`}
        >
          <div className="block-plan-head">
            <Title level={4} className="block-card-title">
              {plan.name}
            </Title>
            {plan.badge && <Tag color="blue">{plan.badge}</Tag>}
          </div>
          {plan.description && <Paragraph type="secondary">{plan.description}</Paragraph>}
          <div className="block-plan-price">
            <span>{plan.price}</span>
            {plan.period && <Text type="secondary">{plan.period}</Text>}
          </div>
          <ul className="block-plan-features">
            {plan.features.map((feature, featureIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: features are static content
              <li key={featureIndex}>
                <CheckOutlined className="block-plan-check" />
                {feature}
              </li>
            ))}
          </ul>
          {plan.action && <div className="block-plan-action">{plan.action}</div>}
        </article>
      ))}
    </div>
  </Section>
);

export default Pricing;
