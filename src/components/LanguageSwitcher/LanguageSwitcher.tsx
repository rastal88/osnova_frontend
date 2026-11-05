import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslation } from '../i18n/index.tsx';

const LanguageSwitcher = () => {
  const { currentLanguage, setLanguage } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'ru',
      label: 'Русский',
      onClick: () => setLanguage('ru'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => setLanguage('en'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <Button type="text" aria-label={`Language: ${currentLanguage}`}>
        {currentLanguage.toUpperCase()}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
