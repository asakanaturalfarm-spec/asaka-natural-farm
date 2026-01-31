
/**
 * アプリケーションエントリポイント
 * React 18+ ルート初期化
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
