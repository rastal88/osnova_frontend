import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import AppComponent from './components/AppComponent/AppComponent';
// import utc from 'dayjs/plugin/utc';
// import dayjs from 'dayjs';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);