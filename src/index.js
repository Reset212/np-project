import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainApp from './MainApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);

// Если не используете reportWebVitals, удалите эту строку
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();