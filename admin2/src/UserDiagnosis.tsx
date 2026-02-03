import React, { useState, useEffect } from 'react';

const API_BASE = "https://diagnosis-app-final.onrender.com/api";

const UserDiagnosis: React.FC = () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; 

  const [questions, setQuestions] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]); // 選択肢用の箱を追加

  const fetchData = async () => {
    // 質問と選択肢を両方取ってくる
    const qRes = await fetch(`${API_BASE}/questions?diagnosis_id=${id}`);
    setQuestions(await qRes.json() || []);
    
    const cRes = await fetch(`${API_BASE}/choices`);
    setChoices(await cRes.json() || []);
  };

  useEffect(() => { fetchData(); }, [id]);

  const addQuestion = async () => {
    const text = window.prompt("質問文を入力してください");
    if(!text) return;
    await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ diagnosis_id: id, question_text: text })
    });
    fetchData();
  };

  const deleteQuestion = async (qId: number) => {
    if(!window.confirm("この質問を消しますか？")) return;
    await fetch(`${API_BASE}/questions/${qId}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>診断編集 (ID: {id})</h1>
      <button onClick={addQuestion} style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}>+ 質問追加</button>
      
      {questions.map((q: any) => (
        <div key={q.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>ID: {q.id} - {q.question_text}</h3>
            <button onClick={() => deleteQuestion(q.id)} style={{ color: "red", border: "1px solid red", background: "none", padding: "2px 8px", cursor: "pointer", borderRadius: "4px" }}>削除</button>
          </div>

          {/* ロジック表示用の表 */}
          <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>回答内容</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>飛ばし先ID</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>結果ラベル</th>
              </tr>
            </thead>
            <tbody>
              {choices.filter(c => c.question_id === q.id).map((c: any) => (
                <tr key={c.id}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.choice_text}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.next_question_id || "-"}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.label || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: "10px", fontSize: "12px" }}>+ ロジック追加 (準備中)</button>
        </div>
      ))}
    </div>
  );
};
export default UserDiagnosis;