import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  useEffect(() => {
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
  }, [diagnosisId]);

  const addQuestion = () => {
    const text = prompt("新しい質問文を入力してください");
    if (!text) return;
    fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_set_id: diagnosisId, question_text: text })
    }).then(() => window.location.reload());
  };

  const addChoice = (qId: number) => {
    const text = prompt("選択肢のテキストを入力");
    const label = prompt("結果ラベル (例: A, B... または未入力)");
    const nextId = prompt("次へ進む質問のID (結果なら 0)");
    if (!text) return;
    fetch(`${API_BASE}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: qId, choice_text: text, label: label || "", next_question_id: parseInt(nextId || "0") })
    }).then(() => window.location.reload());
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1>📝 質問とロジックの編集 (ID: {diagnosisId})</h1>
      
      <section style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>質問一覧と選択肢の設定</h2>
        <button onClick={addQuestion} style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>+ 新しい質問を追加</button>
        
        {questions.map(q => (
          <div key={q.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
            <strong>ID: {q.id} - {q.question_text}</strong>
            <button onClick={() => addChoice(q.id)} style={{ marginLeft: '10px', fontSize: '12px' }}>+ 選択肢追加</button>
            <div style={{ marginLeft: '20px', marginTop: '10px', fontSize: '14px', color: '#666' }}>
              {/* 選択肢の表示ロジック（後ほど拡張可能） */}
              ※ここに現在の選択肢が表示されます
            </div>
          </div>
        ))}
      </section>

      <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>診断結果（ゴール）の設定</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>※結果のラベル（A, Bなど）と、表示するタイトルを紐付けます。</p>
        {/* 結果編集フォーム（後ほど追加可能） */}
      </section>
    </div>
  );
}