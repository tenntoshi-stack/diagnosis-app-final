import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  const loadData = () => {
    if (!diagnosisId) return;
    // タイトルの取得
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(list => {
      const current = list.find((d: any) => d.id === diagnosisId);
      if (current) setDiagnosisTitle(current.title);
    });
    // 質問と結果の取得
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
  };

  useEffect(() => { loadData(); }, [diagnosisId]);

  // 質問の追加
  const addQuestion = async () => {
    const text = prompt("新しい質問文を入力してください");
    if (!text) return;
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_set_id: diagnosisId, question_text: text })
    });
    if (res.ok) { alert("質問を追加しました"); loadData(); }
  };

  // 選択肢の追加
  const addChoice = async (qId: number) => {
    const text = prompt("選択肢のテキスト (例: はい)");
    const nextId = prompt("次に進む質問ID (結果へ行くなら 0)");
    const label = prompt("結果ラベル (結果へ行く場合のみ入力 例: A)");
    if (!text) return;
    const res = await fetch(`${API_BASE}/choices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question_id: qId, choice_text: text, 
        next_question_id: parseInt(nextId || "0"), label: label || "" 
      })
    });
    if (res.ok) { alert("選択肢を保存しました"); loadData(); }
  };

  // 結果データの更新（保存ボタン用）
  const updateResult = async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/results/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) alert("結果を保存しました");
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🛠 診断編集エディタ</h1>
        <p style={{ color: '#666' }}>編集中の診断: <strong>{diagnosisTitle || "読み込み中..."} (ID: {diagnosisId})</strong></p>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 左側：質問作成 */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>1. 質問と分岐ロジック</h2>
          <button onClick={addQuestion} style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}>+ 新しい質問を追加</button>
          
          {questions.map(q => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold' }}>[質問ID: {q.id}] {q.question_text}</div>
              <button onClick={() => addChoice(q.id)} style={{ marginTop: '10px', cursor: 'pointer' }}>+ 選択肢を追加</button>
            </div>
          ))}
        </div>

        {/* 右側：結果設定 */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>2. 結果ページの詳細設定</h2>
          {results.map(r => (
            <div key={r.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <div style={{ fontWeight: 'bold', color: '#17a2b8', marginBottom: '10px' }}>ラベル: {r.type_label}</div>
              
              <label style={{ fontSize: '12px', display: 'block' }}>結果のタイトル</label>
              <input type="text" id={`t-${r.id}`} defaultValue={r.result_title} style={{ width: '100%', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '12px', display: 'block' }}>商品の説明文</label>
              <textarea id={`d-${r.id}`} defaultValue={r.result_description} style={{ width: '100%', height: '60px', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '12px', display: 'block' }}>商品画像URL</label>
              <input type="text" id={`i-${r.id}`} defaultValue={r.image_url} style={{ width: '100%', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '12px', display: 'block' }}>LINE登録URL</label>
              <input type="text" id={`r-${r.id}`} defaultValue={r.recommend_url} style={{ width: '100%', marginBottom: '10px' }} />

              <button 
                onClick={() => {
                  const data = {
                    result_title: (document.getElementById(`t-${r.id}`) as HTMLInputElement).value,
                    result_description: (document.getElementById(`d-${r.id}`) as HTMLTextAreaElement).value,
                    image_url: (document.getElementById(`i-${r.id}`) as HTMLInputElement).value,
                    recommend_url: (document.getElementById(`r-${r.id}`) as HTMLInputElement).value,
                  };
                  updateResult(r.id, data);
                }}
                style={{ backgroundColor: '#17a2b8', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                この結果を保存する
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}