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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const password = prompt("管理パスワードを入力してください");
    if (password === "tdiagnosise2026") { // ← ここにパスワードを設定
      setIsAuthenticated(true);
    } else {
      alert("パスワードが違います");
      window.location.reload();
    }
  }, []);

  if (!isAuthenticated) return <div>認証中...</div>;
  const [diagnoses, setDiagnoses] = useState<DiagnosisSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDetailUrl, setNewDetailUrl] = useState(''); // 追加済み
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
        image_url: newImageUrl, // 👈 ここにカンマを追加しました
        detail_url: newDetailUrl // 👈 正しく認識されるようになります
      })
    })
    .then(() => {
      setNewName('');
      setNewDescription('');
      setNewImageUrl('');
      setNewDetailUrl('');
      fetchDiagnoses();
      alert('診断セットを作成しました！');
    })
    .catch(err => console.error("作成エラー:", err));
  };

  const deleteDiagnosis = (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}`, { method: 'DELETE' })
    .then(() => fetchDiagnoses())
    .catch(err => console.error("削除エラー:", err));
  };

  if (viewMode === 'edit' && selectedDiagnosis) {
    return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={goBack} style={{ marginBottom: '20px', cursor: 'pointer' }}>← 一覧に戻る</button>
        <h1>📝 診断の詳細確認</h1>
        <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
          <p><strong>診断名:</strong> {selectedDiagnosis.name}</p>
          <p><strong>説明文:</strong> {selectedDiagnosis.description}</p>
          {selectedDiagnosis.image_url && (
            <p><strong>トップ画像:</strong><br/><img src={selectedDiagnosis.image_url} style={{maxWidth: '200px', marginTop: '10px'}} /></p>
          )}
          {selectedDiagnosis.detail_url && (
            <p><strong>詳細URL:</strong><br/><a href={selectedDiagnosis.detail_url} target="_blank" rel="noreferrer">{selectedDiagnosis.detail_url}</a></p>
          )}
        </div>
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <p>💡 質問の追加や分岐の設定は、<b>admin2</b> の画面で行ってください。</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ 診断システム 管理パネル(Top設定)</h1>
      
      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>🌟 新しい診断セットを追加</h3>
        <form onSubmit={createDiagnosis} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)} 
            placeholder="診断タイトルを入力"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <textarea 
            value={newDescription} onChange={(e) => setNewDescription(e.target.value)} 
            placeholder="お客様へのメッセージ・説明文"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
          />
          <input 
            type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} 
            placeholder="トップ画像のURL"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text" value={newDetailUrl} onChange={(e) => setNewDetailUrl(e.target.value)} 
            placeholder="「詳しく見る」ボタンの遷移先URLを入力"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <button type="submit" style={{ padding: '12px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            診断セットを作成する
          </button>
        </form>
      </section>

      <hr />
      
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h2>現在のリスト ({diagnoses.length}件)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>診断名</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{d.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.name}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => goToEdit(d)} style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      内容確認
                    </button>
                    <button 
onClick={() => window.open(`https://diagnosis-admin-questions.vercel.app/`, '_blank')}
style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      質問を編集 (admin2)
                    </button>
                    <button onClick={() => deleteDiagnosis(d.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;