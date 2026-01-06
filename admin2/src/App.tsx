import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionEditor from './QuestionEditor'; // 編集画面のメイン部品

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌟 これが重要：URLの最後にID（数字）がついた時にこの画面を開く設定 */}
        <Route path="/:id" element={<QuestionEditor />} />
        
        {/* IDがない場合のバックアップ */}
        <Route path="/" element={<QuestionEditor />} />
      </Routes>
    </Router>
  );
}

export default App;