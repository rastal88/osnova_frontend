import { DashboardOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';

import type { NavItem } from '../../config/navigation';

/** Menu of the admin area; add an item here for every new admin section. */
export const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'pages.overview', icon: DashboardOutlined },
  { path: '/admin/users', label: 'pages.users', icon: TeamOutlined },
  { path: '/admin/settings', label: 'pages.settings', icon: SettingOutlined },
];
