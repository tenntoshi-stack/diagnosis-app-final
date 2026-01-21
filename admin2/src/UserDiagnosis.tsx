import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [allChoices, setAllChoices] = useState<any[]>([]);
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  const loadData = () => {
    if (!diagnosisId) return;
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(list => {
      const current = list.find((d: any) => d.id === diagnosisId);
      if (current) setDiagnosisTitle(current.title);
    });
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
    fetch(`${API_BASE}/choices`).then(res => res.json()).then(setAllChoices);
  };

  useEffect(() => { loadData(); }, [diagnosisId]);

  const addChoice = async (qId: number) => {
    const text = prompt("回答内容 (例: はい)");
    if (!text) return;
    const nextId = prompt("次に飛ばす質問ID (結果へ行くなら 0)");
    const label = prompt("結果ラベル (結果へ行く場合のみ入力 例: A)");
    
    await fetch(`${API_BASE}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question_id: qId, 
        choice_text: text, 
        next_question_id: parseInt(nextId || "0"), 
        label: label || "" 
      })
    });
    loadData();
  };

  const updateResult = async (id: number, data: any) => {
    await fetch(`${API_BASE}/results/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert("保存しました");
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #333' }}>
        <h1>🛠 診断ロジック・結果編集</h1>
        <p>編集中の診断: <strong>{diagnosisTitle} (ID: {diagnosisId})</strong></p>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* --- 左側：質問と3つの窓（ロジック） --- */}
        <div style={{ flex: 1.2, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h2>1. 質問と回答ロジック設定</h2>
          {questions.map(q => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px', color: '#333' }}>
                Q ID:{q.id} ： {q.question_text}
              </div>
              
              {/* ロジック表示用の3つの窓（ヘッダー） */}
              <div style={{ display: 'flex', backgroundColor: '#eee', padding: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                <div style={{ flex: 2 }}>回答内容</div>
                <div style={{ flex: 1 }}>飛ばし先ID</div>
                <div style={{ flex: 1 }}>結果ラベル</div>
              </div>

              {/* 登録済みデータの流し込み */}
              {allChoices.filter(c => c.question_id === q.id).map(c => (
                <div key={c.id} style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '5px', fontSize: '14px' }}>
                  <div style={{ flex: 2 }}>{c.choice_text}</div>
                  <div style={{ flex: 1 }}>{c.next_question_id !== 0 ? c.next_question_id : '-'}</div>
                  <div style={{ flex: 1, color: 'red' }}>{c.label || '-'}</div>
                </div>
              ))}

              <button onClick={() => addChoice(q.id)} style={{ marginTop: '10px', cursor: 'pointer' }}>+ 回答・ロジックを追加</button>
            </div>
          ))}
        </div>

        {/* --- 右側：結果詳細設定 --- */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h2>2. 結果ページ詳細設定</h2>
          {results.map(r => (
            <div key={r.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#d9534f' }}>ラベル: {r.type_label}</div>
              <label style={{ fontSize: '11px' }}>結果タイトル</label>
              <input type="text" id={`t-${r.id}`} defaultValue={r.result_title} style={{ width: '100%', marginBottom: '8px' }} />
              <label style={{ fontSize: '11px' }}>説明文</label>
              <textarea id={`d-${r.id}`} defaultValue={r.result_description} style={{ width: '100%', height: '50px', marginBottom: '8px' }} />
              <label style={{ fontSize: '11px' }}>画像URL</label>
              <input type="text" id={`i-${r.id}`} defaultValue={r.image_url} style={{ width: '100%', marginBottom: '8px' }} />
              <label style={{ fontSize: '11px' }}>LINE登録URL</label>
              <input type="text" id={`r-${r.id}`} defaultValue={r.recommend_url} style={{ width: '100%', marginBottom: '8px' }} />
              <label style={{ fontSize: '11px' }}>その他のURL</label>
              <input type="text" id={`u-${r.id}`} defaultValue={r.detail_url} style={{ width: '100%', marginBottom: '8px' }} />
              <button onClick={() => {
                const data = {
                  result_title: (document.getElementById(`t-${r.id}`) as any).value,
                  result_description: (document.getElementById(`d-${r.id}`) as any).value,
                  image_url: (document.getElementById(`i-${r.id}`) as any).value,
                  recommend_url: (document.getElementById(`r-${r.id}`) as any).value,
                  detail_url: (document.getElementById(`u-${r.id}`) as any).value,
                };
                updateResult(r.id, data);
              }} style={{ backgroundColor: '#5bc0de', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>保存</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}