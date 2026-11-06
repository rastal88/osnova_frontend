import { ThemeConfig } from 'antd';

export const themeLight: ThemeConfig = {
  token: {
    colorPrimary: '#3b516a',
    colorBgBase: '#f1f5f8',
    colorText: '#3b516a',
    fontFamily: 'Roboto',
    // colorBgContainer: '#ffffff',
  },
  components: {
    Input: {
      activeBg: '#ffffff',
      hoverBg: '#ffffff',
      colorBgContainer: '#ffffff',
    },
    InputNumber: {
      activeBg: '#ffffff',
      hoverBg: '#ffffff',
      colorBgContainer: '#ffffff',
    },
    Menu: {
      itemSelectedBg: '#a1a7ab',
      groupTitleFontSize: 16,
      groupTitleColor: '#3b516a',
      lineHeight: 2,
    },
    Table: {
      cellFontSizeSM: 12,
      headerBorderRadius: 0,
      fontFamily: 'RobotoMono',
      colorBgContainer: '#ffffff',
      headerBg: '#dce4e9',
      bodySortBg: '#f1f5f8',
      headerSortActiveBg: '#cfdde7',
      headerSortHoverBg: '',
      rowHoverBg: '#f1f5f8',
      borderColor: '#3b516a',
    },
    Button: {
      defaultShadow: 'none',
      primaryShadow: 'none',
    },
    Layout: {
      headerBg: '#8996a5',
      headerHeight: 50,
    },
    Popover: {
      colorBgElevated: '#ffffff',
      colorTextHeading: '#ff4d4f',
      colorText: '#ff4d4f',
    },
    Dropdown: {
      colorBgElevated: '#ffffff',
    },
    Tabs: {
      // itemSelectedColor: 'black',
      cardBg: 'white',
    },
    Alert: {
      withDescriptionPadding: 8,
      colorInfo: '#3b516a',
      colorInfoBg: '',
      colorInfoBorder: '#3b516a',
    },
    DatePicker: {
      activeBg: '#ffffff',
      hoverBg: '#ffffff',
    },
  },
};

export const themeDark: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff', // Primary blue for the dark theme (example)
    colorBgBase: '#10141a',
    colorText: '#f5f7fa',
    fontFamily: 'Roboto',
  },
  components: {
    Input: {
      activeBg: '#23272f',
      hoverBg: '#23272f',
      colorBgContainer: '#23272f',
    },
    InputNumber: {
      activeBg: '#23272f',
      hoverBg: '#23272f',
      colorBgContainer: '#23272f',
    },
    Menu: {
      itemSelectedBg: '#23272f',
      groupTitleFontSize: 16,
      groupTitleColor: '#f5f7fa',
      lineHeight: 2,
    },
    Table: {
      cellFontSizeSM: 12,
      headerBorderRadius: 0,
      fontFamily: 'RobotoMono',
      colorBgContainer: '#23272f',
      headerBg: '#23272f',
      bodySortBg: '#23272f',
      headerSortActiveBg: '#23272f',
      headerSortHoverBg: '',
      rowHoverBg: '#23272f',
      borderColor: '#f5f7fa',
    },
    Button: {
      defaultShadow: 'none',
      primaryShadow: 'none',
    },
    Layout: {
      headerBg: '#23272f',
      headerHeight: 50,
    },
    Popover: {
      colorBgElevated: '#23272f',
      colorTextHeading: '#ff4d4f',
      colorText: '#ff4d4f',
    },
    Dropdown: {
      colorBgElevated: '#23272f',
    },
    Tabs: {
      // itemSelectedColor: 'black',
      cardBg: 'white',
    },
    Alert: {
      withDescriptionPadding: 8,
      colorInfo: '#f5f7fa',
      colorInfoBg: '',
      colorInfoBorder: '#f5f7fa',
    },
    DatePicker: {
      activeBg: '#23272f',
      hoverBg: '#23272f',
    },
  },
};

export function getTheme(themeName: 'light' | 'dark') {
  return themeName === 'dark' ? themeDark : themeLight;
}