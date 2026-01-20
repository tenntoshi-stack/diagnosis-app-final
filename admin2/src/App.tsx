import { Routes, Route, useParams } from 'react-router-dom'; // Routerを削除
import UserDiagnosis from './UserDiagnosis';

// 🌟 URLのIDを受け取って UserDiagnosis に渡すパーツ
function UserDiagnosisWrapper() {
  const { id } = useParams<{ id: string }>();
  const diagnosisId = id ? parseInt(id, 10) : 0;
  return <UserDiagnosis diagnosisId={diagnosisId} />;
}

// admin2/src/App.tsx の return 部分を以下に書き換え
function App() {
  return (
    <div className="App">
      <Routes>
        {/* IDがあってもなくても、とにかくこの画面を表示する設定にします */}
        <Route path="/" element={<UserDiagnosisWrapper />} />
        <Route path="/:id" element={<UserDiagnosisWrapper />} />
        {/* 🌟 これを追加：予期せぬパスでも編集画面を開く */}
        <Route path="*" element={<UserDiagnosisWrapper />} />
      </Routes>
    </div>
  );
}
export default App;