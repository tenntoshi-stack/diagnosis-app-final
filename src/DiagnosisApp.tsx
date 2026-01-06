import { useState, useEffect } from 'react';
// 🌟 URLからIDを読み取るための部品を追加
import { useParams } from 'react-router-dom';

const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(setChoices)
      .catch(err => console.error(err));
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

export default function DiagnosisApp() {
  // 🌟 URL末尾のID（3など）を取得します
  const { id } = useParams();
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // 🌟 IDがあればその番号を、なければ最新(latest)を取得
    const targetId = id || 'latest';
    const targetUrl = `https://diagnosis-app-final.onrender.com/api/diagnoses/${targetId}`;

    fetch(targetUrl)
      .then(res => res.json())
      .then(data => {
        if (data) setDiagnosisInfo(data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
      });
  }, [id]); // 🌟 IDが変わるたびに実行

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
  if (result) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>{result.result_title}</h1>
      <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{result.result_description}</p>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>最初に戻る</button>
    </div>
  );

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
      {diagnosisInfo.image_url && <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', marginBottom: '20px' }} />}
      <button onClick={startDiagnosis} style={{ padding: '20px 40px', background: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>診断をはじめる</button>
    </div>
  );
}