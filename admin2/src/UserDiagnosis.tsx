import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [allChoices, setAllChoices] = useState<any[]>([]); // 🌟 選択肢を別で管理
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  const loadData = () => {
    if (!diagnosisId) return;
    // タイトルの取得
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(list => {
      const current = list.find((d: any) => d.id === diagnosisId);
      if (current) setDiagnosisTitle(current.title);
    });
    // 質問と結果を取得
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
    // 🌟 全ての選択肢を個別に取得（表示を確実にするため）
    fetch(`${API_BASE}/choices`).then(res => res.json()).then(setAllChoices);
  };

  useEffect(() => { loadData(); }, [diagnosisId]);

  const addQuestion = async () => {
    const text = prompt("新しい質問文を入力してください");
    if (!text) return;
    await fetch(`${API_BASE}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_set_id: diagnosisId, question_text: text })
    });
    loadData();
  };

  const addChoice = async (qId: number) => {
    const text = prompt("選択肢のテキスト (例: はい)");
    if (!text) return;
    const nextId = prompt("次に進む質問ID (結果へ行くなら 0)");
    const label = prompt("結果ラベル (結果へ行く場合のみ入力 例: A)");
    
    await fetch(`${API_BASE}/choices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question_id: qId, 
        choice_text: text, 
        next_question_id: parseInt(nextId || "0"), 
        label: label || "" 
      })
    });
    loadData();
  };

  const addResultLabel = async () => {
    const label = prompt("新しいラベル名 (例: expert)");
    const title = prompt("結果のタイトル");
    if (!label || !title) return;
    await fetch(`${API_BASE}/results`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        diagnosis_set_id: diagnosisId, type_label: label, result_title: title,
        result_description: "", image_url: "", recommend_url: "", detail_url: ""
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
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🛠 診断ロジック・結果編集</h1>
        <p>編集中の診断: <strong>{diagnosisTitle} (ID: {diagnosisId})</strong></p>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 左側：質問とロジック作成 */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h2>1. 質問と分岐ロジック</h2>
            <button onClick={addQuestion} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ 質問追加</button>
          </div>
          
          {questions.map(q => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>[ID: {q.id}] {q.question_text}</div>
              
              <div style={{ marginTop: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>設定済みロジック:</span>
                {/* 🌟 取得した全選択肢の中から、この質問に紐づくものだけを表示 */}
                {allChoices.filter(c => c.question_id === q.id).map(c => (
                  <div key={c.id} style={{ fontSize: '14px', padding: '4px 0', borderBottom: '1px dashed #eee' }}>
                    ・{c.choice_text} → {c.next_question_id === 0 ? <span style={{color:'red'}}>結果[{c.label}]</span> : `次質問ID[${c.next_question_id}]`}
                  </div>
                ))}
              </div>

              <button onClick={() => addChoice(q.id)} style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}>+ 選択肢を追加</button>
            </div>
          ))}
        </div>

        {/* 右側：結果詳細設定 */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h2>2. 結果ページ詳細</h2>
            <button onClick={addResultLabel} style={{ backgroundColor: '#17a2b8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ ラベル追加</button>
          </div>

          {results.map(r => (
            <div key={r.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <div style={{ fontWeight: 'bold', color: '#d9534f', marginBottom: '10px' }}>ラベル: {r.type_label}</div>
              
              <label style={{ fontSize: '11px', display: 'block' }}>結果タイトル</label>
              <input type="text" id={`t-${r.id}`} defaultValue={r.result_title} style={{ width: '100%', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '11px', display: 'block' }}>説明文</label>
              <textarea id={`d-${r.id}`} defaultValue={r.result_description} style={{ width: '100%', height: '60px', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '11px', display: 'block' }}>画像URL</label>
              <input type="text" id={`i-${r.id}`} defaultValue={r.image_url} style={{ width: '100%', marginBottom: '10px' }} />
              
              <label style={{ fontSize: '11px', display: 'block' }}>LINE登録URL</label>
              <input type="text" id={`r-${r.id}`} defaultValue={r.recommend_url} style={{ width: '100%', marginBottom: '10px' }} />

              <label style={{ fontSize: '11px', display: 'block' }}>その他のURL（詳細ページなど）</label>
              <input type="text" id={`u-${r.id}`} defaultValue={r.detail_url} style={{ width: '100%', marginBottom: '10px' }} />

              <button 
                onClick={() => {
                  const data = {
                    result_title: (document.getElementById(`t-${r.id}`) as any).value,
                    result_description: (document.getElementById(`d-${r.id}`) as any).value,
                    image_url: (document.getElementById(`i-${r.id}`) as any).value,
                    recommend_url: (document.getElementById(`r-${r.id}`) as any).value,
                    detail_url: (document.getElementById(`u-${r.id}`) as any).value,
                  };
                  updateResult(r.id, data);
                }}
                style={{ backgroundColor: '#5bc0de', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                保存
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}