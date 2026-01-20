import { useState, useEffect } from 'react'

// --- 型定義 ---
interface DiagnosisSet {
  id: number;
  name: string;
  description: string;
  image_url: string;
  detail_url: string;
  is_public: number;
  created_at: string;
}

// --- 1. 管理画面の本体 ---
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
        name: newName, description: newDescription, 
        image_url: newImageUrl, detail_url: newDetailUrl 
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
      <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={goBack} style={{ marginBottom: '20px', cursor: 'pointer' }}>← 一覧に戻る</button>
        <h1>📝 診断の詳細確認</h1>
        <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
          <p><strong>診断名:</strong> {selectedDiagnosis.name}</p>
          <p><strong>説明文:</strong> {selectedDiagnosis.description}</p>
          {selectedDiagnosis.image_url && <p><img src={selectedDiagnosis.image_url} style={{maxWidth: '200px'}} /></p>}
          {selectedDiagnosis.detail_url && <p><strong>詳細URL:</strong> {selectedDiagnosis.detail_url}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ 診断システム 管理パネル</h1>
      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>🌟 新しい診断セットを追加</h3>
        <form onSubmit={createDiagnosis} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="診断タイトル" style={{ padding: '10px' }} />
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="説明文" style={{ padding: '10px', minHeight: '80px' }} />
          <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="トップ画像URL" style={{ padding: '10px' }} />
          <input value={newDetailUrl} onChange={(e) => setNewDetailUrl(e.target.value)} placeholder="詳しく見るURL" style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>作成する</button>
        </form>
      </section>
      {loading ? <p>読み込み中...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th><th style={{ padding: '12px' }}>診断名</th><th style={{ padding: '12px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{d.id}</td>
                <td style={{ padding: '12px' }}>{d.name}</td>
                <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
{/* 1. 「表示確認」ボタン：お客さんが見る診断画面へ飛ばす */}
<button 
  onClick={() => window.location.href = `https://diagnosis-app-final-fyfc.vercel.app/diagnosis/${d.id}`}
  style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
>
  表示確認
</button>

{/* 2. 「質問編集」ボタン（新設）：Admin2（編集画面）へ飛ばす */}
<button 
  onClick={() => window.location.href = `https://diagnosis-admin-questions.vercel.app/${d.id}`}
  style={{ backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginLeft: '5px' }}
>
  質問編集
</button>
                  {/* 🌟 ここに正しく配置しました */}
                  <button 
onClick={() => window.location.href = `https://diagnosis-admin-questions.vercel.app/${d.id}`}
style={{ backgroundColor: '#ffc107', color: 'black', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    質問編集
                  </button>

                  <button onClick={() => deleteDiagnosis(d.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- 2. Appコンポーネント ---
export default function App() {
  const [emailInput, setEmailInput] = useState(''); // 🌟 メールアドレス用の変数を追加
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

// --- 新規登録の処理 ---
  const handleRegister = () => {
    if (!emailInput || !passwordInput) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }
    // ブラウザに保存（VS Code上にパスワードを固定しない）
    localStorage.setItem('admin_user', JSON.stringify({ email: emailInput, password: passwordInput }));
    alert("新規登録が完了しました！この情報でログインしてください。");
  };

  // --- ログインの処理 ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 保存されている情報を取得
    const savedUser = localStorage.getItem('admin_user');
    
    if (savedUser) {
      const { email, password } = JSON.parse(savedUser);
      // 入力された内容と保存された内容を照合
      if (emailInput === email && passwordInput === password) {
        setIsAuthenticated(true);
        return;
      }
    }
    alert("登録されている情報と一致しません。");
  };

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ padding: '40px', background: '#fff', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>管理ログイン</h2>
          
          <input 
            type="email" 
            placeholder="メールアドレス"
            value={emailInput} 
            onChange={(e) => setEmailInput(e.target.value)} 
            style={{ padding: '12px', width: '250px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', display: 'block' }}
            required
          />

          <input 
            type="password" 
            placeholder="パスワード"
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
            style={{ padding: '12px', width: '250px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', display: 'block' }}
            required
          />
          
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
            ログイン
          </button>

          <button 
            type="button" 
            onClick={handleRegister}
            style={{ width: '100%', padding: '12px', background: '#fff', color: '#ff8e8e', border: '2px solid #ff8e8e', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            新規アカウント登録
          </button>
        </form>
      </div>
    );
  }

  return <AdminMain />;
}