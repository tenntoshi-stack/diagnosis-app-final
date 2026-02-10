import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = "https://diagnosis-app-final.onrender.com/api";

const DiagnosisPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [questions, setQuestions] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<number | 'start' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qRes = await fetch(`${API_BASE}/questions?diagnosis_id=${id}`);
        setQuestions(await qRes.json() || []);
        
        const cRes = await fetch(`${API_BASE}/choices`);
        setChoices(await cRes.json() || []);
        
        const rRes = await fetch(`${API_BASE}/results?diagnosis_id=${id}`);
        setResults(await rRes.json() || []);
      } catch (error) {
        console.error("データ読み込みエラー:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleChoice = (choice: any) => {
    if (choice.label) {
      const res = results.find(r => r.label === choice.label);
      setFinalResult(res);
      setCurrentStep('result');
    } else if (choice.next_question_id) {
      const nextIdx = questions.findIndex(q => q.id === choice.next_question_id);
      if (nextIdx !== -1) setCurrentQuestionIndex(nextIdx);
    } else {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  if (currentStep === 'start') {
    return (
      <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color: '#5a5a5a', marginBottom: '30px' }}>診断の準備ができました</h2>
        <button onClick={() => setCurrentStep(0)} style={{ padding: '15px 40px', fontSize: '18px', background: '#ff8e8e', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
          診断をスタートする
        </button>
      </div>
    );
  }

  if (currentStep === 'result') {
    return (
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        {finalResult?.image_url && <img src={finalResult.image_url} style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} alt="結果画像" />}
        <h2 style={{ color: '#ff8e8e', marginBottom: '15px' }}>{finalResult?.title}</h2>
        <p style={{ whiteSpace: 'pre-wrap', color: '#666', lineHeight: '1.8', textAlign: 'left', marginBottom: '25px' }}>{finalResult?.description}</p>
        
        {finalResult?.external_url && (
          <a href={finalResult.external_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '15px', background: '#00b900', color: 'white', textDecoration: 'none', borderRadius: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
            LINEで相談する
          </a>
        )}
        {finalResult?.info_url && (
          <a href={finalResult.info_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '15px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
             もっと詳しく見る
          </a>
        )}
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', textDecoration: 'underline' }}>最初に戻る</button>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];
  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <p style={{ color: '#bbb', fontSize: '13px' }}>Q {currentQuestionIndex + 1} / {questions.length}</p>
      <h3 style={{ color: '#5a5a5a', marginBottom: '30px' }}>{q?.question_text}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {choices.filter(c => c.question_id === q?.id).map(c => (
          <button key={c.id} onClick={() => handleChoice(c)} style={{ padding: '15px', border: '2px solid #fef0f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontSize: '16px', color: '#666' }}>
            {c.choice_text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiagnosisPlayer;