import React, { useState, useEffect } from 'react';

const API_BASE = "https://diagnosis-app-final.onrender.com/api";

const UserDiagnosis: React.FC = () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; 

  const [questions, setQuestions] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]); 
  const [results, setResults] = useState<any[]>([]);
  const [editingResult, setEditingResult] = useState<any>(null);

  // データを取得する関数
  const fetchData = async () => {
    try {
      const qRes = await fetch(`${API_BASE}/questions?diagnosis_id=${id}`);
      setQuestions(await qRes.json() || []);
      const cRes = await fetch(`${API_BASE}/choices`);
      setChoices(await cRes.json() || []);
      const rRes = await fetch(`${API_BASE}/results?diagnosis_id=${id}`);
      const rData = await rRes.json() || [];
      setResults(rData);
      
      // 編集中のデータがある場合、一覧から最新の状態を反映
      if (editingResult) {
        const current = rData.find((r: any) => r.id === editingResult.id);
        if (current) setEditingResult(current);
      }
    } catch (e) { console.error("Fetch error:", e); }
  };

  useEffect(() => { fetchData(); }, [id]);

  // --- 質問・回答系関数 ---
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
    if(!window.confirm("質問を削除しますか？")) return;
    await fetch(`${API_BASE}/questions/${qId}`, { method: 'DELETE' });
    fetchData();
  };

  const addChoice = async (qId: number) => {
    const text = window.prompt("回答内容 (例: はい)");
    if (!text) return;
    await fetch(`${API_BASE}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: qId, choice_text: text, next_question_id: null, label: "" })
    });
    fetchData();
  };

  const deleteChoice = async (cId: number) => {
    await fetch(`${API_BASE}/choices/${cId}`, { method: 'DELETE' });
    fetchData(); 
  };

  // --- 結果設定系関数 ---
  const addResult = async () => {
    const label = window.prompt("ラベル名を入力 (例: henna_expert)");
    if (!label) return;
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_id: id, label, title: "新規結果", description: "", image_url: "", external_url: "", info_url: "" })
    });
    // 作成直後にデータを再取得
    await fetchData();
  };

  const saveResult = async () => {
    if (!editingResult) return;
    await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingResult)
    });
    alert("保存しました");
    fetchData();
  };

  const deleteResult = async (rId: number) => {
    if(!window.confirm("この結果設定を削除しますか？")) return;
    await fetch(`${API_BASE}/results/${rId}`, { method: 'DELETE' });
    setEditingResult(null);
    fetchData();
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* 1. 質問と回答ロジック設定 */}
      <div style={{ flex: 1.2, background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>1. 質問と回答ロジック設定</h2>
        <button onClick={addQuestion} style={{ marginBottom: "20px", padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>+ 質問を追加</button>
        
        {questions.map((q: any) => (
          <div key={q.id} style={{ border: "1px solid #eee", padding: "15px", marginBottom: "20px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <strong style={{ fontSize: "16px" }}>[質問ID: {q.id}] {q.question_text}</strong>
              <button onClick={() => deleteQuestion(q.id)} style={{ color: "#dc3545", border: "1px solid #dc3545", background: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "12px" }}>削除</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead style={{ background: "#f1f3f5" }}>
                <tr>
                  <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>回答内容</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>飛ばし先ID</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>結果ラベル</th>
                  <th style={{ border: "1px solid #dee2e6", padding: "8px", width: "30px" }}>消</th>
                </tr>
              </thead>
              <tbody>
                {choices.filter(c => c.question_id === q.id).map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{c.choice_text}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "center" }}>{c.next_question_id || "-"}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "8px", color: "#d63384", fontWeight: "bold" }}>{c.label || "-"}</td>
                    <td style={{ border: "1px solid #dee2e6", padding: "8px", textAlign: "center" }}>
                      <button onClick={() => deleteChoice(c.id)} style={{ color: "#adb5bd", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addChoice(q.id)} style={{ marginTop: "12px", padding: "6px 12px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ced4da", background: "#fff", cursor: "pointer" }}>+ 回答・ロジックを追加</button>
          </div>
        ))}
      </div>

      {/* 2. 結果ページ詳細設定 */}
      <div style={{ flex: 1, background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", position: "sticky", top: "20px", height: "fit-content" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>2. 結果ページ詳細設定</h2>
        <button onClick={addResult} style={{ width: "100%", padding: "12px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>+ 新しい結果（ラベル）を作成</button>
        
        {/* ラベル切り替えボタン一覧 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "25px" }}>
          {results.map((r: any) => (
            <button 
              key={r.id} 
              onClick={() => setEditingResult(r)}
              style={{ padding: "6px 12px", background: editingResult?.id === r.id ? "#dc3545" : "#f1f3f5", color: editingResult?.id === r.id ? "#fff" : "#495057", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
            >
              ラベル: {r.label}
            </button>
          ))}
        </div>

        {editingResult ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", borderTop: "2px solid #f1f3f5", paddingTop: "20px" }}>
            <div style={{ color: "#dc3545", fontWeight: "bold", fontSize: "15px" }}>ラベル: {editingResult.label}</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>結果タイトル</label>
              <input style={{ padding: "10px", border: "1px solid #ced4da", borderRadius: "4px" }} value={editingResult.title || ""} onChange={e => setEditingResult({...editingResult, title: e.target.value})} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>説明文</label>
              <textarea style={{ padding: "10px", border: "1px solid #ced4da", borderRadius: "4px", minHeight: "80px" }} value={editingResult.description || ""} onChange={e => setEditingResult({...editingResult, description: e.target.value})} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>画像URL</label>
              <input style={{ padding: "10px", border: "1px solid #ced4da", borderRadius: "4px" }} value={editingResult.image_url || ""} onChange={e => setEditingResult({...editingResult, image_url: e.target.value})} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>LINE登録URL</label>
              <input style={{ padding: "10px", border: "1px solid #ced4da", borderRadius: "4px" }} value={editingResult.external_url || ""} onChange={e => setEditingResult({...editingResult, external_url: e.target.value})} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>その他のURL（詳細ページなど）</label>
              <input style={{ padding: "10px", border: "1px solid #ced4da", borderRadius: "4px" }} value={editingResult.info_url || ""} onChange={e => setEditingResult({...editingResult, info_url: e.target.value})} />
            </div>
            
            <button onClick={saveResult} style={{ marginTop: "10px", padding: "12px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>保存</button>
            <button onClick={() => deleteResult(editingResult.id)} style={{ color: "#dc3545", background: "none", border: "none", cursor: "pointer", fontSize: "12px", textAlign: "right" }}>[この結果設定を完全に削除]</button>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#adb5bd", marginTop: "30px", fontSize: "14px" }}>
            作成したラベルのボタン（グレー）をクリックすると、<br/>ここに編集フォームが表示されます。
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDiagnosis;