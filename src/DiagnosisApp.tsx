import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DiagnosisApp: React.FC = () => {
  const { id: paramsId } = useParams();
  const id = paramsId || window.location.pathname.split('/').pop();

  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null); 
  const [currentQuestion, setCurrentQuestion] = useState<any>(null); 
  const [result, setResult] = useState<any>(null); 
  const [isStarted, setIsStarted] = useState(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === "diagnoses") {
      setLoading(false);
      return;
    }

    setLoading(true);
    // 診断セットの基本情報を取得（ここに detail_url が含まれています）
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}`)
      .then(res => res.json())
      .then(data => {
        setDiagnosisInfo({
          ...data,
          displayTitle: data.name || data.title || "無題の診断"
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("データ取得エラー:", err);
        setLoading(false);
      });
  }, [id]);

  const startDiagnosis = () => {
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}/questions/first`)
      .then(res => res.json())
      .then(data => {
        setCurrentQuestion(data);
        setIsStarted(true);
      });
  };

  const handleAnswer = (nextId: number, label: string) => {
    if (nextId === 0) {
      fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}/results`)
        .then(res => res.json())
        .then(results => {
          const found = results.find((r: any) => r.type_label === label);
          setResult(found);
        });
    } else {
      fetch(`https://diagnosis-app-final.onrender.com/api/questions/detail/${nextId}`)
        .then(res => res.json())
        .then(data => setCurrentQuestion(data));
    }
  };

  if (loading && !diagnosisInfo) return <div style={{ textAlign: 'center', padding: '50px' }}>読み込み中...</div>;
  if (!diagnosisInfo) return <div style={{ textAlign: 'center', padding: '50px' }}>データが見つかりませんでした。</div>;

  if (!isStarted && diagnosisInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '1.8em', color: '#444', marginBottom: '20px', fontWeight: 'bold' }}>{diagnosisInfo.displayTitle}</h1>
          {diagnosisInfo.image_url && (
            <div style={{ marginBottom: '20px', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          <p style={{ color: '#777', lineHeight: '1.8', marginBottom: '30px', fontSize: '1.1em', whiteSpace: 'pre-wrap' }}>
            {diagnosisInfo.description || "あなたにぴったりのメニューを提案します。"}
          </p>
          <button onClick={startDiagnosis} style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer' }}>
            診断をはじめる
          </button>
        </div>
      </div>
    );
  }

if (result) {
    const resultTitle = result.result_title || result.title || "診断結果";
    const resultContent = result.result_description || result.content || "";
    
    const detailUrl = result?.detail_url || diagnosisInfo.detail_url || "https://www.google.com";
    const lineFriendUrl = "https://line.me/R/ti/p/@https://lin.ee/oI5hgBo";

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px', fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '30px auto', textAlign: 'center', padding: '40px 25px', backgroundColor: '#fff', borderRadius: '40px', boxShadow: '0 15px 40px rgba(255, 142, 142, 0.1)' }}>
          
          {/* サブタイトル */}
          <p style={{ color: '#ff8e8e', fontWeight: 'bold', fontSize: '0.9em', letterSpacing: '0.1em', marginBottom: '10px' }}>YOUR DIAGNOSIS</p>
          
          {/* メインタイトル：文字間隔を広げておしゃれに */}
          <h1 style={{ fontSize: '1.7em', color: '#444', marginBottom: '30px', fontWeight: 'bold', lineHeight: '1.4' }}>
            {resultTitle}
          </h1>

          {/* 画像：角を丸くして柔らかい印象に */}
          {result.image_url && (
            <div style={{ marginBottom: '30px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
              <img src={result.image_url} alt="Result" style={{ width: '100%', display: 'block' }} />
            </div>
          )}

          {/* 説明文エリア：背景色をさらに薄くし、行間を広げて読みやすく */}
          <div style={{ textAlign: 'left', backgroundColor: '#fffaf9', padding: '25px', borderRadius: '25px', marginBottom: '40px', border: '1px dashed #ffcaca' }}>
            <p style={{ color: '#555', lineHeight: '2.0', fontSize: '1.05em', whiteSpace: 'pre-wrap', margin: 0 }}>
              {resultContent}
            </p>
          </div>

          {/* ボタンエリア */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 142, 142, 0.3)', transition: 'transform 0.2s' }}>
                結果をもっと詳しく見る
              </button>
            </a>
            
            <a href={lineFriendUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '18px', backgroundColor: '#fff', color: '#06C755', border: '2px solid #06C755', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer' }}>
                LINEで相談してみる
              </button>
            </a>
          </div>

          <button onClick={() => window.location.reload()} style={{ marginTop: '30px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9em' }}>
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }
  if (currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.4em', marginBottom: '30px', textAlign: 'center', color: '#555' }}>{currentQuestion.question_text}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <QuestionChoices questionId={currentQuestion.id} onSelect={handleAnswer} />
          </div>
        </div>
      </div>
    );
  }
  return null;
};
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
  onMouseEnter={() => { console.log("Mouse Enter!"); setHoveredId(c.id); }} // 🌟ログを追加
  onMouseLeave={() => setHoveredId(null)}
  style={{ 
    padding: '20px', 
    border: '2px solid #ff8f8f', // 🌟1文字変更
    borderRadius: '15px', 
    backgroundColor: hoveredId === c.id ? '#fff0f0' : '#ffffff', 
    cursor: 'pointer', 
    fontSize: '1.05em', 
    textAlign: 'left', 
    color: '#444',
    transition: 'all 0.3s ease-out', // 🌟時間を少し伸ばす
    transform: hoveredId === c.id ? 'translateY(-4px)' : 'translateY(0)', // 🌟高さを変える
    boxShadow: hoveredId === c.id ? '0 8px 20px rgba(255, 142, 142, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
    display: 'block',
    width: '100%',
    marginBottom: '15px',
    outline: 'none'
  }}
>
  {c.choice_text}
</button>
))}
    </>
  );
};
export default DiagnosisApp;