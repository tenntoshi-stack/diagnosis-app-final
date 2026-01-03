import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const DiagnosisApp: React.FC = () => {
  const { id: paramsId } = useParams(); // URLパラメータから取得
  
  // 予備策：paramsIdが空の場合、URLの末尾から数字を直接抜き取る
  const id = paramsId || window.location.pathname.split('/').pop();

  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null); 
  const [currentQuestion, setCurrentQuestion] = useState<any>(null); 
  const [result, setResult] = useState<any>(null); 
  const [isStarted, setIsStarted] = useState(false); 
  const [loading, setLoading] = useState(true);

  // 1. 診断セットの情報を取得
  useEffect(() => {
    console.log("判定された診断ID:", id); // 👈 IDが正しく認識されているか確認

    if (!id || id === "diagnoses") {
      // IDが取れていない場合は読み込みを止める
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log("届いたデータ詳細:", data); // 👈 データの中身を確認
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
  // 2. 診断を開始する
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

// loadingがtrue、かつ diagnosisInfo がまだ空の場合だけ「読み込み中」を出す
  if (loading && !diagnosisInfo) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>読み込み中... (サーバーからの応答を待っています)</div>;
  }

  // もしデータ取得に失敗して diagnosisInfo が無い場合
  if (!diagnosisInfo) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>データが見つかりませんでした。URLを確認してください。</div>;
  }
// --- A. 診断トップ画面（開始前） ---
  if (!isStarted && diagnosisInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '1.8em', color: '#444', marginBottom: '20px', fontWeight: 'bold' }}>
            {diagnosisInfo.displayTitle}
          </h1>
          {diagnosisInfo.image_url && (
            <div style={{ marginBottom: '20px', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          <p style={{ color: '#777', lineHeight: '1.8', marginBottom: '30px', fontSize: '1.1em', whiteSpace: 'pre-wrap' }}>
            {diagnosisInfo.description || "あなたにぴったりのメニューを提案します。"}
          </p>
          <button 
            onClick={startDiagnosis}
            style={{ width: '100%', padding: '20px', backgroundColor: '#8d6e63', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(141, 110, 99, 0.4)' }}
          >
            診断をはじめる
          </button>
        </div>
      </div>
    );
  }
// --- B. 診断結果画面 ---
  if (result) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2em', color: '#8d6e63', marginBottom: '10px' }}>診断結果</h2>
          <h1 style={{ fontSize: '1.8em', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>
            {result.title}
          </h1>
          
          {result.image_url && (
            <div style={{ marginBottom: '20px', borderRadius: '20px', overflow: 'hidden' }}>
              <img src={result.image_url} alt="Result" style={{ width: '100%', display: 'block' }} />
            </div>
          )}

          <div style={{ textAlign: 'left', backgroundColor: '#fafafa', padding: '20px', borderRadius: '20px', marginBottom: '30px' }}>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05em', whiteSpace: 'pre-wrap' }}>
              {result.content}
            </p>
          </div>

          {/* LINEなどのURLへ飛ばすボタン */}
          <a 
            href="https://line.me/R/ti/p/@あなたのLINEのIDなど" // 👈 ここを実際のURLに書き換えてください
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button 
              style={{ 
                width: '100%', 
                padding: '20px', 
                backgroundColor: '#06C755', // LINE風の緑
                color: '#fff', 
                border: 'none', 
                borderRadius: '50px', 
                fontSize: '1.2em', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)' 
              }}
            >
              結果をもっと詳しく見る
            </button>
          </a>
        </div>
      </div>
    );
  }
// --- C. 質問表示画面 ---
  if (currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfbfb', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.4em', marginBottom: '30px', textAlign: 'center', color: '#555', lineHeight: '1.5' }}>
            {currentQuestion.question_text}
          </h2>
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
    // Google検索のURLを削除し、正しいAPIのURLに修正しました
    fetch(`https://diagnosis-app-final.onrender.com/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(data => setChoices(data));
  }, [questionId]);

  return (
    <>
      {choices.map((c: any) => (
// 選択肢ボタンのデザイン
<button 
  key={c.id} 
  onClick={() => onSelect(c.next_question_id, c.label)}
  style={{ 
    padding: '20px', 
    border: '2px solid #f0f0f0', 
    borderRadius: '15px', 
    background: '#fff', 
    cursor: 'pointer', 
    fontSize: '1.05em', 
    textAlign: 'left',
    transition: '0.2s',
    color: '#444'
  }}
>
  {c.choice_text}
</button>
))}
    </>
  );
};

export default DiagnosisApp;