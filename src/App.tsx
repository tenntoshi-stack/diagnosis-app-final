import { Routes, Route } from 'react-router-dom';
import DiagnosisApp from './DiagnosisApp';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* TOPページ用 */}
        <Route path="/" element={<DiagnosisApp />} />
        
        {/* 🌟 404エラーを防ぐために、sあり・なし両方のパスを記述します */}
        <Route path="/diagnosis/:id" element={<DiagnosisApp />} />
        <Route path="/diagnoses/:id" element={<DiagnosisApp />} />
      </Routes>
    </div>
  );
}

export default App;