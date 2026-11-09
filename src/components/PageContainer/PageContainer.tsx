import { Breadcrumb, Space, Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { type BreadcrumbItem, getBreadcrumbs, navigationConfig } from '../../config/navigation';
import PageState from '../PageState/PageState';
import Seo from '../Seo/Seo';
import type { SeoPage } from '../Seo/Seo';
import './PageContainer.css';

const { Title, Text } = Typography;

interface PageContainerProps {
  title?: ReactNode;
  /** SEO texts from the `seo` namespace; otherwise a string title is used */
  seo?: SeoPage;
  /** Private page (account, admin): keep it out of search engines */
  noindex?: boolean;
  subtitle?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  loading?: boolean;
  error?: boolean;
  forbidden?: boolean;
  empty?: boolean;
  emptyText?: ReactNode;
  maxWidth?: number | string;
  children?: ReactNode;
}

const PageContainer = ({
  title,
  seo,
  noindex,
  subtitle,
  actions,
  breadcrumbs,
  loading = false,
  error = false,
  forbidden = false,
  empty = false,
  emptyText,
  maxWidth,
  children,
}: PageContainerProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const autoBreadcrumbs = navigationConfig.showBreadcrumbs
    ? getBreadcrumbs(location.pathname).map((crumb) => ({
        title: t(crumb.titleKey),
        path: crumb.path,
      }))
    : [];
  const items = breadcrumbs ?? autoBreadcrumbs;
  const showBreadcrumbs = items.length > 1;

  let content: ReactNode = children;

  if (loading) {
    content = <PageState kind="loading" />;
  } else if (error) {
    content = <PageState kind="error" />;
  } else if (forbidden) {
    content = <PageState kind="forbidden" />;
  } else if (empty) {
    content = <PageState kind="empty" description={emptyText} />;
  }

  const style: CSSProperties = maxWidth ? { maxWidth, marginInline: 'auto' } : {};

  return (
    <div className="page-container" style={style}>
      {seo ? (
        <Seo page={seo} noindex={noindex} />
      ) : (
        typeof title === 'string' && <Seo title={title} noindex={noindex} />
      )}
      {showBreadcrumbs && (
        <Breadcrumb
          className="page-container-breadcrumbs"
          items={items.map((item, index) => ({
            title:
              index === items.length - 1 ? (
                <span>{item.title}</span>
              ) : (
                <Link to={item.path}>{item.title}</Link>
              ),
          }))}
        />
      )}

      {(title || subtitle || actions) && (
        <div className="page-container-header">
          <div className="page-container-heading">
            {title && (
              <Title level={3} className="page-container-title">
                {title}
              </Title>
            )}
            {subtitle && <Text type="secondary">{subtitle}</Text>}
          </div>

          {actions && (
            <Space className="page-container-actions" wrap>
              {actions}
            </Space>
          )}
        </div>
      )}

      <div className="page-container-body">{content}</div>
    </div>
  );
};

export default PageContainer;
