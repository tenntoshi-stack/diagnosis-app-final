import { useState, useEffect } from 'react'

interface DiagnosisSet {
  id: number;
  name: string;
  description: string;
  image_url: string;
  detail_url: string;
  is_public: number;
  created_at: string;
}

// 🌟 メインの管理画面
function AdminMain() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDetailUrl, setNewDetailUrl] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisSet | null>(null);

  const fetchDiagnoses = () => {
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses')
      .then(res => res.json())
      .then(data => {
        setDiagnoses(data);
        setLoading(false);
      })
      .catch(err => console.error("取得エラー:", err));
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const goToEdit = (diagnosis: DiagnosisSet) => {
    setSelectedDiagnosis(diagnosis);
    setViewMode('edit');
  };

  const goBack = () => {
    setSelectedDiagnosis(null);
    setViewMode('list');
    fetchDiagnoses();
  };

  const createDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newName, 
        description: newDescription, 
        image_url: newImageUrl, 
        detail_url: newDetailUrl 
      })
    })
    .then(() => {
      setNewName(''); setNewDescription(''); setNewImageUrl(''); setNewDetailUrl('');
      fetchDiagnoses();
      alert('作成しました！');
    });
  };

  if (viewMode === 'edit' && selectedDiagnosis) {
    return (
      <div style={{ padding: '30px' }}>
        <button onClick={goBack}>← 一覧に戻る</button>
        <h1>📝 内容確認: {selectedDiagnosis.name}</h1>
        <p>{selectedDiagnosis.description}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ 管理パネル</h1>
      <form onSubmit={createDiagnosis} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="診断名" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: '#222', color: '#fff' }}>作成</button>
      </form>
      {loading ? <p>読込中...</p> : (
        <ul>
          {diagnoses.map(d => (
            <li key={d.id} style={{ marginBottom: '10px' }}>
              {d.name} 
              <button onClick={() => goToEdit(d)} style={{ marginLeft: '10px' }}>確認</button>
              <button onClick={() => window.open('https://diagnosis-admin-questions.vercel.app/', '_blank')} style={{ marginLeft: '10px' }}>admin2</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 🌟 Appコンポーネント: ここでパスワード入力を画面として出す
export default function App() {
  const [pass, setPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === "tdiagnosise2026") {
      setIsAuthenticated(true);
    } else {
      alert("パスワードが違います");
    }
  };

  // パスワードが通るまでは入力画面を出す
  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <form onSubmit={checkPass} style={{ padding: '40px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <h2>管理パスワード</h2>
          <input 
            type="password" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)} 
            style={{ padding: '10px', width: '200px', marginBottom: '10px', display: 'block' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '5px' }}>
            ログイン
          </button>
        </form>
      </div>
    );
  }

  // 認証されたら本体を表示
  return <AdminMain />;
}