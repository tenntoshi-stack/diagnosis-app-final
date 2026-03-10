import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DiagnosisApp from './DiagnosisApp'; // 以前のメイン診断ページ
import AdminView from './AdminView';      // 今回完成した管理画面

function App() {
  return (
    <div className="App">
      <Routes>
        {/* ユーザーが診断で遊ぶページ */}
        <Route path="/" element={<DiagnosisApp />} />
        <Route path="/diagnosis/:id" element={<DiagnosisApp />} />
        
        {/* 管理者が診断を作るページ */}
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </div>
  );
}

export default App;