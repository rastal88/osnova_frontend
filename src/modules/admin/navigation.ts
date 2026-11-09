import {
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
  { path: '/admin/leads', label: 'pages.leads', icon: InboxOutlined },
  { path: '/admin/channels', label: 'pages.channels', icon: SendOutlined },
  { path: '/admin/users', label: 'pages.users', icon: TeamOutlined },
  { path: '/admin/settings', label: 'pages.settings', icon: SettingOutlined },
];
