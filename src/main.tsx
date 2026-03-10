import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminView from './AdminView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* /admin にアクセスしたら AdminView を表示する */}
        <Route path="/admin" element={<AdminView />} />
        
        {/* それ以外の場所（/）に来たら /admin に自動で飛ばす */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* どこにも当てはまらない場合も /admin へ */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)