import React, { useState, useEffect } from 'react';

const API_BASE = "https://diagnosis-app-final.onrender.com/api";

const UserDiagnosis: React.FC = () => {
  // useParamsの代わりに、現在のURLの末尾から直接IDを取得する
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; 

  const [diagnosisName, setDiagnosisName] = useState("診断の編集");
  const [questions, setQuestions] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  // 以降の fetchData や return 部分は、以前の「頑丈な」コードと同じで大丈夫です。
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    // 診断名の取得
    try {
      const res = await fetch(`${API_BASE}/diagnoses/${id}`);
      const data = await res.json();
      if (data && data.name) setDiagnosisName(data.name);
    } catch (e) { console.log("診断名なし"); }

    // 質問一覧の取得
    try {
      const res = await fetch(`${API_BASE}/questions?diagnosis_id=${id}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) { setQuestions([]); }

    // 選択肢（ロジック）の取得
    try {
      const res = await fetch(`${API_BASE}/choices`);
      const data = await res.json();
      setChoices(Array.isArray(data) ? data : []);
    } catch (e) { setChoices([]); }

    // 結果ラベルの取得
    try {
      const res = await fetch(`${API_BASE}/results?diagnosis_id=${id}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (e) { setResults([]); }
  };

  // 削除機能
  const handleDelete = async (url: string) => {
    if (!window.confirm("削除しますか？")) return;
    await fetch(url, { method: 'DELETE' });
    fetchData();
  };

  // 追加機能
  const handleAddQuestion = async () => {
    const text = window.prompt("質問文を入力");
    if (!text) return;
    await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_id: id, question_text: text })
    });
    fetchData();
  };

  const handleAddChoice = async (qId: number) => {
    const text = window.prompt("回答内容 (例: はい)");
    const nextId = window.prompt("飛ばし先質問ID (空欄OK)");
    const label = window.prompt("結果ラベル (空欄OK)");
    if (!text) return;
    await fetch(`${API_BASE}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: qId, choice_text: text, next_question_id: nextId ? parseInt(nextId) : null, label: label || null })
    });
    fetchData();
  };

  return (
    <div style={{ padding: "20px", display: "flex", gap: "20px", fontFamily: "sans-serif" }}>
      <div style={{ flex: 1 }}>
        <h1>{diagnosisName}</h1>
        <button onClick={handleAddQuestion} style={{ padding: "8px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}>+ 質問追加</button>
        
        {questions.map(q => (
          <div key={q.id} style={{ border: "1px solid #ddd", padding: "15px", marginTop: "15px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>ID: {q.id} - {q.question_text}</strong>
              <button onClick={() => handleDelete(`${API_BASE}/questions/${q.id}`)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>削除</button>
            </div>
            <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                  <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>回答内容</th>
                  <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>次ID</th>
                  <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>結果</th>
                  <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>消去</th>
                </tr>
              </thead>
              <tbody>
                {choices.filter(c => c.question_id === q.id).map(c => (
                  <tr key={c.id}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{c.choice_text}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{c.next_question_id || "-"}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{c.label || "-"}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                      <button onClick={() => handleDelete(`${API_BASE}/choices/${c.id}`)} style={{ color: "red", border: "none", background: "none" }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => handleAddChoice(q.id)} style={{ marginTop: "10px", fontSize: "12px" }}>+ ロジック追加</button>
          </div>
        ))}
      </div>

      <div style={{ width: "300px", background: "#fdfdfd", padding: "15px", borderLeft: "1px solid #eee" }}>
        <h2>結果ラベル</h2>
        {results.map(r => (
          <div key={r.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #eee", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{r.label}</strong>
              <button onClick={() => handleDelete(`${API_BASE}/results/${r.id}`)} style={{ color: "red", fontSize: "12px" }}>削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDiagnosis;