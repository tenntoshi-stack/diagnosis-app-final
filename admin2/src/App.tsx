import { Routes, Route, useParams } from 'react-router-dom';
import UserDiagnosis from './UserDiagnosis';

// 🌟 URLの末尾からIDを確実に抜き出すためのパーツ
function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  // 万が一 useParams が失敗しても URL から直接 ID を取得する
  const urlId = window.location.pathname.split('/').pop();
  const diagnosisId = id ? parseInt(id, 10) : (urlId ? parseInt(urlId, 10) : 0);

  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* どんなパスで来ても UserDiagnosisWrapper を表示する設定 */}
        <Route path="/" element={<UserDiagnosisWrapper />} />
        <Route path="/:id" element={<UserDiagnosisWrapper />} />
        <Route path="*" element={<UserDiagnosisWrapper />} />
      </Routes>
    </div>
  );
}

export default App;