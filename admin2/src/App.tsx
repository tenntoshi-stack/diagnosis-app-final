import { Routes, Route, useParams } from 'react-router-dom';
import UserDiagnosis from './UserDiagnosis';

function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  // URLの末尾からIDを力ずくで取得する処理を追加
  const urlId = window.location.pathname.split('/').pop();
  const diagnosisId = id ? parseInt(id, 10) : (urlId ? parseInt(urlId, 10) : 0);

  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

function App() {
  return (
    <div className="App">
      {/* 🌟 Routeを使わずに直接表示することで、No routes matched エラーを物理的に回避します */}
      <UserDiagnosisWrapper />
    </div>
  );
}

export default App;