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
          <button onClick={startDiagnosis} style={{ width: '100%', padding: '20px', backgroundColor: '#8d6e63', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer' }}>
            診断をはじめる
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const resultTitle = result.result_title || result.title || "診断結果";
    const resultContent = result.result_description || result.content || "あなたにぴったりのメニューが見つかりました。";
    
    // 【最重要】diagnosisInfo から detail_url を確実に取得する
    // 保存されたデータを確認するため、まずは diagnosisInfo.detail_url を最優先にします
const detailUrl = result.detail_url || diagnosisInfo.detail_url || "https://www.google.com";
    const lineFriendUrl = "https://line.me/R/ti/p/@https://lin.ee/oI5hgBo";

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '1.8em', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>{resultTitle}</h1>
          {result.image_url && (
            <div style={{ marginBottom: '20px', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={result.image_url} alt="Result" style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          <div style={{ textAlign: 'left', backgroundColor: '#fafafa', padding: '20px', borderRadius: '20px', marginBottom: '30px', border: '1px solid #f0f0f0' }}>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05em', whiteSpace: 'pre-wrap' }}>{resultContent}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '18px', backgroundColor: '#8d6e63', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer' }}>
                結果をもっと詳しく見る
              </button>
            </a>
            <a href={lineFriendUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '18px', backgroundColor: '#06C755', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer' }}>
                LINEで友だちになる
              </button>
            </a>
          </div>
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
  useEffect(() => {
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`).then(res => res.json()).then(data => setChoices(data));
  }, [questionId]);
  return (
    <>
      {choices.map((c: any) => (
        <button key={c.id} onClick={() => onSelect(c.next_question_id, c.label)} style={{ padding: '20px', border: '2px solid #f0f0f0', borderRadius: '15px', background: '#fff', cursor: 'pointer', fontSize: '1.05em', textAlign: 'left', color: '#444' }}>
          {c.choice_text}
        </button>
      ))}
    </>
  );
};

export default DiagnosisApp;