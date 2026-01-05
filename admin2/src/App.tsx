import { useState, useEffect } from 'react';

// --- 1. 質問編集画面の本体（既存機能をすべて保持） ---
function Admin2Main() {
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQText, setNewQText] = useState('');
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedQ, setSelectedQ] = useState<any>(null);
  const [choiceText, setChoiceText] = useState('');
  const [nextQId, setNextQId] = useState<number>(0);
  const [choiceLabel, setChoiceLabel] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [resLabel, setResLabel] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDetailUrl, setResDetailUrl] = useState(''); 
  const [resImageUrl, setResImageUrl] = useState('');

  const API_BASE = 'https://diagnosis-app-final.onrender.com';

  const fetchDiagnoses = () => {
    fetch(`${API_BASE}/api/diagnoses`).then(res => res.json()).then(setDiagnoses);
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const selectDiagnosis = (d: any) => {
    setSelectedDiagnosis(d);
    fetch(`${API_BASE}/api/diagnoses/${d.id}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/api/diagnoses/${d.id}/results`).then(res => res.json()).then(setResults);
  };

  const addQuestion = () => {
    fetch(`${API_BASE}/api/questions`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ diagnosis_set_id: selectedDiagnosis.id, question_text: newQText })
    }).then(() => { setNewQText(''); selectDiagnosis(selectedDiagnosis); });
  };

  const selectQuestion = (q: any) => {
    setSelectedQ(q);
    fetch(`${API_BASE}/api/questions/${q.id}/choices`).then(res => res.json()).then(setChoices);
  };

  const addChoice = () => {
    fetch(`${API_BASE}/api/choices`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ question_id: selectedQ.id, choice_text: choiceText, next_question_id: nextQId, label: choiceLabel })
    }).then(() => { 
      alert('選択肢を保存しました');
      setChoiceText(''); setChoiceLabel(''); selectQuestion(selectedQ); 
    });
  };

  const addResult = () => {
    fetch(`${API_BASE}/api/results`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        diagnosis_set_id: selectedDiagnosis.id, type_label: resLabel, result_title: resTitle,
        result_description: resDesc, recommend_url: resUrl, image_url: resImageUrl,
        detail_url: resDetailUrl
      })
    }).then(() => { 
      alert('結果を保存しました');
      setResLabel(''); setResTitle(''); setResDesc(''); setResUrl(''); setResImageUrl(''); setResDetailUrl('');
      selectDiagnosis(selectedDiagnosis);
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>診断管理システム (質問編集)</h1>
      <section>
        <h2>1. 診断セットを選択</h2>
        <ul>
          {diagnoses.map(d => (
            <li key={d.id} style={{ marginBottom: '10px' }}>
              <strong>{d.name}</strong>
              <button onClick={() => selectDiagnosis(d)} style={{ marginLeft: '10px' }}>編集する</button>
            </li>
          ))}
        </ul>
      </section>

      {selectedDiagnosis && (
        <div style={{ display: 'flex', gap: '40px', marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <section style={{ flex: 1 }}>
            <h2>2. 質問の追加 ({selectedDiagnosis.name})</h2>
            <input value={newQText} onChange={e => setNewQText(e.target.value)} placeholder="質問文" />
            <button onClick={addQuestion}>追加</button>
            <ul>
              {questions.map(q => (
                <li key={q.id} onClick={() => selectQuestion(q)} style={{ cursor: 'pointer', color: selectedQ?.id === q.id ? 'blue' : 'black' }}>
                  ID:{q.id} - {q.question_text}
                </li>
              ))}
            </ul>

            {selectedQ && (
              <div style={{ background: '#f9f9f9', padding: '15px' }}>
                <h3>選択肢の追加 (質問ID:{selectedQ.id})</h3>
                <input placeholder="選択肢" value={choiceText} onChange={e => setChoiceText(e.target.value)} /><br/>
                <input placeholder="次質問ID" type="number" value={nextQId} onChange={e => setNextQId(parseInt(e.target.value))} /><br/>
                <input placeholder="結果ラベル" value={choiceLabel} onChange={e => setChoiceLabel(e.target.value)} /><br/>
                <button onClick={addChoice}>保存</button>
              </div>
            )}
          </section>

          <section style={{ flex: 1 }}>
            <h2>3. 診断結果の設定</h2>
            <input placeholder="ラベル" value={resLabel} onChange={e => setResLabel(e.target.value)} />
            <input placeholder="タイトル" value={resTitle} onChange={e => setResTitle(e.target.value)} />
            <textarea placeholder="説明" value={resDesc} onChange={e => setResDesc(e.target.value)} />
            <input placeholder="結果個別URL" value={resDetailUrl} onChange={e => setResDetailUrl(e.target.value)} />
            <input placeholder="画像URL" value={resImageUrl} onChange={e => setResImageUrl(e.target.value)} />
            <button onClick={addResult}>保存</button>
          </section>
        </div>
      )}
    </div>
  );
}

// --- 2. Appコンポーネント（パスワード画面） ---
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

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
        <form onSubmit={checkPass} style={{ padding: '40px', background: '#fff', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>編集用ログイン</h2>
          <input 
            type="password" 
            placeholder="パスワードを入力"
            value={pass} 
            onChange={(e) => setPass(e.target.value)} 
            style={{ padding: '12px', width: '250px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            ログイン
          </button>
        </form>
      </div>
    );
  }

  return <Admin2Main />;
}