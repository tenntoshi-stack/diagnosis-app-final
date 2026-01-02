import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import UserView from './UserView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 管理画面のURL (http://localhost:5173/) */}
        <Route path="/" element={<App />} />
        
        {/* お客様回答専用のURL (http://localhost:5173/diagnosis/1) */}
        <Route path="/diagnosis/:id" element={<UserView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)