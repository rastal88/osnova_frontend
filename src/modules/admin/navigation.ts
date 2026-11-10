import {
  ControlOutlined,
  DashboardOutlined,
  InboxOutlined,
  SendOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import type { NavItem } from '../../config/navigation';

/** Menu of the admin area; add an item here for every new admin section. */
export const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'pages.overview', icon: DashboardOutlined },
  { path: '/admin/users', label: 'pages.users', icon: TeamOutlined },
  { path: '/admin/leads', label: 'pages.leads', icon: InboxOutlined },
  {
    // A group key, not a page: its pages are the children
    path: 'settings',
    label: 'pages.settings',
    icon: SettingOutlined,
    children: [
      { path: '/admin/settings', label: 'pages.settingsGeneral', icon: ControlOutlined },
      { path: '/admin/settings/channels', label: 'pages.channels', icon: SendOutlined },
    ],
  },
];
