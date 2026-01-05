import { useState, useEffect } from 'react';

// --- 質問の選択肢を表示するパーツ ---
const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(data => setChoices(data));
  }, [questionId]);

  return (
    <>
      {choices.map((c: any) => (
        <button 
          key={c.id} 
          onClick={() => onSelect(c.next_question_id, c.label)} 
          onMouseEnter={() => setHoveredId(c.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ 
            padding: '20px', 
            border: '2px solid #ff8e8e', 
            borderRadius: '15px', 
            backgroundColor: hoveredId === c.id ? '#fff0f0' : '#ffffff', 
            cursor: 'pointer', 
            fontSize: '1.05em', 
            textAlign: 'left', 
            color: '#444',
            transition: 'all 0.25s ease',
            transform: hoveredId === c.id ? 'translateY(-3px)' : 'translateY(0)',
            boxShadow: hoveredId === c.id ? '0 6px 15px rgba(255, 142, 142, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
            display: 'block',
            width: '100%',
            marginBottom: '15px',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {c.choice_text}
        </button>
      ))}
    </>
  );
};

// --- メインの診断アプリ ---
export default function DiagnosisApp() {
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 初回読み込み
  useEffect(() => {
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses')
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && data.length > 0) {
          setDiagnosisInfo(data[data.length - 1]);
        }
      })
      .catch(err => console.error("初期読み込みエラー:", err));
  }, []);

  const startDiagnosis = () => {
    if (!diagnosisInfo) return;
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/questions`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setCurrentQuestionId(data[0].id);
      });
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
        })
        .catch(err => {
          console.error("結果取得エラー:", err);
          setIsCalculating(false);
        });
    }
  };

  // 表示の分岐処理
  if (!diagnosisInfo) return <div style={{ textAlign: 'center', marginTop: '50px' }}>読み込み中...</div>;

  if (isCalculating) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff8e8e',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 25px'
          }}></div>
          <h2 style={{ color: '#ff8e8e', fontSize: '1.2em' }}>診断結果を解析しています...</h2>
          <p style={{ color: '#aaa', fontSize: '0.9em' }}>あなたに最適なプランを見つけています</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (result) {
    const resultTitle = result.result_title || result.title || "診断結果";
    const resultContent = result.result_description || result.content || "";
    const detailUrl = result?.detail_url || diagnosisInfo.detail_url || "https://www.google.com";
    const lineFriendUrl = "https://line.me/R/ti/p/ここにあなたのLINEリンク";

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px' }}>
        <div style={{ maxWidth: '500px', margin: '30px auto', textAlign: 'center', padding: '40px 25px', backgroundColor: '#fff', borderRadius: '40px', boxShadow: '0 15px 40px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.7em', color: '#444', marginBottom: '30px' }}>{resultTitle}</h1>
          {result.image_url && <img src={result.image_url} alt="Result" style={{ width: '100%', borderRadius: '20px', marginBottom: '30px' }} />}
          <p style={{ textAlign: 'left', lineHeight: '1.8', color: '#555', marginBottom: '40px' }}>{resultContent}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <a href={detailUrl} target="_blank" rel="noopener noreferrer"><button style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold' }}>もっと詳しく見る</button></a>
            <a href={lineFriendUrl} target="_blank" rel="noopener noreferrer"><button style={{ width: '100%', padding: '18px', backgroundColor: '#fff', color: '#06C755', border: '2px solid #06C755', borderRadius: '50px', fontWeight: 'bold' }}>LINEで相談する</button></a>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestionId) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px' }}>
        <div style={{ maxWidth: '500px', margin: '30px auto' }}>
          <h2 style={{ textAlign: 'center', color: '#444', marginBottom: '30px' }}>質問に答えてください</h2>
          <QuestionChoices questionId={currentQuestionId} onSelect={onSelectChoice} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', backgroundColor: '#fff', padding: '40px 25px', borderRadius: '40px', boxShadow: '0 15px 40px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '1.8em', color: '#444', marginBottom: '20px' }}>{diagnosisInfo.name}</h1>
        {diagnosisInfo.image_url && <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', borderRadius: '20px', marginBottom: '30px' }} />}
        <p style={{ color: '#666', marginBottom: '40px' }}>{diagnosisInfo.description}</p>
        <button onClick={startDiagnosis} style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2em' }}>診断をはじめる</button>
      </div>
    </div>
  );
}