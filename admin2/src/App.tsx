import { Routes, Route, useParams } from 'react-router-dom'; // Routerを削除
import UserDiagnosis from './UserDiagnosis';

// 🌟 URLのIDを受け取って UserDiagnosis に渡すパーツ
function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  const diagnosisId = id ? parseInt(id, 10) : 0;
  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* 🌟 admin2では「DiagnosisApp」ではなく、
          上で定義した「UserDiagnosisWrapper」を表示するように修正します 
        */}
        <Route path="/" element={<UserDiagnosisWrapper />} />
        <Route path="/:id" element={<UserDiagnosisWrapper />} />
      </Routes>
    </div>
  );
}

export default App;