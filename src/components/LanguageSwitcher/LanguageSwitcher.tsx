import { GlobalOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { switchLanguage } from '../../i18n/language';
import { useBootstrapStore } from '../../store/bootstrapStore';

/** Languages enabled on the backend; hidden when there is only one. */
const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const languages = useBootstrapStore((state) => state.config?.i18n.languages) ?? [];

  if (languages.length < 2) return null;

  const codes = languages.map((language) => language.code);
  const items: MenuProps['items'] = languages.map((language) => ({
    key: language.code,
    label: <span lang={language.code}>{language.name}</span>,
  }));

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items,
        selectable: true,
        selectedKeys: [i18n.language],
        onClick: ({ key }) => void switchLanguage(key, codes),
      }}
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        aria-label={t('header.language')}
        className="language-switcher"
      >
        {i18n.language.toUpperCase()}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
