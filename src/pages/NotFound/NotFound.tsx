import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import PageState from '../../components/PageState/PageState';
import Seo from '../../components/Seo/Seo';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('state.notFoundTitle')} noindex />
      <PageState
        kind="not-found"
        action={
          <Link to="/">
            <Button type="primary">{t('state.goHome')}</Button>
          </Link>
        }
      />
    </>
  );
};

export default NotFound;
