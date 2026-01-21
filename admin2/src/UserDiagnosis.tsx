import { useState, useEffect } from 'react';

export default function UserDiagnosis({ diagnosisId }: { diagnosisId: number }) {
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const API_BASE = "https://diagnosis-app-final.onrender.com/api";

  // データの読み込み
  useEffect(() => {
    if (!diagnosisId) return;
    // 診断タイトルの取得
    fetch(`${API_BASE}/diagnoses`).then(res => res.json()).then(list => {
      const current = list.find((d: any) => d.id === diagnosisId);
      if (current) setDiagnosisTitle(current.title);
    });
    loadData();
  }, [diagnosisId]);

  const loadData = () => {
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/diagnoses/${diagnosisId}/results`).then(res => res.json()).then(setResults);
  };

  // --- 質問・選択肢の操作 ---
  const addQuestion = () => {
    const text = prompt("新しい質問文を入力してください");
    if (text) {
      fetch(`${API_BASE}/questions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis_set_id: diagnosisId, question_text: text })
      }).then(loadData);
    }
  };

  const addChoice = (qId: number) => {
    const text = prompt("選択肢のテキスト (例: はい)");
    const nextId = prompt("次に飛ばす質問ID (結果へ行くなら 0)");
    const label = prompt("結果ラベル (結果へ行く場合のみ入力 例: A)");
    if (text) {
      fetch(`${API_BASE}/choices`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: qId, choice_text: text, next_question_id: parseInt(nextId || "0"), label: label || "" })
      }).then(loadData);
    }
  };

  // --- 結果の操作 ---
  const addResult = () => {
    const label = prompt("紐付けるラベル (例: A)");
    const title = prompt("結果のタイトル");
    if (label && title) {
      fetch(`${API_BASE}/results`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          diagnosis_set_id: diagnosisId, type_label: label, result_title: title,
          result_description: "説明をここに入力", image_url: "", recommend_url: "", detail_url: ""
        })
      }).then(loadData);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🛠 診断編集エディタ</h1>
        <p style={{ color: '#666' }}>編集中の診断: <strong>{diagnosisTitle || "読み込み中..."} (ID: {diagnosisId})</strong></p>
      </header>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* --- 左側：質問とロジック作成 --- */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>1. 質問とロジック</h2>
            <button onClick={addQuestion} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ 質問追加</button>
          </div>
          
          {questions.map((q) => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>[質問 ID: {q.id}] {q.question_text}</div>
              <div style={{ marginLeft: '10px' }}>
                <button onClick={() => addChoice(q.id)} style={{ fontSize: '11px', marginBottom: '10px' }}>+ 選択肢を追加</button>
                {/* 選択肢の簡易リスト表示（実際はAPIから取得して表示するループが必要） */}
                <p style={{ fontSize: '12px', color: '#999' }}>※選択肢を登録するとDBに保存され、診断に反映されます。</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- 右側：結果ページ作成 --- */}
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>2. 結果ページ設定</h2>
            <button onClick={addResult} style={{ backgroundColor: '#17a2b8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ 結果追加</button>
          </div>

          {results.map((r) => (
            <div key={r.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <div style={{ marginBottom: '10px' }}><strong>ラベル: {r.type_label}</strong></div>
              <input type="text" defaultValue={r.result_title} style={{ width: '100%', marginBottom: '5px' }} placeholder="タイトル" />
              <textarea defaultValue={r.result_description} style={{ width: '100%', height: '60px', marginBottom: '5px' }} placeholder="説明文" />
              <input type="text" defaultValue={r.image_url} style={{ width: '100%', marginBottom: '5px' }} placeholder="画像URL" />
              <input type="text" defaultValue={r.recommend_url} style={{ width: '100%', marginBottom: '5px' }} placeholder="LINE登録URL" />
              <input type="text" defaultValue={r.detail_url} style={{ width: '100%' }} placeholder="その他詳細URL" />
              <button style={{ marginTop: '10px', fontSize: '11px', backgroundColor: '#333', color: '#fff' }}>内容を更新して保存</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}