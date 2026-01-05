import { useState, useEffect } from 'react';

// --- パーツ：選択肢 ---
const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(setChoices);
  }, [questionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {choices.map((c: any) => (
        <button key={c.id} onClick={() => onSelect(c.next_question_id, c.label)} style={{ padding: '15px', border: '2px solid #ff8e8e', borderRadius: '10px', backgroundColor: '#fff', cursor: 'pointer' }}>
          {c.choice_text}
        </button>
      ))}
    </div>
  );
};

// --- メイン：診断アプリ ---
export default function DiagnosisApp() {
  // 🌟 ここで変数を定義（ここから関数の終わりまでが有効範囲）
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 🌟 関数の「内側」でデータ取得
  useEffect(() => {
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses')
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && data.length > 0) {
          setDiagnosisInfo(data[data.length - 1]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const startDiagnosis = () => {
    if (!diagnosisInfo) return;
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/questions`)
      .then(res => res.json())
      .then(data => { if (data.length > 0) setCurrentQuestionId(data[0].id); });
  };

  const onSelectChoice = (nextId: number, label: string) => {
    const newHistory = [...history, label];
    setHistory(newHistory);
    if (nextId) {
      setCurrentQuestionId(nextId);
    } else {
      setIsCalculating(true);
      setCurrentQuestionId(null);
      const counts: any = {};
      newHistory.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      const finalLabel = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/results/${finalLabel}`)
        .then(res => res.json())
        .then(data => {
          setTimeout(() => {
            setResult(data);
            setIsCalculating(false);
          }, 2500);
        });
    }
  };

  // 🌟 画面表示のルール
  if (!diagnosisInfo) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;

  if (isCalculating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fffaf9' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff8e8e', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <h2 style={{ color: '#ff8e8e' }}>結果を解析中です...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{result.result_title}</h1>
        <p>{result.result_description}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '5px' }}>最初に戻る</button>
      </div>
    );
  }

  if (currentQuestionId) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>質問に答えてください</h2>
        <QuestionChoices questionId={currentQuestionId} onSelect={onSelectChoice} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>{diagnosisInfo.name}</h1>
      <p>{diagnosisInfo.description}</p>
      <button onClick={startDiagnosis} style={{ padding: '20px 40px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold' }}>診断をはじめる</button>
    </div>
  );
} // 🌟 ここが DiagnosisApp 関数の終わり