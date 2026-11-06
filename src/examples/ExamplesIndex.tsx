import { FormOutlined, TableOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import PageContainer from '../components/PageContainer/PageContainer';
import './ExamplesIndex.css';

const { Paragraph } = Typography;

interface ExampleLink {
  path: string;
  key: 'contact' | 'data';
  icon: ComponentType;
}

const EXAMPLES: ExampleLink[] = [
  { path: '/contact', key: 'contact', icon: FormOutlined },
  { path: '/examples/data', key: 'data', icon: TableOutlined },
];

const ExamplesIndex = () => {
  const { t } = useTranslation('examples');

  return (
    <PageContainer title={t('index.title')} subtitle={t('index.subtitle')} seo="examples">
      <Row gutter={[16, 16]}>
        {EXAMPLES.map(({ path, key, icon: Icon }) => (
          <Col key={key} xs={24} md={12}>
            <Link to={path} className="examples-link">
              <Card hoverable className="examples-card">
                <Card.Meta
                  avatar={
                    <span className="examples-icon">
                      <Icon />
                    </span>
                  }
                  title={t(`index.items.${key}.title`)}
                  description={<Paragraph type="secondary">{t(`index.items.${key}.description`)}</Paragraph>}
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
};

export default ExamplesIndex;
