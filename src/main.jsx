import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // This will be App.jsx in the same directory
import './css/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);