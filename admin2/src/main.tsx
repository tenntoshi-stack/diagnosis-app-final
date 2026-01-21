import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 🌟これを追加
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* 🌟AppをBrowserRouterで囲む */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)