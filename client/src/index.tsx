import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom'; // 🔹 HashRouter import edildi

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>   {/* 🔹 App'i HashRouter içine aldık */}
      <App />
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();