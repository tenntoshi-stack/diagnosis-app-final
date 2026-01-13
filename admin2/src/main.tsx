import React from 'react'
import ReactDOM from 'react-dom/client'
// BrowserRouter, Routes, Route のインポートは不要になるので消してもOKです
import App from './App'
// UserView も App.tsx 側で管理するなら、ここでのインポートは不要です
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ↓ タグをすべて消して <App /> だけにする */}
    <App />
  </React.StrictMode>,
)