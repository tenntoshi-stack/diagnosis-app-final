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

// 🌟 1. 認証専用のコンポーネントを外側に作成
function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
  useEffect(() => {
    const password = prompt("管理パスワードを入力してください");
    if (password === "tdiagnosise2026") {
      onAuthenticated();
    } else {
      alert("パスワードが違います");
      window.location.reload();
    }
  }, [onAuthenticated]);

  return <div style={{ padding: '50px', textAlign: 'center' }}>認証中...</div>;
}

// 🌟 2. メインの管理画面
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
      alert('診断セットを作成しました！');
    });
  };

  const deleteDiagnosis = (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}`, { method: 'DELETE' })
    .then(() => fetchDiagnoses());
  };

  if (viewMode === 'edit' && selectedDiagnosis) {
    return (
      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={goBack}>← 一覧に戻る</button>
        <h1>📝 診断の詳細確認</h1>
        <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
          <p><strong>診断名:</strong> {selectedDiagnosis.name}</p>
          <p><strong>説明文:</strong> {selectedDiagnosis.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ 診断システム 管理パネル(Top設定)</h1>
      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>🌟 新しい診断セットを追加</h3>
        <form onSubmit={createDiagnosis} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="診断タイトル" />
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="説明文" />
          <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="画像URL" />
          <input value={newDetailUrl} onChange={(e) => setNewDetailUrl(e.target.value)} placeholder="詳細URL" />
          <button type="submit" style={{ backgroundColor: '#222', color: 'white', padding: '12px' }}>作成する</button>
        </form>
      </section>

      {loading ? <p>読み込み中...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: 'white' }}>
              <th>ID</th><th>診断名</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>
                  <button onClick={() => goToEdit(d)}>確認</button>
                  <button onClick={() => window.open('https://diagnosis-admin-questions.vercel.app/', '_blank')}>admin2</button>
                  <button onClick={() => deleteDiagnosis(d.id)} style={{ color: 'red' }}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 🌟 3. App コンポーネントで切り替える
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // パスワードがまだなら Auth画面、パスワードが通れば AdminMain画面を表示
  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AdminMain />;
}