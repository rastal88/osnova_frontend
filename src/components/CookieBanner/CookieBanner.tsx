import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { analyticsEnabled } from '../../config/analytics';
import { setConsent, useConsent } from '../../consent';
import './CookieBanner.css';

/** Asks for consent to analytics cookies; shown only when analytics is enabled. */
const CookieBanner = () => {
  const { t } = useTranslation();
  const consent = useConsent();

  if (!analyticsEnabled || consent) return null;

  return (
    <section className="cookie-banner" aria-label={t('cookieBanner.label')}>
      <p className="cookie-banner-text">
        {t('cookieBanner.text')} <Link to="/cookies">{t('cookieBanner.policy')}</Link>
      </p>
      <div className="cookie-banner-actions">
        <Button onClick={() => setConsent('denied')}>{t('cookieBanner.decline')}</Button>
        <Button type="primary" onClick={() => setConsent('granted')}>
          {t('cookieBanner.accept')}
        </Button>
      </div>
    </section>
  );
};

export default CookieBanner;
