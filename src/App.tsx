// admin/src/App.tsx (修正版: APIからデータを取得し表示)

import { useState, useEffect } from 'react';
import './App.css';

// データベースから取得する診断セットの型を定義
interface DiagnosisSet {
  id: number;
  title: string;
  is_public: 0 | 1; // 0: 非公開, 1: 公開
  created_at: string;
}

function App() {
console.log("--- TEST RENDER SUCCESS ---"); 
  return (
    <div>
      <h1>テスト成功！</h1>
      <p>このメッセージが見えれば、Reactアプリは動いています。</p>
    </div>
  );
}

export default App;