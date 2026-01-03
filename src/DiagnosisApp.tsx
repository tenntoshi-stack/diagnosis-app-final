import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DiagnosisApp: React.FC = () => {
  const { id } = useParams(); // URLから診断IDを取得
  
  // 状態管理
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null); // 診断セットのタイトル・説明・画像
  const [currentQuestion, setCurrentQuestion] = useState<any>(null); // 現在の質問
  const [result, setResult] = useState<any>(null); // 診断結果
  const [isStarted, setIsStarted] = useState(false); // 診断が始まったかどうか
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]); // 質問リスト用の状態

// 1. 診断セットの基本情報と質問リストを同時に取得
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}`)
      .then(res => res.json())
      .then(data => {
        // 取得したデータ（data）の中に questions という名前で質問リストが入っている前提
        setDiagnosisInfo({
          title: data.name || data.title,
          description: data.description,
          image: data.image_url
        });

        // 質問データがあればセットする
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions); // 質問リストを保持するStateへ
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("データ取得エラー:", err);
        setLoading(false);
      });
  }, [id]);
  // 2. 診断を開始する（最初の質問を取得）
  const startDiagnosis = () => {
fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}/questions/first`)
    .then(res => res.json())
      .then(data => {
        setCurrentQuestion(data);
        setIsStarted(true);
      });
  };

  // 3. 回答を選択した時の処理
  const handleAnswer = (nextId: number, label: string) => {
    if (nextId === 0) {
      // 結果を表示（ラベルで検索）
fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}/results`)
      .then(res => res.json())
        .then(results => {
          const found = results.find((r: any) => r.type_label === label);
          setResult(found);
        });
    } else {
      // 次の質問を表示
fetch(`https://diagnosis-app-final.onrender.com/api/questions/detail/${nextId}`)
      .then(res => res.json())
        .then(data => setCurrentQuestion(data));
    }
  };

  // 4. ローディング中
  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>読み込み中...</div>;

  // --- A. 診断トップ画面（開始前） ---
  if (!isStarted && diagnosisInfo) {
    return (
      <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.6em', color: '#333', marginBottom: '20px' }}>{diagnosisInfo.name}</h1>
        {diagnosisInfo.image_url && (
          <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', borderRadius: '15px', marginBottom: '20px', objectFit: 'cover' }} />
        )}
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px', whiteSpace: 'pre-wrap', padding: '0 10px' }}>
          {diagnosisInfo.description || "あなたにぴったりのメニューを提案します。"}
        </p>
        <button 
          onClick={startDiagnosis}
          style={{ width: '100%', padding: '18px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '35px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
        >
          診断をはじめる
        </button>
      </div>
    );
  }

  // --- B. 診断結果画面 ---
  if (result) {
    return (
      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#8d6e63' }}>診断結果</h2>
        <h1 style={{ fontSize: '1.5em', margin: '20px 0' }}>{result.result_title}</h1>
        {result.image_url && <img src={result.image_url} style={{ width: '100%', borderRadius: '15px' }} />}
        <p style={{ textAlign: 'left', lineHeight: '1.8', margin: '25px 0', whiteSpace: 'pre-wrap' }}>{result.result_description}</p>
        {result.recommend_url && (
          <a href={result.recommend_url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '15px', background: '#8d6e63', color: '#fff', textDecoration: 'none', borderRadius: '8px', marginBottom: '10px' }}>
            おすすめ商品を見る
          </a>
        )}
        <button onClick={() => window.location.reload()} style={{ background: 'none', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          もう一度診断する
        </button>
      </div>
    );
  }

  // --- C. 質問表示画面 ---
  if (currentQuestion) {
    return (
      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
        <h2 style={{ fontSize: '1.3em', marginBottom: '30px', textAlign: 'center' }}>{currentQuestion.question_text}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* 選択肢の取得（※簡易化のため別途fetchが必要な場合がありますが、既存のDB構造から取得） */}
          <QuestionChoices questionId={currentQuestion.id} onSelect={handleAnswer} />
        </div>
      </div>
    );
  }

  return null;
};

// 選択肢を表示するためのサブコンポーネント
const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  useEffect(() => {
fetch(`https://www.google.com/search?q=https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
    .then(res => res.json())
      .then(data => setChoices(data));
  }, [questionId]);

  return (
    <>
      {choices.map((c: any) => (
        <button 
          key={c.id} 
          onClick={() => onSelect(c.next_question_id, c.label)}
          style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', cursor: 'pointer', fontSize: '1em', textAlign: 'left' }}
        >
          {c.choice_text}
        </button>
      ))}
    </>
  );
};

export default DiagnosisApp;