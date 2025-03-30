import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
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
      // fontFamily: 'RobotoMono',
      // colorBgContainer: '#ffffff',
      // headerBg: '#dce4e9',
      // bodySortBg: '#f1f5f8',
      // headerSortActiveBg: '#cfdde7',
      // headerSortHoverBg: '',
      // rowHoverBg: '#f1f5f8',
      // borderColor: '#3b516a',
    },
    Button: {
      defaultShadow: 'none',
      primaryShadow: 'none',
    },
    Layout: {
      headerBg: '#8996a5',
      headerHeight: 70,
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