import React, { useState, useEffect } from 'react';

// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function AdminView() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]);

  const [qText, setQText] = useState("");
  const [cText, setCText] = useState("");
  const [cQId, setCQId] = useState("");
  const [cNext, setCNext] = useState("");
  const [cLabel, setCLabel] = useState("");
  
  const [resLabel, setResLabel] = useState("");
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resImg, setResImg] = useState("");
  const [resLine, setResLine] = useState("");
  const [resInfo, setResInfo] = useState("");

  useEffect(() => {
    const checkPassword = async () => {
// 🌟 ここにデバッグ用の表示を1行追加（接続先が見えるようになります）
      const pass = prompt(`管理者パスワードを入力してください\n(接続先: ${API_BASE || "未設定"})`);
        if (!pass) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/verify-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
// 🌟 通信結果を詳しく知るためにここを少し書き換え
        const data = await res.json() as { success: boolean };
        
        if (res.ok && data.success) {
          setIsAdmin(true);
          loadDiagnoses();
        } else {
          // 🌟 失敗した理由を表示するように変更
          alert(`認証失敗。サーバー応答: ${JSON.stringify(data)}`);
          window.location.href = "/";
        }
      } catch (e) {
        // 🌟 エラー内容を詳しく表示するように変更
        alert(`接続エラー！\n接続先: ${API_BASE}/verify-password\nエラー: ${e}`);
        window.location.href = "/";
      }
    };
    checkPassword();
  }, []);
  const loadDiagnoses = () => {
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(setDiagnoses);
  };

  const startEdit = async (id: number) => {
    setEditingId(id);
    const qData = await fetch(`${API_BASE}/questions?diagnosis_id=${id}`).then(r => r.json());
    setQuestions(qData);
    const rData = await fetch(`${API_BASE}/results?diagnosis_id=${id}`).then(r => r.json());
    setResults(rData);
    const cData = await fetch(`${API_BASE}/choices`).then(r => r.json());
    setChoices(cData);
  };

  const deleteItem = async (type: string, id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE' });
    if (type === 'diagnoses') loadDiagnoses();
    else if (editingId) startEdit(editingId);
  };

  const saveQuestion = async () => {
    await fetch(`${API_BASE}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosis_id: editingId, question_text: qText })
    });
    setQText(""); startEdit(editingId!);
  };

  const saveChoice = async () => {
    await fetch(`${API_BASE}/choices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: cQId, choice_text: cText, next_question_id: cNext || null, label: cLabel || null })
    });
    setCText(""); setCNext(""); setCLabel(""); startEdit(editingId!);
  };

  const saveResult = async () => {
    await fetch(`${API_BASE}/results`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        diagnosis_id: editingId, label: resLabel, title: resTitle, 
        description: resDesc, image_url: resImg, external_url: resLine, info_url: resInfo 
      })
    });
    setResLabel(""); setResTitle(""); setResDesc(""); setResImg(""); setResLine(""); setResInfo("");
    startEdit(editingId!);
  };

  if (!isAdmin) return <div style={{ padding: '50px', textAlign: 'center' }}>認証を確認中...</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa' }}>
      <h1 style={{ color: '#333', borderLeft: '8px solid #ff8e8e', paddingLeft: '15px' }}>診断システム管理パネル</h1>

      <section style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>新しい診断を登録</h3>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="診断タイトル" style={{ padding: '10px', width: '300px', marginRight: '10px' }} />
        <button onClick={async () => {
          if(!newTitle) return;
          await fetch(`${API_BASE}/diagnoses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTitle }) });
          setNewTitle(""); loadDiagnoses();
        }} style={{ backgroundColor: '#ff8e8e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>＋ 診断作成</button>
        
        <div style={{ marginTop: '20px' }}>
          {diagnoses.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <span><strong>ID: {d.id}</strong> ― {d.name}</span>
              <div>
                <button onClick={() => startEdit(d.id)} style={{ marginRight: '8px' }}>内容編集</button>
                <button onClick={() => deleteItem('diagnoses', d.id)} style={{ color: 'red', border: '1px solid red', background: 'none', cursor: 'pointer' }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingId && (
        <div style={{ background: 'white', padding: '35px', borderRadius: '15px', border: '3px solid #ff8e8e', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0 }}>📋 編集中の診断 ID: {editingId}</h2>
            <button onClick={() => setEditingId(null)} style={{ padding: '10px 25px' }}>編集を終了する</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <div style={{ background: '#fefefe', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', marginBottom: '20px' }}>
                <h4 style={{ color: '#ff8e8e' }}>1. 質問の追加</h4>
                <textarea value={qText} onChange={e => setQText(e.target.value)} placeholder="質問内容を入力してください" style={{ width: '100%', height: '60px', marginBottom: '10px' }} />
                <button onClick={saveQuestion} style={{ width: '100%', background: '#ff8e8e', color: 'white', border: 'none', padding: '10px' }}>質問を保存</button>
              </div>

              <div style={{ background: '#fefefe', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
                <h4 style={{ color: '#4a90e2' }}>2. 選択肢（ロジック）の設定</h4>
                <select onChange={e => setCQId(e.target.value)} value={cQId} style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
                  <option value="">どの質問にボタンを付けますか？</option>
                  {questions.map(q => <option key={q.id} value={q.id}>ID:{q.id} 「{q.question_text.substring(0,15)}...」</option>)}
                </select>
                <input value={cText} onChange={e => setCText(e.target.value)} placeholder="ボタンの文字" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input value={cNext} onChange={e => setCNext(e.target.value)} placeholder="次に行く質問ID" style={{ flex: 1, padding: '8px' }} />
                  <input value={cLabel} onChange={e => setCLabel(e.target.value)} placeholder="結果ラベル(Aなど)" style={{ flex: 1, padding: '8px' }} />
                </div>
                <button onClick={saveChoice} style={{ width: '100%', background: '#4a90e2', color: 'white', border: 'none', padding: '10px' }}>選択肢を保存</button>
              </div>
            </div>

            <div style={{ background: '#fff9f9', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
              <h4 style={{ color: '#2d3436' }}>3. 結果パターンの作成</h4>
              <input placeholder="ラベル (例: A)" value={resLabel} onChange={e => setResLabel(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="結果のタイトル" value={resTitle} onChange={e => setResTitle(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="結果の説明文" value={resDesc} onChange={e => setResDesc(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '8px' }} />
              <input placeholder="画像URL" value={resImg} onChange={e => setResImg(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="LINE相談URL" value={resLine} onChange={e => setResLine(e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="詳細情報のURL" value={resInfo} onChange={e => setResInfo(e.target.value)} style={{ width: '100%', marginBottom: '15px' }} />
              <button onClick={saveResult} style={{ width: '100%', background: '#2d3436', color: 'white', border: 'none', padding: '12px', fontSize: '16px' }}>結果パターンを保存</button>
            </div>
          </div>

          <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h5>登録済み質問 ＆ 選択肢</h5>
              {questions.map(q => (
                <div key={q.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>ID:{q.id} ― {q.question_text}</strong>
                    <button onClick={() => deleteItem('questions', q.id)} style={{ color: 'red', border: 'none', background: 'none' }}>削除</button>
                  </div>
                  <div style={{ marginTop: '8px', paddingLeft: '15px' }}>
                    {choices.filter(c => c.question_id === q.id).map(c => (
                      <div key={c.id} style={{ fontSize: '12px', color: '#666', background: '#f9f9f9', padding: '4px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>「{c.choice_text}」 {c.label ? `→ [${c.label}]` : `→ [ID:${c.next_question_id}]`}</span>
                        <button onClick={() => deleteItem('choices', c.id)} style={{ border: 'none', background: 'none' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h5>登録済み結果</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {results.map(r => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <button onClick={() => deleteItem('results', r.id)} style={{ position: 'absolute', right: '5px', top: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px' }}>×</button>
                    {r.image_url && <img src={r.image_url} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />}
                    <div style={{ padding: '5px' }}>
                      <div style={{ fontSize: '10px', color: '#ff8e8e' }}>{r.label}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{r.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}