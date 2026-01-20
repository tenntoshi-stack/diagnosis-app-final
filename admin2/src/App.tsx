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
  <div className="App"> {/* Routerを消して、外側をdivだけにする */}
    <Routes>
      <Route path="/" element={<DiagnosisApp />} />
      <Route path="/:id" element={<DiagnosisApp />} /> {/* ID付きで開くために必要 */}
    </Routes>
  </div>
);
}

export default App;