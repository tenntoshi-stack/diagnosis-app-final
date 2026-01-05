import { useState, useEffect } from 'react';

const QuestionChoices = ({ questionId, onSelect }: { questionId: number, onSelect: any }) => {
  const [choices, setChoices] = useState([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

useEffect(() => {
    // 🌟 ここを修正：URLを確実にデータがあるものに変更
    // もし管理画面で作成した診断のIDが「1」なら 1 を入れてください
    // IDがわからない場合は、一旦 'https://diagnosis-app-final.onrender.com/api/diagnoses' 
    // でリストの0番目を取るようにガードをかけます。
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // リストの一番新しいもの（最後に追加したもの）をセット
          setDiagnosisInfo(data[data.length - 1]);
        }
      })
      .catch(err => console.error("初期読み込みエラー:", err));
  }, []);
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

export default function DiagnosisApp() {
  const [diagnosisInfo, setDiagnosisInfo] = useState<any>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetch('https://diagnosis-app-final.onrender.com/api/diagnoses/latest')
      .then(res => res.json())
      .then(data => setDiagnosisInfo(data));
  }, []);

  const startDiagnosis = () => {
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
      // 1. まず質問画面を消して、解析中画面を出す
      setIsCalculating(true);
      setCurrentQuestionId(null);

      const counts: any = {};
      newHistory.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      const finalLabel = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

      // 2. サーバーに結果を取りに行く
      fetch(`https://diagnosis-app-final.onrender.com/api/diagnoses/${diagnosisInfo.id}/results/${finalLabel}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          // 3. データが正常に取れたら、2.5秒待ってから表示
          setTimeout(() => {
            setResult(data);
            setIsCalculating(false);
          }, 2500);
        })
        .catch(err => {
          console.error("結果取得エラー:", err);
          setIsCalculating(false);
          alert("申し訳ありません。データの取得に失敗しました。もう一度お試しください。");
          window.location.reload(); // エラー時はリロード
        });
    }
  };
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
          <h2 style={{ color: '#ff8e8e', fontSize: '1.2em', letterSpacing: '0.05em' }}>診断結果を解析しています...</h2>
          <p style={{ color: '#aaa', fontSize: '0.9em', marginTop: '10px' }}>あなたに最適なプランを見つけています</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  // 1. 結果表示画面
  if (result) {
    const resultTitle = result.result_title || result.title || "診断結果";
    const resultContent = result.result_description || result.content || "";
    const detailUrl = result?.detail_url || diagnosisInfo.detail_url || "https://www.google.com";
    const lineFriendUrl = "https://line.me/R/ti/p/ここにあなたのLINEリンク"; // 🌟あなたのLINE URLを入れてください

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '30px auto', textAlign: 'center', padding: '40px 25px 50px', backgroundColor: '#fff', borderRadius: '40px', boxShadow: '0 15px 40px rgba(255, 142, 142, 0.1)' }}>
          <p style={{ color: '#ff8e8e', fontWeight: 'bold', fontSize: '0.9em', letterSpacing: '0.1em', marginBottom: '10px' }}>YOUR DIAGNOSIS</p>
          <h1 style={{ fontSize: '1.7em', color: '#444', marginBottom: '30px', fontWeight: 'bold', lineHeight: '1.4' }}>{resultTitle}</h1>
          {result.image_url && (
            <div style={{ marginBottom: '30px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
              <img src={result.image_url} alt="Result" style={{ width: '100%', display: 'block' }} />
            </div>
          )}
          <div style={{ textAlign: 'left', backgroundColor: '#fffaf9', padding: '25px', borderRadius: '25px', marginBottom: '40px', border: '1px dashed #ffcaca' }}>
            <p style={{ color: '#555', lineHeight: '2.0', fontSize: '1.05em', whiteSpace: 'pre-wrap', margin: 0 }}>{resultContent}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <a href={detailUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 142, 142, 0.3)' }}>結果をもっと詳しく見る</button>
            </a>
            <a href={lineFriendUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '18px', backgroundColor: '#fff', color: '#06C755', border: '2px solid #06C755', borderRadius: '50px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer' }}>LINEで相談してみる</button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. 質問回答中
  if (currentQuestionId) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px' }}>
        <div style={{ maxWidth: '500px', margin: '30px auto' }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '8px 20px', backgroundColor: '#ff8e8e', color: '#fff', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '15px' }}>
              Question
            </div>
            <h2 style={{ fontSize: '1.4em', color: '#444', lineHeight: '1.5' }}>
              読み込み中... (質問文)
            </h2>
          </div>
          <QuestionChoices questionId={currentQuestionId} onSelect={onSelectChoice} />
        </div>
      </div>
    );
  }

  // 3. スタート画面
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffaf9', padding: '20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', backgroundColor: '#fff', padding: '40px 25px', borderRadius: '40px', boxShadow: '0 15px 40px rgba(255, 142, 142, 0.1)' }}>
        <h1 style={{ fontSize: '1.8em', color: '#444', marginBottom: '20px' }}>{diagnosisInfo.name}</h1>
        {diagnosisInfo.image_url && (
          <img src={diagnosisInfo.image_url} alt="Top" style={{ width: '100%', borderRadius: '20px', marginBottom: '30px' }} />
        )}
        <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '40px' }}>{diagnosisInfo.description}</p>
        <button onClick={startDiagnosis} style={{ width: '100%', padding: '20px', backgroundColor: '#ff8e8e', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.2em', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 142, 142, 0.3)' }}>
          診断をはじめる
        </button>
      </div>
    </div>
  );
}