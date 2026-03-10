import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE || "";

const DiagnosisPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [questions, setQuestions] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<number | 'start' | 'loading' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalResult, setFinalResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dId = id || "1";
        const qData = await fetch(`${API_BASE}/questions?diagnosis_id=${dId}`).then(r => r.json());
        setQuestions(Array.isArray(qData) ? qData : []);
        const cData = await fetch(`${API_BASE}/choices`).then(r => r.json());
        setChoices(Array.isArray(cData) ? cData : []);
        const rData = await fetch(`${API_BASE}/results?diagnosis_id=${dId}`).then(r => r.json());
        setResults(rData);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [id]);

  const handleChoice = (choice: any) => {
    if (choice.label) {
      setFinalResult(results.find(r => r.label === choice.label));
      setCurrentStep('loading');
      setTimeout(() => setCurrentStep('result'), 2500); 
    } else {
      const nextIdx = choice.next_question_id 
        ? questions.findIndex(q => q.id === choice.next_question_id)
        : currentQuestionIndex + 1;
      if (nextIdx !== -1 && nextIdx < questions.length) {
        setCurrentQuestionIndex(nextIdx);
      }
    }
  };

  // 1. 開始画面（専門的で落ち着いたデザイン）
  if (currentStep === 'start') {
    return (
      <div className="card fade-in">
        <div style={{ fontSize: '50px', marginBottom: '20px', color: '#555' }}>📋</div>
        <h2 style={{ color: '#333', fontSize: '22px', fontWeight: 'bold' }}>診断を開始します</h2>
        <div style={{ height: '20px' }}></div>
        <button onClick={() => setCurrentStep(0)} className="main-btn">診断をはじめる</button>
      </div>
    );
  }
// 2. 解析中（CSSファイルを使わず、直接動かす仕組み）
  if (currentStep === 'loading') {
    return (
      <div style={{ background: '#fff', padding: '60px 30px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
          {/* 直接スタイルで回転させる設定 */}
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #333',
            borderRadius: '50%',
            animation: 'spin-pure 1s linear infinite'
          }}></div>
        </div>
        <h3 style={{ color: '#555', letterSpacing: '2px', margin: 0, fontWeight: 'normal' }}>解析中...</h3>
        
        {/* この場所に直接アニメーションの定義を埋め込みます */}
        <style>{`
          @keyframes spin-pure {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 3. 結果
  if (currentStep === 'result') {
    return (
      <div className="card fade-in">
        {finalResult?.image_url && <img src={finalResult.image_url} className="res-img" alt="結果" />}
        <h2 style={{ color: '#333', margin: '20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{finalResult?.title}</h2>
        <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left', color: '#444', lineHeight: '1.8', fontSize: '15px' }}>{finalResult?.description}</p>
        <div style={{ marginTop: '30px' }}>
          {finalResult?.external_url && <a href={finalResult.external_url} target="_blank" rel="noreferrer" className="line-btn">LINEで直接、相談する</a>}
          {finalResult?.info_url && <a href={finalResult.info_url} target="_blank" rel="noreferrer" className="info-btn">もっと詳しく見る</a>}
        </div>
        <button onClick={() => window.location.reload()} className="back-btn">最初に戻る</button>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];
  if (!q) return <div className="card">データを読み込んでいます...</div>;

  return (
    <div className="card" key={currentQuestionIndex}>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div></div>
      <p style={{ color: '#999', fontSize: '12px', marginBottom: '10px' }}>問 {currentQuestionIndex + 1} / {questions.length}</p>
      <h3 style={{ color: '#333', marginBottom: '35px', lineHeight: '1.5', fontWeight: 'bold' }}>{q.question_text}</h3>
      <div className="choice-container">
        {choices.filter(c => c.question_id === q.id).map(c => (
          <button key={c.id} onClick={() => handleChoice(c)} className="choice-item">{c.choice_text}</button>
        ))}
      </div>

      <style>{`
.card { background: #fff; padding: 60px 30px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: center; }
        
        /* 回転リングの修正版 */
        .spinner-fix {
          width: 40px !important;
          height: 40px !important;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #333; /* リングの動く部分を黒に */
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: spin-re 0.8s linear infinite;
        }

        /* アニメーション名を変更してキャッシュを回避 */
        @keyframes spin-re {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fade-in { animation: fadeIn 0.4s ease-in; }
        
        .main-btn { width: 100%; padding: 18px; border-radius: 4px; background: #333; color: white; border: none; font-weight: bold; font-size: 16px; cursor: pointer; }
        .main-btn:hover { background: #000; }

        .choice-item { width: 100%; padding: 16px; margin-bottom: 12px; border: 1px solid #eee; border-radius: 4px; background: #fff; color: #333; font-size: 16px; cursor: pointer; text-align: left; padding-left: 20px; transition: background 0.2s; }
        .choice-item:hover { background: #f9f9f9; border-color: #ccc; }

        .res-img { width: calc(100% + 60px); margin: -60px -30px 25px -30px; max-height: 280px; object-fit: cover; }
        .line-btn { display: block; padding: 16px; background: #06C755; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold; }
        .info-btn { display: block; padding: 16px; background: #333; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; font-weight: bold; }
        .back-btn { background: none; border: none; color: #999; text-decoration: underline; margin-top: 30px; cursor: pointer; }

        .progress-bar { width: 100%; height: 4px; background: #eee; border-radius: 2px; margin-bottom: 30px; overflow: hidden; }
        .progress-fill { height: 100%; background: #333; transition: 0.4s; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`}</style>
    </div>
  );
};

export default DiagnosisPlayer;