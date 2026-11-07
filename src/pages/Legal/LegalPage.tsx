import { Alert, Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import PageContainer from '../../components/PageContainer/PageContainer';
import { analyticsEnabled } from '../../config/analytics';
import { isLegalConfigured, legal } from '../../config/legal';
import { resetConsent } from '../../consent';
import { useFormat } from '../../i18n/format';
import './LegalPage.css';

const { Title, Paragraph, Text } = Typography;

export type LegalDocument = 'privacy' | 'terms' | 'cookies';

interface LegalSection {
  title: string;
  text: string;
}

const SITE = import.meta.env.VITE_SITE_URL || window.location.origin;

/** A legal document from src/locales/<language>/legal.json with the owner details filled in. */
const LegalPage = ({ document }: { document: LegalDocument }) => {
  const { t } = useTranslation('legal');
  const format = useFormat();
  const values = {
    owner: legal.owner,
    email: legal.email,
    address: legal.address,
    site: SITE,
  };
  const sections = t(`${document}.sections`, {
    returnObjects: true,
    ...values,
  }) as LegalSection[];

  return (
    <PageContainer seo={document} maxWidth={760}>
      <article className="legal-page">
        <Title level={2}>{t(`${document}.title`)}</Title>
        <Text type="secondary">
          {t('updated', { date: format.date(`${legal.updated}T00:00:00`) })}
        </Text>

        {!isLegalConfigured() && (
          <Alert
            className="legal-page-notice"
            type="warning"
            showIcon
            message={t('templateNotice')}
          />
        )}

        <Paragraph className="legal-page-intro">{t(`${document}.intro`, values)}</Paragraph>

        {sections.map((section) => (
          <section key={section.title}>
            <Title level={4}>{section.title}</Title>
            {section.text.split('\n\n').map((paragraph) => (
              <Paragraph key={paragraph}>{paragraph}</Paragraph>
            ))}
          </section>
        ))}

        {document === 'cookies' && analyticsEnabled && (
          <Button onClick={resetConsent}>{t('changeConsent')}</Button>
        )}
      </article>
    </PageContainer>
  );
};

export default LegalPage;
