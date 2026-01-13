import { Routes, Route } from 'react-router-dom'; // Router をインポートから消す
import DiagnosisApp from './DiagnosisApp';

function App() {
  return (
    // <Router> タグを削除（<div>から始める）
    <div className="App">
      <Routes>
        <Route path="/" element={<DiagnosisApp />} />
        <Route path="/diagnoses/:id" element={<DiagnosisApp />} />
      </Routes>
    </div>
    // </Router> タグを削除
  );
}

export default App;