import { Routes, Route, useParams } from 'react-router-dom';
import UserDiagnosis from './UserDiagnosis';

// 🌟 App.tsx の中で定義しているので、外部からの import は不要です
function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  // URLの末尾からIDを確実に抜き出す処理
  const urlId = window.location.pathname.split('/').pop();
  const diagnosisId = id ? parseInt(id, 10) : (urlId ? parseInt(urlId, 10) : 0);

  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* すべてのパスで UserDiagnosisWrapper を表示 */}
        <Route path="/" element={<UserDiagnosisWrapper />} />
        <Route path="/:id" element={<UserDiagnosisWrapper />} />
        <Route path="*" element={<UserDiagnosisWrapper />} />
      </Routes>
    </div>
  );
}

export default App;