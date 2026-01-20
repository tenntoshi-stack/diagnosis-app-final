import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 🌟 1. これを追加
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 🌟 2. <BrowserRouter> で <App /> を囲む */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)