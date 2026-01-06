import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 🌟 主役だと思われる UserDiagnosis を読み込みます
import UserDiagnosis from './UserDiagnosis'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* URLの末尾にID（数字）がついても UserDiagnosis を表示する設定 */}
        <Route path="/:id" element={<UserDiagnosis />} />
        {/* 通常のアクセス時 */}
        <Route path="/" element={<UserDiagnosis />} />
      </Routes>
    </Router>
  );
}

export default App;