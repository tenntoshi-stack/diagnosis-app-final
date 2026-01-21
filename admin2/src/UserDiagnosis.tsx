import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  const loadData = () => {
    if (!diagnosisId) return;
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(list => {
      const current = list.find((d: any) => d.id === diagnosisId);
      if (current) setDiagnosisTitle(current.title);
    });
    // 質問と結果を読み込み
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
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
    const nextId = prompt("次に進む質問ID (結果へ行くなら 0)");
    const label = prompt("結果ラベル (結果へ行く場合のみ入力 例: A)");
    if (!text) return;
    await fetch(`${API_BASE}/choices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: qId, choice_text: text, next_question_id: parseInt(nextId || "0"), label: label || "" })
    });
    loadData(); // 🌟 保存後にリストを再読込して表示に反映
  };

  // 🌟 1. 新しい「結果ラベル」を作成する機能
  const addResultLabel = async () => {
    const label = prompt("新しいラベル名を入力してください (例: henna_expert)");
    const title = prompt("その結果の初期タイトル (例: ヘナ上級者タイプ)");
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
        {/* 左側：質問とロジック（登録内容が見えるように修正） */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h2>1. 質問と選択肢（ロジック）</h2>
          <button onClick={addQuestion} style={{ backgroundColor: '#28a745', color: '#fff', marginBottom: '15px' }}>+ 質問追加</button>
          
          {questions.map(q => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold' }}>Q{q.id}: {q.question_text}</div>
              {/* 🌟 登録済みの選択肢をリスト表示 */}
              <div style={{ fontSize: '12px', color: '#555', marginTop: '5px', paddingLeft: '10px' }}>
                {q.choices && q.choices.map((c: any) => (
                  <div key={c.id}>・{c.choice_text} → {c.next_question_id === 0 ? `結果[${c.label}]` : `次Q[${c.next_question_id}]`}</div>
                ))}
              </div>
              <button onClick={() => addChoice(q.id)} style={{ marginTop: '5px', fontSize: '11px' }}>+ 選択肢/ロジック追加</button>
            </div>
          ))}
        </div>

        {/* 右側：結果設定（ラベル追加ボタンを新設） */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>2. 結果ページ設定</h2>
            <button onClick={addResultLabel} style={{ backgroundColor: '#17a2b8', color: '#fff', height: 'fit-content' }}>+ 新しい結果ラベルを作る</button>
          </div>

          {results.map(r => (
            <div key={r.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', backgroundColor: '#fafafa' }}>
              <div style={{ fontWeight: 'bold', color: '#d9534f' }}>ラベル: {r.type_label}</div>
              <label style={{ fontSize: '11px' }}>タイトル</label>
              <input type="text" id={`t-${r.id}`} defaultValue={r.result_title} style={{ width: '100%' }} />
              <label style={{ fontSize: '11px' }}>説明</label>
              <textarea id={`d-${r.id}`} defaultValue={r.result_description} style={{ width: '100%' }} />
              <label style={{ fontSize: '11px' }}>画像URL</label>
              <input type="text" id={`i-${r.id}`} defaultValue={r.image_url} style={{ width: '100%' }} />
              <label style={{ fontSize: '11px' }}>LINE/詳細URL</label>
              <input type="text" id={`r-${r.id}`} defaultValue={r.recommend_url} style={{ width: '100%' }} />
              <button onClick={() => {
                const data = {
                  result_title: (document.getElementById(`t-${r.id}`) as any).value,
                  result_description: (document.getElementById(`d-${r.id}`) as any).value,
                  image_url: (document.getElementById(`i-${r.id}`) as any).value,
                  recommend_url: (document.getElementById(`r-${r.id}`) as any).value,
                };
                updateResult(r.id, data);
              }} style={{ marginTop: '5px', backgroundColor: '#5bc0de', color: '#fff' }}>保存</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}