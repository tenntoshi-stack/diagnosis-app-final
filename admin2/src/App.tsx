import { useState, useEffect } from 'react';

function App() {
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null);
  const [newDiagnosisName, setNewDiagnosisName] = useState('');
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQText, setNewQText] = useState('');
  
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedQ, setSelectedQ] = useState<any>(null);
  const [choiceText, setChoiceText] = useState('');
  const [nextQId, setNextQId] = useState<number>(0);
  const [choiceLabel, setChoiceLabel] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [resLabel, setResLabel] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDetailUrl, setResDetailUrl] = useState(''); 
  const [resImageUrl, setResImageUrl] = useState('');

  // 接続先URLを定数として定義
  const API_BASE = 'https://diagnosis-app-final.onrender.com';

  useEffect(() => { fetchDiagnoses(); }, []);

  const fetchDiagnoses = () => {
    fetch(`${API_BASE}/api/diagnoses`).then(res => res.json()).then(setDiagnoses);
  };

  const deleteDiagnosis = (id: number) => {
    if (!confirm('この診断セットを削除してもよろしいですか？関連する質問も表示されなくなります。')) return;
    
    fetch(`${API_BASE}/api/diagnoses/${id}`, {
      method: 'DELETE'
    }).then(() => {
      if (selectedDiagnosis?.id === id) setSelectedDiagnosis(null);
      fetchDiagnoses();
    });
  };

  const deleteQuestion = (id: number) => {
    if (!confirm('この質問を削除しますか？')) return;
    fetch(`${API_BASE}/api/questions/${id}`, { method: 'DELETE' })
      .then(() => selectDiagnosis(selectedDiagnosis));
  };

  const deleteChoice = (id: number) => {
    if (!confirm('この選択肢を削除しますか？')) return;
    fetch(`${API_BASE}/api/choices/${id}`, { method: 'DELETE' })
      .then(() => selectQuestion(selectedQ));
  };

  const deleteResult = (id: number) => {
    if (!confirm('この診断結果を削除しますか？')) return;
    fetch(`${API_BASE}/api/results/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(() => {
      selectDiagnosis(selectedDiagnosis);
    });
  };

  const addDiagnosis = () => {
    fetch(`${API_BASE}/api/diagnoses`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        name: newDiagnosisName, 
        description: "診断の説明をここに入力してください", 
        image_url: "" 
      })
    }).then(() => { setNewDiagnosisName(''); fetchDiagnoses(); });
  };

  const selectDiagnosis = (d: any) => {
    setSelectedDiagnosis(d);
    fetch(`${API_BASE}/api/diagnoses/${d.id}/questions`).then(res => res.json()).then(setQuestions);
    fetch(`${API_BASE}/api/diagnoses/${d.id}/results`).then(res => res.json()).then(setResults);
  };

  const addQuestion = () => {
    fetch(`${API_BASE}/api/questions`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ diagnosis_set_id: selectedDiagnosis.id, question_text: newQText })
    }).then(() => { setNewQText(''); selectDiagnosis(selectedDiagnosis); });
  };

  const selectQuestion = (q: any) => {
    setSelectedQ(q);
    fetch(`${API_BASE}/api/questions/${q.id}/choices`).then(res => res.json()).then(setChoices);
  };

  const addChoice = () => {
    fetch(`${API_BASE}/api/choices`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ question_id: selectedQ.id, choice_text: choiceText, next_question_id: nextQId, label: choiceLabel })
    }).then(() => { 
      alert('選択肢を保存・更新しました'); 
      setChoiceText(''); setChoiceLabel(''); selectQuestion(selectedQ); 
    });
  };

  const addResult = () => {
    fetch(`${API_BASE}/api/results`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        diagnosis_set_id: selectedDiagnosis.id, type_label: resLabel, result_title: resTitle,
        result_description: resDesc, recommend_url: resUrl, image_url: resImageUrl,
        detail_url: resDetailUrl
      })
    }).then(() => { 
      alert('保存・更新が完了しました！'); 
      setResLabel(''); setResTitle(''); setResDesc(''); setResUrl(''); setResImageUrl(''); setResDetailUrl('');
      selectDiagnosis(selectedDiagnosis);
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>診断管理システム (質問編集)</h1>
      
      <section>
        <h2>1. 診断セット作成</h2>
        <input value={newDiagnosisName} onChange={e => setNewDiagnosisName(e.target.value)} placeholder="診断名" />
        <button onClick={addDiagnosis}>作成</button>
        <ul>
          {diagnoses.map(d => (
            <li key={d.id} style={{ marginBottom: '10px' }}>
              <strong style={{ fontSize: '1.1em' }}>{d.name}</strong>
              <button onClick={() => selectDiagnosis(d)} style={{ marginLeft: '10px', cursor: 'pointer' }}>編集</button>
              <button onClick={() => deleteDiagnosis(d.id)} style={{ marginLeft: '10px', color: 'red', cursor: 'pointer', border: '1px solid red', borderRadius: '4px', background: 'white' }}>削除</button>
            </li>
          ))}
        </ul>
      </section>

      {selectedDiagnosis && (
        <div style={{ display: 'flex', gap: '40px' }}>
          <section style={{ flex: 1 }}>
            <h2>2. 質問の追加 ({selectedDiagnosis.name})</h2>
            <input value={newQText} onChange={e => setNewQText(e.target.value)} placeholder="質問文" />
            <button onClick={addQuestion}>質問追加</button>
            
            <ul>
              {questions.map(q => (
                <li key={q.id} style={{ marginBottom: '8px', listStyle: 'none' }}>
                  <span 
                    onClick={() => selectQuestion(q)} 
                    style={{ 
                      cursor: 'pointer', 
                      color: selectedQ?.id === q.id ? 'blue' : 'black',
                      fontWeight: selectedQ?.id === q.id ? 'bold' : 'normal',
                      textDecoration: selectedQ?.id === q.id ? 'underline' : 'none'
                    }}
                  >
                    ID:{q.id} - {q.question_text}
                  </span>
                  <button 
                    onClick={() => deleteQuestion(q.id)} 
                    style={{ marginLeft: '10px', color: 'red', fontSize: '0.7em', padding: '2px 5px' }}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>

            {selectedQ && (
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3>選択肢の追加 (質問ID:{selectedQ.id})</h3>
                <input placeholder="選択肢テキスト" value={choiceText} onChange={e => setChoiceText(e.target.value)} /><br/>
                <input placeholder="次質問ID (結果なら0)" type="number" value={nextQId} onChange={e => setNextQId(parseInt(e.target.value))} /><br/>
                <input placeholder="紐づく結果ラベル" value={choiceLabel} onChange={e => setChoiceLabel(e.target.value)} /><br/>
                <button onClick={addChoice}>選択肢保存</button>
                
                <ul style={{ marginTop: '15px' }}>
                  {choices.map(c => (
                    <li key={c.id} style={{ marginBottom: '5px' }}>
                      {c.choice_text} (→ {c.next_question_id}) [ラベル:{c.label}]
                      <button 
                        onClick={() => deleteChoice(c.id)} 
                        style={{ marginLeft: '10px', color: 'red', fontSize: '0.7em' }}
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
            <h2>3. 診断結果の設定</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <input placeholder="ラベル (選択肢と合わせる)" value={resLabel} onChange={e => setResLabel(e.target.value)} />
              <input placeholder="結果タイトル" value={resTitle} onChange={e => setResTitle(e.target.value)} />
              <textarea placeholder="結果説明" value={resDesc} onChange={e => setResDesc(e.target.value)} />
              <input placeholder="画像URL" value={resImageUrl} onChange={e => setResImageUrl(e.target.value)} />
              <input placeholder="LINE等のURL" value={resUrl} onChange={e => setResUrl(e.target.value)} />
              <input placeholder="詳しく見るURL (ブログなど)" value={resDetailUrl} onChange={e => setResDetailUrl(e.target.value)} />
              <button onClick={addResult}>結果を保存</button>
            </div>
            <ul>
              {results.map(r => (
                <li key={r.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                  <b>{r.type_label}</b>: {r.result_title}
                  <button 
                    onClick={() => deleteResult(r.id)} 
                    style={{ marginLeft: '10px', color: 'red', fontSize: '0.7em' }}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;