import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import UserDiagnosis from './UserDiagnosis';

// 🌟 UserDiagnosis に ID を渡すための補助パーツ
function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  // URL の ID を数字に変換。なければ 0 を入れる
  const diagnosisId = id ? parseInt(id, 10) : 0;

  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌟 Wrapper を通じて ID を渡すように設定 */}
        <Route path="/:id" element={<UserDiagnosisWrapper />} />
        <Route path="/" element={<UserDiagnosisWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;