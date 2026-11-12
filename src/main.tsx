// Ant Design 5 with React 19: must load before antd
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import './i18n';
import AppComponent from './components/AppComponent/AppComponent';
import { applyConsent } from './consent';
import { initErrorTracking } from './errorTracking';

// Sentry when VITE_SENTRY_DSN is set (its own chunk, loaded after start)
initErrorTracking();
// Analytics of a returning visitor who has already agreed
applyConsent();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
);
