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
      <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        {/* displayTitle を使うように変更 */}
        <h1 style={{ fontSize: '1.6em', color: '#333', marginBottom: '20px' }}>
          {diagnosisInfo.displayTitle}
        </h1>
        {diagnosisInfo.image_url && (
          <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', borderRadius: '15px', marginBottom: '20px', objectFit: 'cover' }} />
        )}
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px', whiteSpace: 'pre-wrap', padding: '0 10px' }}>
          {diagnosisInfo.description || "あなたにぴったりのメニューを提案します。"}
        </p>
        <button 
          onClick={startDiagnosis}
          style={{ width: '100%', padding: '18px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '35px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer' }}
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
        {result.image_url && <img src={result.image_url} style={{ width: '100%', borderRadius: '15px' }} alt="Result" />}
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
          <QuestionChoices questionId={currentQuestion.id} onSelect={handleAnswer} />
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