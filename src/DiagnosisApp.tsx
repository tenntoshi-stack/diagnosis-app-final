import { useState, useEffect } from 'react';
// 🌟 react-router-dom を使って URL の数字を読み取ります
import { useParams } from 'react-router-dom'; 

export default function DiagnosisApp() {
  const { id } = useParams(); // 🌟 これで URL の /diagnoses/3 の "3" を取得できます
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
// --- サブパーツ: 選択肢 ---
const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
useEffect(() => {
    // 🌟 id があればその番号を、なければ最新(latest)を取りに行くようにします
    const targetId = id || 'latest';
    const targetUrl = `https://diagnosis-app-final.onrender.com/api/diagnoses/${targetId}`;

    fetch(targetUrl)
      .then(res => res.json())
      .then(data => {
        if (data) setDiagnosisInfo(data);
      })
      .catch(err => console.error(err));
  }, [id]); // 🌟 [id] を入れることで、番号が変わるたびに読み直します
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

// --- メイン: 診断アプリ ---
export default function DiagnosisApp() {
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses/latest')
      .then(res => res.text())
      .then(text => {
        if (!text) return;
        const data = JSON.parse(text);
        if (data) setDiagnosisInfo(data);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const startDiagnosis = () => {
    if (!diagnosisInfo) return;
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/questions`)
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setCurrentQuestionId(data[0].id); });
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
      const finalLabel = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
      fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/results/${finalLabel}`)
        .then(res => res.json())
        .then(data => {
          setTimeout(() => { setResult(data); setIsCalculating(false); }, 2500);
        });
    }
  };

  if (!diagnosisInfo) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;
  if (isCalculating) return <div style={{ textAlign: 'center', marginTop: '50px' }}>解析中...</div>;
  if (result) return <div style={{ textAlign: 'center', padding: '20px' }}><h1>{result.result_title}</h1><p>{result.result_description}</p></div>;

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
      <button onClick={startDiagnosis} style={{ padding: '20px 40px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px' }}>診断をはじめる</button>
    </div>
  );
}