import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

interface ThemeSwitcherProps {
  value: 'light' | 'dark';
  onChange: (val: 'light' | 'dark') => void;
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
