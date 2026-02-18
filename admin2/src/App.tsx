import { Routes, Route } from 'react-router-dom';
import UserView from './UserView';
import AdminView from './AdminView'; // ここで読み込みます

function App() {
  return (
    <Routes>
      {/* 診断ページ */}
      <Route path="/diagnosis/:id" element={<UserView />} />
      
      {/* 管理画面ページを /admin に設定 */}
      <Route path="/admin" element={<AdminView />} />
      
      {/* トップページ */}
      <Route path="/" element={<UserView />} />
    </Routes>
  );
}

export default App;