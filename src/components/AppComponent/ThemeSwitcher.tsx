import type React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

import type { ThemeMode } from '../../config/brand';

interface ThemeSwitcherProps {
  value: ThemeMode;
  onChange: (val: ThemeMode) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  value,
  onChange,
}) => {
  return (
    <Switch
      checked={value === 'dark'}
      onChange={(checked) => onChange(checked ? 'dark' : 'light')}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );
};

export default ThemeSwitcher;
