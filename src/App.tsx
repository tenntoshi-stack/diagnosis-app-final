import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DiagnosisApp from './DiagnosisApp';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 通常のアクセス用 */}
          <Route path="/" element={<DiagnosisApp />} />
          {/* 管理画面からのID付きアクセス用 */}
          <Route path="/diagnoses/:id" element={<DiagnosisApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;