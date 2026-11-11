import { Checkbox, Space, Typography } from 'antd';

import type { PermissionRead } from '../../../../api/generated';

interface Props {
  permissions: PermissionRead[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Permissions that may be ticked or unticked (the editor's own) */
  allowed: (permission: string) => boolean;
  disabled?: boolean;
}

/** Permission checkboxes in sections by area ("leads", "users", ...); a form control. */
const PermissionPicker = ({ permissions, value = [], onChange, allowed, disabled }: Props) => {
  const areas = new Map<string, PermissionRead[]>();
  for (const permission of permissions) {
    areas.set(permission.area, [...(areas.get(permission.area) ?? []), permission]);
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {[...areas.values()].map((items) => {
        const names = new Set(items.map((item) => item.name));
        return (
          <div key={items[0].area}>
            <Typography.Text strong>{items[0].area_title}</Typography.Text>
            <Checkbox.Group
              style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}
              value={value.filter((name) => names.has(name))}
              disabled={disabled}
              options={items.map((item) => ({
                value: item.name,
                label: item.title,
                disabled: !allowed(item.name),
              }))}
              onChange={(checked) =>
                onChange?.([...value.filter((name) => !names.has(name)), ...checked])
              }
            />
          </div>
        );
      })}
    </Space>
  );
};

export default PermissionPicker;
